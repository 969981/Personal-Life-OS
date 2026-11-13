// Pure helper shared by generated Wiki redirect pages and Node tests.
// Astro's render(note).headings provides the canonical GitHub slugger output.
export function headingFragment(fragment, headings) {
  if (!fragment || fragment === '#') return '';
  let requested;
  try { requested=decodeURIComponent(fragment.replace(/^#/,'')); }
  catch { return ''; }
  if (!requested) return '';
  const clean=(value)=>String(value).trim().normalize('NFKC').toLocaleLowerCase();
  const direct=headings.find(h=>clean(h.slug)===clean(requested));
  const title=headings.find(h=>clean(h.text)===clean(requested));
  const target=direct??title;
  return target ? '#'+encodeURIComponent(target.slug) : '';
}
