const fs = require('fs');
const f = 'apps/extension/src/storage/indexedDb.ts';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/import\s+\{\s*openDB,\s*DBSchema,\s*IDBPDatabase\s*\}\s+from\s+['"]idb['"]/g, "import { openDB } from 'idb';\nimport type { DBSchema, IDBPDatabase } from 'idb'");
fs.writeFileSync(f, c);
