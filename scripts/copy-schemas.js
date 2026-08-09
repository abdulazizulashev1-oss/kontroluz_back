const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else if (file.endsWith('.json')) {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

const srcDir = path.join(__dirname, '..', 'src');
const distSrcDir = path.join(__dirname, '..', 'dist', 'src');

copyFolderRecursiveSync(srcDir, distSrcDir);
console.log('Successfully copied all JSON schemas to dist/src/');
