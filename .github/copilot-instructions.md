# Copilot Instructions

## Build & Dev Commands

```bash
npm run dev        # Dev server at localhost:4321
npm run build      # Static build → ./dist
npm run preview    # Preview production build locally
```

No test or lint tooling is configured.

## Architecture

Astro 5 static site (zero client-side JS by default) deployed to **Azure Static Web Apps**. The content layer uses Astro's `glob` loader to turn markdown files into typed collections.

**Content flow:** `src/content/photos/*.md` → schema validated by `src/content/config.ts` → queried via `getCollection('photos')` in pages → rendered as static HTML at build time. Each photo markdown file is paired with a co-located `.jpg` image that Astro's Sharp-based image pipeline processes into WebP/AVIF at multiple sizes.

**Layout hierarchy:** `Layout.astro` provides the HTML shell (fonts, meta, nav, footer) → pages slot their content into it → reusable components like `PhotoCard` handle repeated patterns.

**Routing:** Static paths for top-level pages (`index`, `gallery`, `equipment`, `about`). Dynamic `[slug].astro` generates one page per photo entry using `getStaticPaths()`. All URLs use trailing slashes (enforced by `staticwebapp.config.json`).

## Key Conventions

### Adding content

To add a photo, create two files in `src/content/photos/`:
1. A `.jpg` image file
2. A `.md` file with the same basename containing frontmatter that conforms to the schema in `src/content/config.ts`

The `image` field in frontmatter is a relative path to the co-located image (e.g., `"./m31-andromeda.jpg"`). The schema requires: `title`, `target`, `date`, `integration_hours`, `image`, and `equipment` (with `mount`, `telescope`, `camera`, `focal_length_mm`). Setting `featured: true` makes a photo the homepage hero — only one photo should have this at a time.

### Styling

- All design tokens (colors, fonts, spacing) are CSS custom properties in `src/styles/global.css` under `:root`
- Components use Astro scoped `<style>` blocks — no CSS modules or utility frameworks
- Dark mode only (background `#0a0a0c`); the design is intentionally minimal and restrained
- Display font: Fraunces (serif); Body font: Manrope (sans-serif) — loaded from Google Fonts in `Layout.astro`

### TypeScript

Strict mode (`astro/tsconfigs/strict`). Component props use the `interface Props` pattern in the frontmatter fence.

### Deployment

CI/CD via `.github/workflows/azure-static-web-apps.yml` — builds on push to `main` and on PRs. Requires the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret. Static asset caching headers are configured in `staticwebapp.config.json` (1 year immutable for `/_astro/*` hashed assets, 1 hour for everything else).
