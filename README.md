# Astrophotography Site

A minimal, dark-mode astrophotography portfolio built with [Astro](https://astro.build), designed to deploy to **Azure Static Web Apps**.

## Quick start

```bash
# install dependencies (one-time)
npm install

# run the dev server at http://localhost:4321
npm run dev

# build the static site to ./dist
npm run build

# preview the production build locally
npm run preview
```

You'll need [Node.js 20+](https://nodejs.org). On Windows, install via the installer or `winget install OpenJS.NodeJS.LTS`.

## Project layout

```
src/
├── content/photos/        ← drop .md + .jpg pairs here to add a photo
├── components/            ← Nav, Footer, PhotoCard
├── layouts/Layout.astro   ← html shell, fonts, head
├── pages/
│   ├── index.astro        ← home (hero + recent grid)
│   ├── gallery.astro      ← all photos
│   ├── equipment.astro
│   ├── about.astro
│   └── photos/[slug].astro ← per-photo detail page (auto-generated)
└── styles/global.css      ← design tokens + base styles
```

## Adding a new photo

1. Drop the JPG into `src/content/photos/` (e.g. `m31-andromeda.jpg`).
2. Create a matching markdown file next to it, `m31-andromeda.md`:

   ```md
   ---
   title: "Andromeda Galaxy"
   target: "M31"
   date: 2026-01-15
   integration_hours: 8
   featured: false
   image: "./m31-andromeda.jpg"
   location: "Cairngorms, Scotland"
   equipment:
     mount: "Sky-Watcher EQ6-R Pro"
     telescope: "William Optics ZenithStar 73"
     camera: "ZWO ASI 071MC Pro"
     focal_length_mm: 430
     filters: "Optolong L-Pro"
   acquisition:
     frames: "96 × 300s"
     exposure: "8h total"
     gain: "90"
   processing: "Stacked in Siril, finished in Photoshop."
   ---

   Free-form notes about the capture go here as markdown.
   ```

3. Commit, push. Done — the photo appears on the homepage (newest first), the gallery page, and gets its own detail page at `/photos/m31-andromeda/`.

To make a photo the **hero feature** on the homepage, set `featured: true`. Only one photo should have this set at a time (the first one wins if multiple do).

### Image sizing notes

Astro's image pipeline auto-generates WebP/AVIF derivatives at multiple sizes. You can give it large source files (3000–6000px wide is fine), but if your originals are 50MB+ TIFFs:

- Export a JPG at ~2400px on the long edge for use on the site.
- Keep the full-resolution original in **Azure Blob Storage** (not the repo) and link to it from the photo's markdown body if you want to offer downloads.

## Deploying to Azure Static Web Apps

1. Push this repo to GitHub.
2. In the Azure Portal: **Create resource → Static Web App**.
3. Choose:
   - **Plan:** Free
   - **Source:** GitHub (authenticate, pick the repo + `main` branch)
   - **Build presets:** Custom
   - **App location:** `/`
   - **Output location:** `dist`
4. Azure will commit a workflow file to your repo. **Delete it** — this project already has a better one at `.github/workflows/azure-static-web-apps.yml`. Keep the auto-generated `AZURE_STATIC_WEB_APPS_API_TOKEN` secret that Azure adds to your repo settings.
5. Push to `main`. The included workflow will build and deploy. First deploy takes ~3–4 min; subsequent ones ~90 seconds.

### Custom domain

In the Static Web App resource → **Custom domains** → add your domain. Azure will guide you through the DNS records (CNAME for subdomains, TXT for apex validation). SSL is automatic.

### Configuration

`staticwebapp.config.json` handles routing, caching, and security headers. The defaults are reasonable; tweak `globalHeaders.Cache-Control` if you want longer page caching once content is stable.

## Customising the design

- **Colours, spacing, fonts:** all in `src/styles/global.css` as CSS custom properties at the top of the file. Change `--bg`, `--accent`, `--font-display`, etc. in one place and the whole site updates.
- **Hero behaviour:** `src/pages/index.astro` — the hero pulls whichever photo has `featured: true`.
- **Nav links:** `src/components/Nav.astro`.
- **Per-photo metadata fields:** add or remove fields in `src/content/config.ts` (the schema), then update the display in `src/pages/photos/[slug].astro`.

## Tech notes

- **Astro 5** with the new content layer API
- **No JavaScript shipped to the browser** by default — Astro outputs pure HTML/CSS unless you opt in
- Fonts loaded from Google Fonts (Fraunces + Manrope). To self-host: download woff2 files into `public/fonts/`, replace the `<link>` in `src/layouts/Layout.astro` with an `@font-face` block in `global.css`.
