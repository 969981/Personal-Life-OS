// QuickAdd Macro user script. Runs inside Obsidian, never calls a network API.
// Usage: QuickAdd > Macro > User Script > Automation/quickadd-chat.js
module.exports = async ({ app, quickAddApi }) => {
  const editor = app.workspace.activeEditor?.editor;
  const selected = editor?.getSelection()?.trim();
  const captured = selected || await quickAddApi.inputPrompt('输入需要保存的聊天原文');
  const content = String(captured ?? '').trim();
  if (!content) return;
  const title = (await quickAddApi.inputPrompt('摘录标题（可留空）'))?.trim() || '聊天摘录';
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
  const serial = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('');
  const suffix = Math.random().toString(16).slice(2, 10);
  const folder = 'Chat-Captures';
  if (!app.vault.getAbstractFileByPath(folder)) await app.vault.createFolder(folder);
  const path = folder + '/' + date + '-' + serial + '-' + suffix + '.md';
  const yaml = (value) => JSON.stringify(String(value));
  const document = [
    '---',
    'title: ' + yaml(title),
    'type: knowledge',
    'created: ' + yaml(date),
    'visibility: private',
    'tags: [chat-capture]',
    '---',
    '',
    '# ' + title.replaceAll('\n', ' '),
    '',
    '## 原始摘录（不可覆盖）',
    '',
    content,
    '',
    '## AI 候选提炼（待人工审核）',
    '',
    '- [ ] 尚未整理',
    '',
  ].join('\n');
  await app.vault.create(path, document);
  new Notice('已保存私人聊天摘录：' + path);
};
