const fs = require('fs');
const path = require('path');

// Resolve from project root (parent of scripts/)
const pkgPath = path.join(__dirname, '..', 'node_modules', 'html5-qrcode', 'esm');

if (!fs.existsSync(pkgPath)) {
  console.log('[postinstall] html5-qrcode esm directory not found, skipping...');
  process.exit(0);
}

let count = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (entry.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove sourceMappingURL comments
      const newContent = content.replace(/\/\/# sourceMappingURL=.*\r?\n?/g, '');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        count++;
        console.log(`[postinstall] Stripped sourceMappingURL from ${path.relative(__dirname, fullPath)}`);
      }
    }
  }
}

processDir(pkgPath);
console.log(`[postinstall] Done. Stripped sourceMappingURL from ${count} file(s).`);
