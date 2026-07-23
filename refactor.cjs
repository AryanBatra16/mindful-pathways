const fs = require('fs');
let code = fs.readFileSync('src/lib/db-actions.ts', 'utf8');

// Replace .all() at the end of Drizzle chains
code = code.replace(/\n\s*\.all\(\);/g, ';');

// Replace return await db...get() with return (await db...)[0]
code = code.replace(/return await db([^;]+)\.get\(\);/g, 'return (await db$1)[0];');

// Replace const x = await db...get() with const [x] = await db...
code = code.replace(/const (\w+) = await db([^;]+)\n\s*\.get\(\);/g, 'const [$1] = await db$2;');
code = code.replace(/const (\w+) = await db([^;]+)\.get\(\);/g, 'const [$1] = await db$2;');

// Replace sql`... >= ...` with gte()
// First add gte to imports
code = code.replace('import { eq, and, desc, asc, sql } from "drizzle-orm";', 'import { eq, and, desc, asc, sql, gte } from "drizzle-orm";');

// Replace sql\${tasks.created_at} >= \${startOfTodaySeconds}
code = code.replace(/sql\`\$\{tasks\.created_at\}\s*>=\s*\$\{([^}]+)\}\`/g, 'gte(tasks.created_at, new Date($1 * 1000))');

fs.writeFileSync('src/lib/db-actions.ts', code);
