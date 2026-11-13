import test from 'node:test';
import assert from 'node:assert/strict';
import {headingFragment} from './heading-link.mjs';

test('heading link resolves Astro generated slug incl punctuation and Chinese',()=>{
  const headings=[
    {text:'安装与配置？',slug:'安装与配置'},
    {text:'Install: Windows & Linux',slug:'install-windows--linux'},
    {text:'重复标题',slug:'重复标题'},
    {text:'重复标题',slug:'重复标题-1'}
  ];
  assert.equal(decodeURIComponent(headingFragment('#'+encodeURIComponent('安装与配置？'),headings)),'#安装与配置');
  assert.equal(headingFragment('#install-windows--linux',headings),'#install-windows--linux');
  assert.equal(decodeURIComponent(headingFragment('#'+encodeURIComponent('重复标题'),headings)),'#重复标题');
  assert.equal(headingFragment('#no-such-heading',headings),'');
  assert.equal(headingFragment('#%GG',headings),'');
});
