import { mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../vault/', import.meta.url);
const paths = [
  '00-Inbox', 'Diary', 'Moments', 'Ideas', 'Knowledge', 'Projects',
  'Life', 'Reviews', 'Chat-Captures', 'Attachments',
];
for (const path of paths) {
  await mkdir(new URL(path + '/', root), { recursive: true });
}
console.log('✓ Personal vault directories created locally.');
console.log('✓ Private directories are ignored by Git in this public repository.');
console.log('⚠ Do not override .gitignore or commit personal files until the repository is private.');
