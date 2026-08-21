import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const linkSchema = z.array(z.object({ label: z.string(), href: z.string() })).default([]);

export const collections = {
  publications: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
    schema: z.object({
      title: z.string(), order: z.coerce.number(),
      // venue now lives inside the citation bullet, in the owner's own format
      venue: z.string().optional(),
      // kind/status are no longer displayed; kept optional so re-adding either to a
      // front-matter block does not fail the build
      kind: z.string().optional(), status: z.string().optional(),
    }),
  }),
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({
      title: z.string(), order: z.coerce.number(), tags: z.array(z.string()).default([]),
      period: z.string().default(''), cover: z.string().default(''), links: linkSchema,
      // the domain a project belongs to; tags cut ACROSS these on purpose, so that
      // filtering by technique does not just re-select one group
      group: z.enum(['Creative AI systems', 'Machine learning & vision', 'Optimisation & statistics']),
    }),
  }),
  artwork: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/artwork' }),
    schema: z.object({
      title: z.string(), series: z.string(), order: z.coerce.number(),
      image: z.string(), thumb: z.string(),
      // which of the three kinds of image this is — an installation view, one of
      // the works, documentation, or a standalone studio piece. The page treats
      // each differently; a flat gallery is what lost the work's structure.
      role: z.enum(['install', 'page', 'documentation', 'work']),
      year: z.string().optional(),
      // required: an art page whose images have no accessible description is not
      // acceptable, and this writing already exists
      alt: z.string().min(10),
    }),
  }),
  photography: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/photography' }),
    schema: z.object({
      title: z.string(), order: z.coerce.number(), image: z.string(),
      // required, exactly as artwork: the descriptions exist and had never shipped
      alt: z.string().min(10),
      // nothing renders a thumbnail any more — at one-per-row the full image is
      // what displays, and a thumb would only be a second download
      thumb: z.string().optional(),
    }),
  }),
};
