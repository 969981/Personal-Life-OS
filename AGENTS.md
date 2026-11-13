# AGENTS.md — Personal Life OS

## Mission

构建本地优先、Markdown 为主数据、隐私优先的个人生活记录系统。默认将本仓库视为 Public。

## Mandatory privacy rules

1. NEVER commit real personal diary entries, private chats, photos, tokens, addresses, financial or identity information.
2. Only create synthetic demo content under vault/Samples with demo: true and visibility: public.
3. Preserve raw diary and source chat captures; AI suggestions must never overwrite original content.
4. New notes default to private; missing visibility is never implicit consent to publish.
5. Filter private and local-only notes before generating routes or search indices. Never copy private media into public/.
6. Git ignore is not a security boundary. Audit changed files and dist before publication.
7. Never enable private build on an unauthenticated public host. Protect every domain and preview URL.
8. Do not add automatic external chat ingestion or data export without explicit authorization.

## Coding rules

- Astro + TypeScript; minimize dependencies.
- The single source of truth is vault Markdown; avoid second primary database.
- Use semantic HTML, responsive UI and accessible interactive controls.
- Never fabricate personal history. Samples are labeled clearly as demos.
- Handle empty states gracefully, and preserve legacy URLs if content IDs change.
- Use feature branches and pull requests for code changes.
- Keep app in apps/web, docs in docs, scripts in scripts.

## Acceptance

- npm run build passes in CI.
- Home, diary, moments, ideas, knowledge, projects, calendar, search and note detail pages render.
- Public builds produce no private pages, search data or media.
- Demonstration data visibly marked demo.
- Obsidian templates work independently of Astro.

## Additional integration rules

- Memos imports must stay one-way, private and idempotent. Never modify or delete Memos records.
- AI inference must remain local-only by default; preserve raw chat and require human approval before promotion.
- Photo sources and generated media belong in git-ignored vault folders. Use sharp to re-encode and strip original metadata.
- Public builds may only copy images with explicit visibility: public through scripts/prepare-photos.mjs.
- The private Caddy deployment must listen on 127.0.0.1 and block unauthenticated access to HTML and image URLs.
- Never imply that a local Docker/Tailscale config is already deployed or authenticated without real device tests.
