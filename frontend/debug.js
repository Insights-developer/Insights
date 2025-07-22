#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('App directory exists:', fs.existsSync('./app'));
console.log('App directory stat:', fs.statSync('./app'));
console.log('Layout.tsx exists:', fs.existsSync('./app/layout.tsx'));
console.log('Page.tsx exists:', fs.existsSync('./app/page.tsx'));

// Try to simulate what Next.js is doing
const appDir = path.join(process.cwd(), 'app');
const pagesDir = path.join(process.cwd(), 'pages');

console.log('App dir full path:', appDir);
console.log('App dir exists (full path):', fs.existsSync(appDir));
console.log('Pages dir full path:', pagesDir);
console.log('Pages dir exists (full path):', fs.existsSync(pagesDir));

if (fs.existsSync(appDir)) {
    console.log('App directory contents:', fs.readdirSync(appDir));
}
