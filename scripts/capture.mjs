import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const allowed = new Set(['diary', 'moment', 'idea', 'chat']);
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = process.argv[i];
  if (key.startsWith('--')) args[key.slice(2)] = process.argv[++i] ?? '';
}
const type = args.type ?? 'diary';
if (!allowed.has(type)) {
  console.error('Usage: node scripts/capture.mjs --type diary|moment|idea|chat --text "内容" [--title "标题"] [--source "来源"]');
  process.exit(2);
}
const raw = args.text ?? (process.stdin.isTTY ? '' : readFileSync(0, 'utf8'));
const text = String(raw).trim();
if (!text) {
  console.error('请提供 --text 内容，或从标准输入传入内容。');
  process.exit(2);
}
const vault = resolve(process.env.LIFE_OS_VAULT_DIR ?? fileURLToPath(new URL('../vault/', import.meta.url)));
const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).formatToParts(new Date());
const datePart = (name) => parts.find((part) => part.type === name)?.value ?? '00';
const yyyy = datePart('year'), mm = datePart('month'), dd = datePart('day');
const hh = datePart('hour'), min = datePart('minute'), sec = datePart('second');
const date = [yyyy, mm, dd].join('-');
const time = hh + ':' + min;
const yaml = (value) => JSON.stringify(String(value));
const safeTitle = args.title ? String(args.title).trim() : text.split('\n')[0].slice(0, 45);
const token = hh + min + sec + '-' + randomUUID().slice(0, 7);
const folder = type === 'chat' ? 'Chat-Captures' : type === 'diary' ? 'Diary' : type === 'idea' ? 'Ideas' : 'Moments';
const target = type === 'diary' ? join(vault,folder,yyyy,mm,date + '.md') : join(vault,folder,date + '-' + token + '.md');
await mkdir(resolve(target,'..'), { recursive: true });
if (type === 'diary') {
  const line = '- ' + time + ' 💭 ' + text.replaceAll('\n','\n  ') + '\n';
  let current;
  try { current = await readFile(target,'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (current === undefined) {
    const header = '---\ntitle: ' + yaml(date + ' 日记') + '\ntype: diary\ndate: ' + yaml(date) +
      '\nvisibility: private\ntags: [daily]\n---\n\n# ' + date + ' · 日记\n\n## Timeline\n\n';
    await writeFile(target,header + line,{flag:'wx'});
  } else {
    const matched = current.match(/^## Timeline[^\n]*\r?\n/m);
    if (matched) {
      const position = matched.index + matched[0].length;
      await writeFile(target,current.slice(0,position) + '\n' + line + current.slice(position),'utf8');
    } else {
      await writeFile(target,current.trimEnd() + '\n\n## Timeline\n\n' + line,'utf8');
    }
  }
} else {
  const noteType = type === 'chat' ? 'knowledge' : type;
  const front = '---\ntitle: ' + yaml(safeTitle) + '\ntype: ' + noteType +
    '\ncreated: ' + yaml(date) + '\nvisibility: private\ntags: [' + (type === 'chat' ? 'chat-capture' : type) + ']\n';
  const extra = type === 'idea' ? 'status: inbox\n' : '';
  const body = type === 'chat'
    ? '\n# ' + safeTitle + '\n\n来源：' + (args.source ?? '手动摘录') +
      '\n\n## 原始摘录（请保留）\n\n' + text + '\n\n## AI 候选提炼（人工审核）\n\n- [ ] 待整理\n'
    : '\n# ' + safeTitle + '\n\n' + text + '\n';
  await writeFile(target,front + extra + '---\n' + body,{flag:'wx'});
}
console.log('✓ 已保存到本地私人笔记：' + target);
console.log('ℹ 私有目录默认被 Git 忽略，不会上传至当前公开仓库。');
