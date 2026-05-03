// QuickFare V12 — Features, API, UI (depends on core.js loaded first)

// ========== PUBLIC API (QF namespace) ==========
window.QF={
  // State
  undo(){if(hIdx<=0)return;hIdx--;restore(history[hIdx])},
  redo(){if(hIdx>=history.length-1)return;hIdx++;restore(history[hIdx])},

  // Preset size
  applyPreset(){
    const v=document.getElementById('preset-size').value;if(v==='custom')return;
    const[w,h]=v.split('x').map(Number);
    cv.setWidth(w);cv.setHeight(h);
    cv.getObjects().forEach(o=>{
      if(o.isBackground){const s=Math.max(w/o.width,h/o.height);o.set({scaleX:s,scaleY:s,left:w/2,top:h/2})}
      if(o.isOverlay)o.set({width:w,height:h});
    });
    cv.renderAll();fitArtboard();saveState();
  },

  // Elements
  addText(){addTextObj("TYPE HERE",300,80,900,100,"Anton","#fff")},
  addCard(){addCardObj("Your compelling message goes here.\nClick to edit and customize.",600,80,700)},
  uploadImage(e){
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>addImg(ev.target.result,50,50,400);
    r.readAsDataURL(f);toast("Image uploaded");
  },

  // Floating toolbar controls
  setFont(v){const o=cv.getActiveObject();if(o&&o.type==='textbox'){o.set('fontFamily',v);cv.requestRenderAll();saveState()}},
  setSize(v){const o=cv.getActiveObject();if(o&&o.type==='textbox'){o.set('fontSize',parseInt(v));cv.requestRenderAll();saveState()}},
  setColor(v){const o=cv.getActiveObject();if(o&&o.type==='textbox'){o.set('fill',v);cv.requestRenderAll();saveState()}},
  zIndex(d){const o=cv.getActiveObject();if(o){d>0?cv.bringForward(o):cv.sendBackwards(o);saveState();updateLayers()}},
  deleteActive(){const o=cv.getActiveObject();if(o){cv.remove(o);cv.discardActiveObject();hideToolbar();updateLayers();saveState()}},
  selectLayer(i){const o=cv.getObjects()[i];if(o){cv.setActiveObject(o);cv.requestRenderAll()}},
  delLayer(i){const o=cv.getObjects()[i];if(o){cv.remove(o);saveState()}},

  // Filters
  applyFilters(){
    const bl=parseInt(document.getElementById('f-blur').value);
    const br=parseInt(document.getElementById('f-bright').value)/100;
    let bg=null;cv.getObjects().forEach(o=>{if(o.isBackground)bg=o});
    if(bg){bg.filters=[];if(bl>0)bg.filters.push(new fabric.Image.filters.Blur({blur:bl/20}));bg.filters.push(new fabric.Image.filters.Brightness({brightness:br-1}));bg.applyFilters();cv.requestRenderAll();setTimeout(saveState,300)}
  },

  // Templates
  loadTemplate(t){
    cv.clear();cv.backgroundColor='#000';
    if(t==='cover'){document.getElementById('preset-size').value='1748x2480';QF.applyPreset();addTextObj("ULTIMATE\nGUIDE",400,100,1500,200,"Anton","#00F0FF")}
    else if(t==='viral'){document.getElementById('preset-size').value='1080x1920';QF.applyPreset();addTextObj("3 SECRET\nWEBSITES",300,50,980,150,"Anton","#FF0050")}
    else if(t==='quote'){document.getElementById('preset-size').value='1080x1080';QF.applyPreset();addCardObj('"The best way to predict the future is to create it."',300,100,880)}
    else{document.getElementById('preset-size').value='1080x1080';QF.applyPreset()}
    toast("Template loaded");saveState();
  },

  // Magic Auto-Create
  magicCreate(){
    const mt=document.getElementById('magic-topic').value||"Default Launch Plan";
    const mc=CFG.COLORS[Math.floor(Math.random()*CFG.COLORS.length)];
    document.getElementById('preset-size').value='1080x1350';QF.applyPreset();
    cv.clear();cv.backgroundColor='#000';
    const k=mt.split(" ");const q=k.length>2?`${k[k.length-2]} ${k[k.length-1]} dark`:`${mt} dark`;
    toast(`Generating: ${q}`);
    addTextObj("THE EXCLUSIVE\n"+mt.substring(0,25).toUpperCase()+"...",120,80,920,90,"Oswald",mc);
    addCardObj("Learn the methodology completely transforming digital strategies and generating exponential value.\n\nClick the link included inside!",850,80,900);
    fetchPexelsAuto(q);saveState();
  },

  // Pexels Search
  searchPexels:fetchPexels,

  // Pillars
  loadPillars(){
    const cat=document.getElementById('pillar-cat')?.value||'finance';
    const g=document.getElementById('pillar-gallery');if(!g)return;g.innerHTML='';
    (CFG.PILLARS[cat]||[]).forEach(p=>{
      g.insertAdjacentHTML('beforeend',`<div class="img-card"><img src="${p.u}" alt="${p.n}" loading="lazy"><div class="img-actions"><button class="img-btn" onclick="setBg('${p.u}')">Set Background</button></div></div>`);
    });
  },

  // Export
  exportDesign(){
    toast("Rendering...");cv.discardActiveObject();hideToolbar();cv.renderAll();
    setTimeout(()=>{
      const fmt=document.getElementById('export-fmt').value;
      const url=cv.toDataURL({format:fmt,quality:.92,multiplier:1});
      const ov=document.createElement('div');ov.className='modal-overlay';ov.style.display='flex';
      ov.innerHTML=`<div class="modal-box"><h3 style="color:var(--accent);margin:0 0 16px">Preview</h3><img src="${url}"><div class="row" style="width:100%"><button class="btn" style="justify-content:center" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button class="btn btn-primary" style="justify-content:center" id="dl-btn"><i class="fas fa-download"></i> Download</button></div></div>`;
      document.body.appendChild(ov);
      document.getElementById('dl-btn').onclick=()=>{const a=document.createElement('a');a.download=`QuickFare_Export.${fmt}`;a.href=url;a.click();ov.remove();toast("Downloaded!")};
    },100);
  },

  // ===== FULL KIT GENERATOR =====
  async generateKit(){
    const topic=document.getElementById('kit-topic').value;
    if(!topic)return toast("Enter a topic first!",true);
    const checks={cover:document.getElementById('chk-cover').checked,post:document.getElementById('chk-post').checked,reel:document.getElementById('chk-reel').checked,adcopy:document.getElementById('chk-adcopy').checked,script:document.getElementById('chk-script').checked};
    if(!Object.values(checks).some(v=>v))return toast("Select at least one asset",true);
    kitAssets={};zip=new JSZip();const imgF=zip.folder("Images"),docF=zip.folder("Strategy");

    try{
      // Step 1: Qwen AI
      loader("ANALYZING WITH QWEN-72B...","Generating copy and visual prompts");
      const schema=`{"pexels_query":"2 word dark cinematic description","ebook":{"title":"Main Title 2-3 words","subtitle":"Punchy subtitle","author":"QUICKFARE"},"post":{"hook":"Aggressive short hook","body":"Elaboration sentence"},"reel":{"hook":"STOP SCROLLING hook","cta":"Call to action"},"meta_ad":"Full PAS facebook ad copy","video_script":"30-second script with [Hook] [Body] [CTA]"}`;
      const qRes=await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",headers:{"Authorization":`Bearer ${CFG.QWEN}`,"Content-Type":"application/json"},
        body:JSON.stringify({model:"qwen/qwen-2.5-72b-instruct",messages:[{role:"user",content:`Act as elite digital marketer. Launch kit for: "${topic}". Return ONLY valid JSON matching: ${schema}`}]})
      });
      if(!qRes.ok)throw new Error("Qwen API Failed");
      const qData=await qRes.json();
      const ai=JSON.parse(qData.choices[0].message.content.replace(/```json/g,'').replace(/```/g,'').trim());

      // Step 2: Pexels
      loader("SOURCING VISUALS...",`Searching: ${ai.pexels_query}`);
      let bgUrl=CFG.FALLBACK[0];
      try{
        const pRes=await fetch(`https://api.pexels.com/v1/search?query=${ai.pexels_query}&per_page=5`,{headers:{Authorization:CFG.PEXELS}});
        const pData=await pRes.json();
        if(pData.photos?.length)bgUrl=pData.photos[Math.floor(Math.random()*pData.photos.length)].src.large2x;
      }catch(e){}

      // Step 3: Render
      if(checks.cover){loader("RENDERING COVER...","A5 1748×2480");const d=await renderDesign(1748,2480,bgUrl,"cover",ai.ebook);kitAssets.cover=d;imgF.file("Cover_A5.png",d.split('base64,')[1],{base64:true})}
      if(checks.post){loader("RENDERING POST...","1080×1080");const d=await renderDesign(1080,1080,bgUrl,"post",ai.post);kitAssets.post=d;imgF.file("Post_1x1.png",d.split('base64,')[1],{base64:true})}
      if(checks.reel){loader("RENDERING REEL...","1080×1920");const d=await renderDesign(1080,1920,bgUrl,"reel",ai.reel);kitAssets.reel=d;imgF.file("Reel_9x16.png",d.split('base64,')[1],{base64:true})}
      if(checks.adcopy){kitAssets.adcopy=ai.meta_ad;docF.file("Ad_Copy.txt",ai.meta_ad)}
      if(checks.script){kitAssets.script=ai.video_script;docF.file("Video_Script.txt",ai.video_script)}

      showDashboard();document.getElementById('zip-btn').style.display='inline-flex';
      hideLoader();toast("Full Kit Generated!");
    }catch(err){hideLoader();console.error(err);toast("Generation failed. Try different topic.",true)}
  },

  downloadZip(){
    loader("PACKAGING...","Creating ZIP");
    zip.generateAsync({type:"blob"}).then(b=>{saveAs(b,"QuickFare_Kit.zip");hideLoader();toast("ZIP Downloaded!")});
  },

  closeDash(){document.getElementById('kit-dashboard').style.display='none'},

  // AI Strategist
  async aiCampaign(){
    const tp=document.getElementById('ai-topic').value;
    const bx=document.getElementById('ai-results');
    if(!tp)return toast("Enter a topic first",true);
    bx.style.display='block';bx.innerHTML='<div style="text-align:center;padding:20px"><i class="fas fa-circle-notch fa-spin" style="font-size:20px;color:#00F0FF"></i><p style="margin-top:8px;font-size:12px">Connecting...</p></div>';
    try{
      const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",headers:{"Authorization":`Bearer ${CFG.OR}`,"Content-Type":"application/json","HTTP-Referer":"http://localhost"},
        body:JSON.stringify({model:"meta-llama/llama-3-8b-instruct:free",messages:[{role:"system",content:"Produce elite marketing copy with sections: VIRAL HOOK, AD FRAMEWORK (Problem/Aggression/Solution), DEMOGRAPHICS, VISUAL NODE (3 word photo description)"},{role:"user",content:"Marketing config for: "+tp}]})
      });
      if(!r.ok)throw new Error("API blocked");
      const d=await r.json();let html=d.choices[0].message.content.replace(/```(html)?/gi,'');
      html+=`<button class="btn btn-magic" style="width:100%;margin-top:12px" onclick="QF.applyAI()"><i class="fas fa-plus-circle"></i> Apply to Canvas</button>`;
      bx.innerHTML=html;toast("AI Strategy loaded");
    }catch(e){
      const mock=mockAI(tp);bx.innerHTML='<div style="font-size:10px;color:#6a6;background:#1b3d2b;padding:4px 8px;border-radius:4px;display:inline-block;margin-bottom:8px"><i class="fas fa-shield-alt"></i> LOCAL FALLBACK</div>'+mock;
      toast("Using local fallback");
    }
  },

  applyAI(){
    const hook=document.querySelector('#ai-results p')?.innerText;
    if(!hook)return toast("No AI data",true);
    addTextObj(hook.substring(0,80).toUpperCase(),300,80,920,100,"Anton");
    toast("Applied to canvas");saveState();
  }
};

// Hidden Render Engine
function renderDesign(w,h,bgUrl,type,data){
  return new Promise(resolve=>{
    hc.clear();hc.setWidth(w);hc.setHeight(h);
    fabric.Image.fromURL(bgUrl,img=>{
      const s=Math.max(w/img.width,h/img.height);
      img.set({scaleX:s,scaleY:s,originX:'center',originY:'center',left:w/2,top:h/2});hc.add(img);
      hc.add(new fabric.Rect({width:w,height:h,left:0,top:0,fill:new fabric.Gradient({type:'linear',coords:{x1:0,y1:h,x2:0,y2:0},colorStops:[{offset:0,color:'rgba(0,0,0,0.95)'},{offset:1,color:'rgba(0,0,0,0.4)'}]})}));
      if(type==='cover'){
        hc.add(new fabric.Textbox(data.title.toUpperCase(),{width:w-200,left:100,top:400,fontSize:180,fontFamily:'Anton',fill:'#00F0FF',shadow:new fabric.Shadow({color:'rgba(0,0,0,0.9)',blur:20,offsetY:10})}));
        hc.add(new fabric.Textbox(data.subtitle,{width:w-200,left:100,top:700,fontSize:60,fontFamily:'Montserrat',fill:'#fff'}));
        hc.add(new fabric.Textbox(data.author||"QUICKFARE",{width:w,left:0,top:h-150,fontSize:30,fontFamily:'Montserrat',fill:'#888',textAlign:'center'}));
      }else if(type==='post'){
        hc.add(new fabric.Textbox(data.hook.toUpperCase(),{width:900,left:90,top:150,fontSize:110,fontFamily:'Anton',fill:'#00F0FF',shadow:new fabric.Shadow({color:'rgba(0,0,0,0.9)',blur:20,offsetY:10})}));
        hc.add(new fabric.Rect({width:900,height:350,left:90,top:520,fill:'rgba(15,17,26,0.85)',rx:20,ry:20,stroke:'rgba(255,255,255,0.2)',strokeWidth:2}));
        hc.add(new fabric.Textbox(data.body,{width:800,left:140,top:560,fontSize:40,fontFamily:'Montserrat',fill:'#fff',lineHeight:1.4}));
      }else if(type==='reel'){
        hc.add(new fabric.Textbox(data.hook.toUpperCase(),{width:900,left:90,top:300,fontSize:130,fontFamily:'Anton',fill:'#FF0050',textAlign:'center',shadow:new fabric.Shadow({color:'rgba(0,0,0,0.9)',blur:30,offsetY:15})}));
        hc.add(new fabric.Rect({width:800,height:140,left:140,top:1500,fill:'#00F0FF',rx:70,ry:70}));
        hc.add(new fabric.Textbox(data.cta.toUpperCase(),{width:800,left:140,top:1535,fontSize:48,fontFamily:'Montserrat',fill:'#000',textAlign:'center',fontWeight:'bold'}));
      }
      hc.renderAll();
      setTimeout(()=>resolve(hc.toDataURL({format:'png',quality:1})),250);
    },{crossOrigin:'anonymous'});
  });
}

// Dashboard
function showDashboard(){
  document.getElementById('kit-dashboard').style.display='block';
  const g=document.getElementById('kit-grid');g.innerHTML='';
  ['cover','post','reel'].forEach(t=>{
    if(kitAssets[t])g.innerHTML+=`<div class="kit-card"><h3>${t} Graphic</h3><img src="${kitAssets[t]}"></div>`;
  });
  if(kitAssets.adcopy)g.innerHTML+=`<div class="kit-card"><h3>Ad Copy</h3><pre>${kitAssets.adcopy}</pre><button class="btn btn-sm" onclick="navigator.clipboard.writeText(kitAssets.adcopy);toast('Copied!')"><i class="fas fa-copy"></i> Copy</button></div>`;
  if(kitAssets.script)g.innerHTML+=`<div class="kit-card"><h3>Video Script</h3><pre>${kitAssets.script}</pre><button class="btn btn-sm" onclick="navigator.clipboard.writeText(kitAssets.script);toast('Copied!')"><i class="fas fa-copy"></i> Copy</button></div>`;
}

// Pexels
async function fetchPexels(paginate){
  const g=document.getElementById('pexels-gallery'),q=document.getElementById('pexels-q').value||'dark abstract';
  const type=document.getElementById('pexels-type')?.value||'photos',btn=document.getElementById('pexels-more');
  if(paginate)pexPage++;else{pexPage=1;g.innerHTML='<div style="font-size:11px;color:#00F0FF;grid-column:span 2;text-align:center;padding:16px"><i class="fas fa-sync fa-spin"></i> Fetching...</div>';if(btn)btn.style.display='none'}
  try{
    const url=type==='videos'?`https://api.pexels.com/videos/search?query=${q}&per_page=12&page=${pexPage}`:`https://api.pexels.com/v1/search?query=${q}&per_page=12&page=${pexPage}`;
    const r=await fetch(url,{headers:{Authorization:CFG.PEXELS}});if(!r.ok)throw new Error();
    const d=await r.json();if(!paginate)g.innerHTML='';
    const items=type==='videos'?d.videos:d.photos;
    if(!items?.length){if(btn)btn.style.display='none';return}
    items.forEach(p=>{
      if(type==='photos')g.insertAdjacentHTML('beforeend',`<div class="img-card"><img src="${p.src.medium}" loading="lazy"><div class="img-actions"><button class="img-btn" onclick="setBg('${p.src.large2x}')">Background</button><button class="img-btn" onclick="addImg('${p.src.large2x}',50,50,400)">Add Layer</button></div></div>`);
      else{const vf=p.video_files.find(f=>f.quality==='hd')||p.video_files[0];g.insertAdjacentHTML('beforeend',`<div class="img-card"><img src="${p.image}" loading="lazy"><div style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,.8);padding:4px;border-radius:50%"><i class="fas fa-video" style="font-size:9px;color:#fff"></i></div><div class="img-actions"><button class="img-btn" onclick="setBg('${vf.link}')">Set Video BG</button></div></div>`)}
    });
    if(btn){btn.style.display='flex';btn.innerHTML='<i class="fas fa-arrow-down"></i> Load More'}
  }catch(e){if(!paginate)g.innerHTML='<div style="grid-column:span 2;font-size:10px;color:#94A3B8;text-align:center;padding:12px;border:1px solid rgba(239,68,68,.2);border-radius:8px;background:rgba(239,68,68,.05)">Pexels API error. Try offline library.</div>'}
}

async function fetchPexelsAuto(q){
  try{const r=await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=1`,{headers:{Authorization:CFG.PEXELS}});const d=await r.json();if(d.photos?.length)setBg(d.photos[0].src.large2x);else throw 0}
  catch(e){setBg(CFG.FALLBACK[Math.floor(Math.random()*CFG.FALLBACK.length)])}
}

// Mock AI
function mockAI(topic){
  const t=topic.toLowerCase();let h,p;
  if(t.includes('market')||t.includes('sale')){h="Your setup is bleeding money. Fix it.";p="Physical scaling burns cash."}
  else if(t.includes('fit')||t.includes('health')){h="Everything about calories is wrong.";p="Diet industries sell lies."}
  else{h="Execute this formula or someone else will.";p="Stagnation equals deletion."}
  return `<h4>🔥 Viral Hook</h4><p style="color:#fff;font-weight:900">${h.toUpperCase()}</p><h4>🧠 Framework</h4><p><b>Problem:</b> ${p}<br><b>Solution:</b> Deploy the sequence inside.</p><button class="btn btn-magic" style="width:100%;margin-top:12px" onclick="QF.applyAI()"><i class="fas fa-plus-circle"></i> Apply to Canvas</button>`;
}

// ========== TABS ==========
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('pane-'+btn.dataset.tab).classList.add('active');
  });
});

// ========== INIT ==========
window.onload=()=>{
  fitArtboard();
  window.addEventListener('resize',()=>{fitArtboard();if(cv.getActiveObject())positionToolbar()});
  setTimeout(()=>QF.loadPillars(),300);

  // Zoom
  document.getElementById('workspace').addEventListener('wheel',e=>{
    if(e.ctrlKey||e.metaKey){e.preventDefault();window._scale=Math.max(.1,Math.min((window._scale||1)+(e.deltaY>0?-.05:.05),3));document.getElementById('artboard-wrap').style.transform=`scale(${window._scale})`}
  },{passive:false});

  // Keyboard
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();QF.undo()}
    if(e.ctrlKey&&e.key==='y'){e.preventDefault();QF.redo()}
    if(e.key==='Delete'&&cv.getActiveObject()&&!cv.getActiveObject().isEditing)QF.deleteActive();
  });

  // Load or default
  if(!loadSaved()){
    setBg("https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&w=1920");
    setTimeout(()=>{addTextObj("QUICKFARE\nSTUDIO V12",300,80,900,130,"Anton","#fff");addCardObj("Fabric.js canvas — double-click text to edit.\nSelect any layer to see the floating toolbar.",620,80,850)},400);
  }
  toast("Studio V12 Ready");
};
