import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Exclude Templates: unresolved Obsidian placeholders are not valid typed notes.
const notes = defineCollection({
  loader: glob({
    pattern: '{Samples,Diary,Moments,Ideas,Knowledge,Projects,Life,Reviews,Chat-Captures,Photos}/**/*.md',
    base: '../../vault',
  }),
  schema: z.object({
    title: z.string().min(1),
    type: z.enum(['diary', 'moment', 'idea', 'knowledge', 'project', 'review', 'photo']).default('knowledge'),
    date: z.coerce.date().optional(),
    created: z.coerce.date().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    aliases: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'private', 'local-only']).default('private'),
    demo: z.boolean().default(false),
    status: z.string().optional(),
    photo_file: z.string().regex(/^[a-f0-9]{20}\.webp$/).optional(),
  }),
});
export const collections = { notes };
