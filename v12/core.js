// QuickFare V12 Core Engine
const CFG={
  PEXELS:'c56L0l6NiI8lQhFccTdyyNwFg75mqhtaXKvWvimcSQVS00wqP1xdoftW',
  QWEN:'YOUR_OPENROUTER_API_KEY',
  OR:'YOUR_OPENROUTER_API_KEY',
  FALLBACK:["https://images.unsplash.com/photo-1618045952959-1582e219736e?q=80&w=1920","https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1920"],
  COLORS:["#00F0FF","#FF0050","#39FF14","#FFD700","#FF7B00"],
  PILLARS:{
    finance:[{n:"Stock Market",u:"https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Gold Vault",u:"https://images.pexels.com/photos/259209/pexels-photo-259209.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Money",u:"https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&w=1080"}],
    tech:[{n:"Code Matrix",u:"https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"AI Brain",u:"https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Server Room",u:"https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1080"}],
    ecom:[{n:"Shopping",u:"https://images.pexels.com/photos/34577/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1080"},{n:"Boxes",u:"https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Retail",u:"https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1080"}],
    fitness:[{n:"Dark Gym",u:"https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Diet",u:"https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Running",u:"https://images.pexels.com/photos/949126/pexels-photo-949126.jpeg?auto=compress&cs=tinysrgb&w=1080"}],
    abstract:[{n:"Neon Glow",u:"https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Cyberpunk",u:"https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&w=1080"},{n:"Dark Waves",u:"https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1080"}]
  }
};

// State
let history=[],hIdx=-1,restoring=false,pexPage=1,kitAssets={},zip=new JSZip();
const SK="QF_V12_State";

// Canvas
const cv=new fabric.Canvas('artboard',{preserveObjectStacking:true,backgroundColor:'#000',selection:true});
const hc=new fabric.Canvas('hidden-c',{preserveObjectStacking:true,backgroundColor:'#000'});

// Utils
function toast(m,err){const t=document.getElementById('toast');t.innerText=m;t.style.background=err?'#EF4444':'#00F0FF';t.style.color=err?'#fff':'#000';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}
function loader(t,s){const l=document.getElementById('loader');l.style.display='flex';document.getElementById('loader-text').innerText=t;document.getElementById('loader-sub').innerText=s}
function hideLoader(){document.getElementById('loader').style.display='none'}

// State Management
function saveState(){
  if(restoring)return;
  const s=cv.toJSON(['id','isBackground','selectable','evented','isOverlay']);
  if(hIdx<history.length-1)history=history.slice(0,hIdx+1);
  history.push(JSON.stringify(s));
  if(history.length>50)history.shift();else hIdx++;
  try{localStorage.setItem(SK,JSON.stringify({i:hIdx,d:history}))}catch(e){}
}
function restore(j){if(!j)return;restoring=true;cv.loadFromJSON(j,()=>{cv.renderAll();restoring=false;updateLayers()})}
function loadSaved(){try{const s=localStorage.getItem(SK);if(s){const p=JSON.parse(s);history=p.d;hIdx=p.i;restore(history[hIdx]);return true}}catch(e){}return false}

// Layers
function updateLayers(){
  const el=document.getElementById('layer-list');if(!el)return;
  const objs=cv.getObjects();
  if(!objs.length){el.innerHTML='<div style="text-align:center;color:#475569;font-size:11px;padding:8px">No layers</div>';return}
  let h='';
  for(let i=objs.length-1;i>=0;i--){
    const o=objs[i];let ic='fa-layer-group',nm='Layer';
    if(o.type==='textbox'){ic='fa-font';nm=(o.text||'Text').substring(0,18)}
    else if(o.type==='image'){ic='fa-image';nm=o.isBackground?'Background':o.isOverlay?'Overlay':'Image'}
    else if(o.type==='group'){ic='fa-object-group';nm='Card Group'}
    else if(o.type==='rect'){ic='fa-square';nm=o.isOverlay?'Overlay':'Shape'}
    const act=cv.getActiveObject()===o?'active':'';
    h+=`<div class="layer-item ${act}" onclick="QF.selectLayer(${i})"><div><i class="fas ${ic}"></i>${nm}</div><button class="layer-del" onclick="event.stopPropagation();QF.delLayer(${i})"><i class="fas fa-trash"></i></button></div>`;
  }
  el.innerHTML=h;
}

// Floating Toolbar
function showToolbar(){
  const obj=cv.getActiveObject(),tb=document.getElementById('float-toolbar');
  if(!obj||obj.isBackground||obj.isOverlay){tb.style.display='none';return}
  const isText=obj.type==='textbox';
  document.getElementById('tb-font').style.display=isText?'':'none';
  document.getElementById('tb-size').style.display=isText?'':'none';
  document.getElementById('tb-color').style.display=isText?'':'none';
  tb.querySelectorAll('.tb-sep').forEach((s,i)=>{s.style.display=i<3?(isText?'':'none'):''});
  if(isText){
    document.getElementById('tb-font').value=obj.fontFamily||'Anton';
    document.getElementById('tb-size').value=obj.fontSize||100;
    document.getElementById('tb-color').value=obj.fill||'#ffffff';
  }
  positionToolbar();
  tb.style.display='flex';
}
function positionToolbar(){
  const obj=cv.getActiveObject(),tb=document.getElementById('float-toolbar');
  if(!obj)return;
  const br=obj.getBoundingRect(),wrap=document.getElementById('artboard-wrap');
  const wr=wrap.getBoundingClientRect();
  const scale=parseFloat(wrap.style.transform?.match(/scale\(([^)]+)\)/)?.[1]||1);
  const x=wr.left+br.left*scale+br.width*scale/2-tb.offsetWidth/2;
  let y=wr.top+br.top*scale-tb.offsetHeight-12;
  if(y<60)y=wr.top+(br.top+br.height)*scale+12;
  tb.style.left=Math.max(8,Math.min(x,window.innerWidth-tb.offsetWidth-8))+'px';
  tb.style.top=Math.max(60,y)+'px';
}
function hideToolbar(){document.getElementById('float-toolbar').style.display='none'}

// Canvas Events
cv.on('object:added',()=>{if(!restoring){updateLayers();saveState()}});
cv.on('object:modified',()=>{if(!restoring){saveState();positionToolbar()}});
cv.on('object:removed',()=>{if(!restoring){updateLayers();saveState()}});
cv.on('selection:created',()=>{updateLayers();showToolbar()});
cv.on('selection:updated',()=>{updateLayers();showToolbar()});
cv.on('selection:cleared',()=>{updateLayers();hideToolbar()});
cv.on('object:moving',positionToolbar);
cv.on('object:scaling',positionToolbar);

// Fit Artboard
function fitArtboard(){
  const ws=document.getElementById('workspace'),wr=document.getElementById('artboard-wrap');
  if(!ws||!wr)return;
  const s=Math.min((ws.clientWidth-80)/cv.width,(ws.clientHeight-80)/cv.height);
  wr.style.transform=`scale(${s})`;
  window._scale=s;
}

// Canvas Object Helpers
function setBg(url){
  let old=null;cv.getObjects().forEach(o=>{if(o.isBackground)old=o});if(old)cv.remove(old);
  fabric.Image.fromURL(url,img=>{
    const s=Math.max(cv.width/img.width,cv.height/img.height);
    img.set({scaleX:s,scaleY:s,left:cv.width/2,top:cv.height/2,originX:'center',originY:'center',selectable:false,evented:false,isBackground:true});
    cv.insertAt(img,0);
    let ov=null;cv.getObjects().forEach(o=>{if(o.isOverlay)ov=o});
    if(!ov){
      cv.insertAt(new fabric.Rect({width:cv.width,height:cv.height,left:0,top:0,fill:new fabric.Gradient({type:'linear',coords:{x1:0,y1:cv.height,x2:0,y2:0},colorStops:[{offset:0,color:'rgba(0,0,0,0.9)'},{offset:1,color:'rgba(0,0,0,0.3)'}]}),selectable:false,evented:false,isOverlay:true}),1);
    }
  },{crossOrigin:'anonymous'});
}

function addTextObj(text,top,left,width,size,font,color){
  const t=new fabric.Textbox(text.replace(/<br>/gi,'\n').replace(/<[^>]*>/gm,''),{
    left:parseInt(left)||80,top:parseInt(top)||300,width:parseInt(width)||900,
    fontSize:parseInt(size)||100,fontFamily:font||'Anton',fill:color||'#fff',
    textAlign:'left',lineHeight:1.1,charSpacing:0,
    shadow:new fabric.Shadow({color:'rgba(0,0,0,0.9)',blur:30,offsetY:15})
  });
  cv.add(t);cv.setActiveObject(t);return t;
}

function addCardObj(text,top,left,width){
  const w=parseInt(width)||600,clean=text.replace(/<br>/gi,'\n').replace(/<[^>]*>/gm,'');
  const txt=new fabric.Textbox(clean,{width:w-80,fontSize:35,fill:'#fff',fontFamily:'Montserrat',left:40,top:40,originX:'left',originY:'top'});
  const rect=new fabric.Rect({width:w,height:txt.height+80,fill:'rgba(10,12,18,0.85)',rx:20,ry:20,stroke:'rgba(255,255,255,0.1)',strokeWidth:1,originX:'left',originY:'top'});
  const g=new fabric.Group([rect,txt],{left:parseInt(left)||80,top:parseInt(top)||600});
  cv.add(g);cv.setActiveObject(g);return g;
}

function addImg(url,top,left,width){
  fabric.Image.fromURL(url,img=>{
    const s=parseInt(width||400)/img.width;
    img.set({left:parseInt(left)||50,top:parseInt(top)||50,scaleX:s,scaleY:s});
    cv.add(img);cv.setActiveObject(img);
  },{crossOrigin:'anonymous'});
}
