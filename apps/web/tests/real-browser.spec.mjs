import { test, expect } from '@playwright/test';

test('mobile capture works offline with a blank shell only',async({page,context})=>{
  await page.goto('/capture/');
  await expect(page.getByRole('heading',{name:'想到了，就记下来。'})).toBeVisible();
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),{timeout:15000});
  const cached=await page.evaluate(async()=>{
    const names=await caches.keys();
    const results=[];
    for(const name of names){
      const cache=await caches.open(name);
      const entries=await cache.keys();
      results.push(...entries.map(x=>new URL(x.url).pathname));
    }
    return results;
  });
  expect(cached).toContain('/capture/offline.html');
  expect(cached.some(x=>x.startsWith('/notes/')||x.startsWith('/_gallery/'))).toBe(false);
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'没有网络，也能记下想法。'})).toBeVisible();
  await page.locator('#capture-text').fill('只在页面临时输入的离线测试短句');
  await expect(page.locator('#capture-text')).toHaveValue('只在页面临时输入的离线测试短句');
  await context.setOffline(false);
});

test('Wiki headings redirect using actual Astro slug, preserving fragment',async({page})=>{
  await page.goto('/notes/samples/idea-demo/');
  await page.getByRole('link',{name:'标题跳转'}).click();
  await expect(page).toHaveURL(/\/notes\/samples\/knowledge-demo\/?#.+/);
  const url=new URL(page.url());
  expect(decodeURIComponent(url.hash)).toBe('#安装与配置');
  await expect(page.locator('#安装与配置')).toBeVisible();
});

test('allowed note transclusion renders real Markdown inside sandboxed iframe',async({page})=>{
  await page.goto('/notes/samples/idea-demo/');
  const frame=page.locator('iframe.life-embed-frame');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute('sandbox','');
  await expect(page.frameLocator('iframe.life-embed-frame').getByRole('heading',{name:'以 Markdown 作为长期的数据格式'})).toBeVisible();
});
