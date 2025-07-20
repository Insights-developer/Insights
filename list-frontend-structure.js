const fs = require('fs');
const path = require('path');

const baseDirs = ['frontend', 'backend'];

function printTree(dir, prefix = '') {
  if (!fs.existsSync(dir)) {
    console.log(prefix + `[Directory not found: ${dir}]`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    const branch = isLast ? '└── ' : '├── ';
    process.stdout.write(prefix + branch + file);

    if (stats.isDirectory()) {
      console.log('/');
      printTree(fullPath, prefix + (isLast ? '    ' : '│   '));
    } else {
      console.log('');
    }
  });
}

console.log('Project directory structure for /frontend and /backend (if present):\n');

baseDirs.forEach((dir) => {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    console.log(dir + '/');
    printTree(dir, '    ');
  } else {
    console.log(`[Directory not found: ${dir}]`);
  }
});
