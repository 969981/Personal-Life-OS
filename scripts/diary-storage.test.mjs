import test from 'node:test';
import assert from 'node:assert/strict';
import { appendToTimeline } from './diary-storage.mjs';
test('append section preserves headings, CRLF and chronological QuickAdd order',()=>{
  const initial=['# Test','## Timeline','','- 09:00 💭 first','','## Next','not part of log'].join('\r\n');
  const next=appendToTimeline(initial,'- 10:00 💡 second');
  assert.ok(next.indexOf('09:00') < next.indexOf('10:00'));
  assert.ok(next.indexOf('10:00') < next.indexOf('## Next'));
  assert.match(next,/\r\n- 10:00/);
  assert.match(next,/## Next\r\nnot part of log/);
});
test('missing Timeline heading is created and other sections preserved',()=>{
  const result=appendToTimeline('# Today\n\n## Other\ncontent','- 12:00 💭 thought');
  assert.match(result,/## Other\ncontent/);
  assert.match(result,/## Timeline\n\n- 12:00 💭 thought/);
});
