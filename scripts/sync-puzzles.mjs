// Copies the iOS app's monthly puzzle files into the site so the web game plays the same daily.
// Run after adding or editing puzzles in the app:  npm run sync-puzzles
// Default source: ../../Bendword/Resources/Puzzles (the site lives in Bendword/Marketing/btownlabs-site).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(process.argv[2] ?? join(root, '../../Bendword/Resources/Puzzles'));
const target = join(root, 'public/bendword/puzzles');

const months = readdirSync(source).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
if (!months.length) throw new Error(`No YYYY-MM.json files in ${source}`);

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
let count = 0;
for (const file of months) {
  const puzzles = JSON.parse(readFileSync(join(source, file), 'utf8'));
  count += puzzles.length;
  writeFileSync(join(target, file), JSON.stringify(puzzles));
}
writeFileSync(join(target, 'manifest.json'), JSON.stringify({ months: months.map((f) => f.slice(0, 7)) }));
console.log(`Synced ${count} puzzles in ${months.length} files to public/bendword/puzzles`);
