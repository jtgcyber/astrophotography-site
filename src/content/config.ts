import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      target: z.string(),
      date: z.coerce.date(),
      integration_hours: z.number(),
      featured: z.boolean().default(false),
      image: image(),
      full_res: z.string().url().optional(),
      location: z.string().optional(),
      equipment: z.object({
        mount: z.string(),
        telescope: z.string(),
        camera: z.string(),
        focal_length_mm: z.number(),
        filters: z.string().optional(),
        guiding: z.string().optional(),
      }),
      acquisition: z
        .object({
          frames: z.string().optional(),
          exposure: z.string().optional(),
          gain: z.string().optional(),
          calibration: z.string().optional(),
        })
        .optional(),
      processing: z.string().optional(),
    }),
});

export const collections = { photos };
