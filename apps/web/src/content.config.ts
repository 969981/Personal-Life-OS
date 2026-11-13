import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../../vault' }),
  schema: z.object({
    title: z.string().min(1),
    type: z.enum(['diary', 'moment', 'idea', 'knowledge', 'project', 'review']).default('knowledge'),
    date: z.coerce.date().optional(),
    created: z.coerce.date().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'private', 'local-only']).default('private'),
    demo: z.boolean().default(false),
    status: z.string().optional(),
  }),
});

export const collections = { notes };
