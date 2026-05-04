const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function extractTags(htmlStr) {
    const regex = /<(div|h3)[^>]*class="([^"]*)"[^>]*>/g;
    let match;
    let result = [];
    while ((match = regex.exec(htmlStr)) !== null) {
        if (match[2].includes('sidebar') || match[2].includes('properties-panel') || match[2].includes('section') || match[2].includes('workspace')) {
            result.push(match[0]);
        }
    }
    return result;
}

console.log(extractTags(html).slice(0, 30).join('\n'));
