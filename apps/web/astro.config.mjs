import { defineConfig } from 'astro/config';
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';

export default defineConfig({
  site: 'http://localhost:4321',
  output: 'static',
  markdown: { remarkPlugins: [remarkWikilinks] },
  devToolbar: { enabled: false },
});
