import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.jg-astro.co.uk',
  build: {
    format: 'directory',
  },
  image: {
    // allow large astrophoto images through the image pipeline
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
