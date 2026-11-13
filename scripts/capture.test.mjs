import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./capture.mjs', import.meta.url));
test('captures diary, moment and chat locally with private visibility', async (t) => {
  const vault = await mkdtemp(join(tmpdir(), 'life-os-test-'));
  t.after(() => rm(vault, { recursive: true, force: true }));
  const run = (type, content) => {
    const r = spawnSync(process.execPath,[cli,'--type',type,'--text',content],{
      env: { ...process.env, LIFE_OS_VAULT_DIR: vault }, encoding:'utf8'
    });
    assert.equal(r.status,0,r.stderr);
  };
  run('diary','第一条测试碎碎念');
  run('diary','第二条测试碎碎念');
  run('moment','一分钟的想法');
  run('chat','某段聊天摘录');
  const years = await readdir(join(vault,'Diary'));
  const months = await readdir(join(vault,'Diary',years[0]));
  const files = await readdir(join(vault,'Diary',years[0],months[0]));
  assert.equal(files.length,1);
  const diary = await readFile(join(vault,'Diary',years[0],months[0],files[0]),'utf8');
  assert.match(diary,/visibility: private/);
  assert.match(diary,/第一条测试碎碎念/);
  assert.match(diary,/第二条测试碎碎念/);
  assert.equal((await readdir(join(vault,'Moments'))).length,1);
  const chats = await readdir(join(vault,'Chat-Captures'));
  const chat = await readFile(join(vault,'Chat-Captures',chats[0]),'utf8');
  assert.match(chat,/原始摘录/);
  assert.match(chat,/visibility: private/);
});
