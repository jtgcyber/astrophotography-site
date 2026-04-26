import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      target: z.string(),
      slug: z.string().optional(),
      date: z.coerce.date(),
      integration_hours: z.number().positive().optional(),
      featured: z.boolean().default(false),
      capture_type: z.enum(['deep_sky', 'wide_field', 'lunar', 'planetary', 'iphone']).default('deep_sky'),
      image: image(),
      full_res: z.string().url().optional(),
      location: z.string().optional(),
      equipment: z.object({
        mount: z.string().optional(),
        telescope: z.string().optional(),
        camera: z.string().optional(),
        focal_length_mm: z.number().positive().optional(),
        filters: z.string().optional(),
        guiding: z.string().optional(),
      }).optional(),
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
