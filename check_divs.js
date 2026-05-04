const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
let depth = 0;
let lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
    const open = (lines[i].match(/<div[^>]*>/g) || []).length;
    const close = (lines[i].match(/<\/div>/g) || []).length;
    depth += open - close;
    if (lines[i].includes('class="sidebar"')) console.log('sidebar opens at line ' + (i+1) + ' depth=' + depth);
    if (lines[i].includes('class="workspace"')) console.log('workspace opens at line ' + (i+1) + ' depth=' + depth);
    if (lines[i].includes('class="properties-panel"')) console.log('properties-panel opens at line ' + (i+1) + ' depth=' + depth);
}
console.log('Final depth:', depth);
