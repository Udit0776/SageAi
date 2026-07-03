const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', '(main)', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace backgrounds
content = content.replace(/bg-\[\#030303\](?:\/[0-9]+)?/g, 'bg-background');
content = content.replace(/bg-\[\#09090b\](?:\/[0-9]+)?/g, 'bg-card');
content = content.replace(/bg-zinc-950(?:\/[0-9]+)?/g, 'bg-background');
content = content.replace(/bg-zinc-900(?:\/[0-9]+)?/g, 'bg-muted');
content = content.replace(/bg-zinc-800(?:\/[0-9]+)?/g, 'bg-base-300');
content = content.replace(/bg-white\/\[0\.[0-9]+\]/g, 'bg-foreground/5');
content = content.replace(/bg-white\/[0-9]+/g, 'bg-foreground/5');

// Replace borders
content = content.replace(/border-white\/[0-9]+/g, 'border-border');
content = content.replace(/border-zinc-800/g, 'border-border');

// Replace text colors
// For buttons with text-white, we want to keep them white (or primary-content)
// But for standard text, we want text-foreground or text-muted-foreground
// It's tricky to distinguish, but let's replace text-zinc-* globally
content = content.replace(/text-zinc-[12]00/g, 'text-foreground');
content = content.replace(/text-zinc-[345]00/g, 'text-muted-foreground');

// Replace specific text-white that are NOT in buttons
// We will manually fix buttons later if needed, but for now we'll leave text-white alone
// because the CSS compatibility layer already handles text-white safely!

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored hardcoded classes in page.js');
