import { getCollection, type CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;
export type NoteType = Note['data']['type'];
const PRIVATE_FLAG = 'I_HAVE_PROTECTED_THE_SITE';

export function mayShowPrivate(): boolean {
  const locallyEnabled = import.meta.env.DEV &&
    (import.meta.env.LIFE_OS_SHOW_PRIVATE === 'true' || process.env.LIFE_OS_SHOW_PRIVATE === 'true');
  const protectedBuild = process.env.LIFE_OS_PRIVATE_BUILD === PRIVATE_FLAG ||
    import.meta.env.LIFE_OS_PRIVATE_BUILD === PRIVATE_FLAG;
  return locallyEnabled || protectedBuild;
}
export async function visibleNotes(): Promise<Note[]> {
  const allowPrivate = mayShowPrivate();
  return (await getCollection('notes', (entry) => {
    if (entry.data.visibility === 'local-only') return import.meta.env.DEV && allowPrivate;
    return entry.data.visibility === 'public' || allowPrivate;
  })).sort((a, b) => noteDate(b).getTime() - noteDate(a).getTime());
}
export function noteDate(note: Note): Date {
  return note.data.date ?? note.data.created ?? new Date('2000-01-01T00:00:00Z');
}
export function dateText(date?: Date, locale = 'zh-CN'): string {
  return date ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date) : '未设置日期';
}
export function noteHref(note: Note): string {
  return '/notes/' + note.id.split('/').map(encodeURIComponent).join('/');
}
export function sectionNotes(notes: Note[], type: NoteType): Note[] {
  return notes.filter((note) => note.data.type === type);
}
export const sections = [
  { key: 'diary', label: '日记', href: '/diary', icon: '📖' },
  { key: 'moment', label: '碎碎念', href: '/moments', icon: '💭' },
  { key: 'idea', label: '灵感', href: '/ideas', icon: '💡' },
  { key: 'knowledge', label: '知识库', href: '/knowledge', icon: '📚' },
  { key: 'photo', label: '相册', href: '/photos', icon: '📷' },
  { key: 'project', label: '项目', href: '/projects', icon: '🛠️' },
] as const;
