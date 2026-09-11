const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('apps/extension/src');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@qrift\/shared['"]/g, 'import type { $1 } from \'@qrift/shared\'');
  c = c.replace(/import\s+\{\s*DBSchema,\s*IDBPDatabase\s*\}\s+from\s+['"]idb['"]/g, 'import type { DBSchema, IDBPDatabase } from \'idb\'');
  c = c.replace(/chrome\./g, 'browser.');
  c = c.replace(/const ctx = canvas\.getContext\('2d'\);/g, 'const ctx = canvas.getContext(\'2d\') as any;');
  fs.writeFileSync(f, c);
});
