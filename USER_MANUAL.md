# User Manual — Astrophotography Site

## Adding a new photo

### The easy way — drop folder

1. Export your images (any size) as JPG into the `photos-inbox/` folder
2. Run:
   ```bash
   npm run add-photos
   ```
3. The script resizes each image to 2400px for the site, uploads the full-res original to Azure Blob Storage, and creates a template markdown file
4. Open each new `.md` file in `src/content/photos/` and fill in the title, target, equipment, etc.
5. Preview locally with `npm run dev`, then commit and push

You can drop as many images as you like — the inbox is cleared after processing.

### Manual method

Every photo on the site is a pair of files in the `src/content/photos/` folder:

1. **A JPG image** — export from your processing software at around 2400px on the long edge. Astro generates smaller WebP versions automatically, so don't worry about resizing for thumbnails.
2. **A markdown file** with the same name (e.g., `m31-andromeda.jpg` + `m31-andromeda.md`).

### Writing the markdown file

Copy this template and fill it in:

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
  guiding: "ZWO 30mm guidescope + ASI120MM Mini"
acquisition:
  frames: "96 × 300s"
  exposure: "8h total"
  gain: "90"
  calibration: "30 darks, 30 flats, 30 bias"
processing: "Stacked in Siril, finished in Photoshop."
---

Write any notes about the capture here — conditions, challenges, what you learned.
This text appears on the photo's detail page below the main image.
```

### What's required vs optional

| Field | Required? | Notes |
|-------|-----------|-------|
| `title` | Yes | Display name, e.g. "Andromeda Galaxy" |
| `target` | Yes | Catalogue designation, e.g. "M31", "IC 1805" |
| `date` | Yes | Capture date in `YYYY-MM-DD` format |
| `integration_hours` | Yes | Total integration time as a number |
| `image` | Yes | Relative path to the JPG — always starts with `./` |
| `featured` | No | Defaults to `false`. See "Featuring a photo" below |
| `full_res` | No | URL to the full-resolution image (auto-filled by `add-photos`) |
| `location` | No | Where you shot from |
| `equipment.mount` | Yes | |
| `equipment.telescope` | Yes | |
| `equipment.camera` | Yes | |
| `equipment.focal_length_mm` | Yes | Number, no units |
| `equipment.filters` | No | |
| `equipment.guiding` | No | |
| `acquisition` | No | Entire section is optional |
| `acquisition.frames` | No | e.g. "96 × 300s" |
| `acquisition.exposure` | No | e.g. "8h total" |
| `acquisition.gain` | No | |
| `acquisition.calibration` | No | e.g. "30 darks, 30 flats, 30 bias" |
| `processing` | No | Brief description of your processing workflow |

### File naming

Use lowercase kebab-case based on the target: `m31-andromeda.md`, `ic1805-heart.md`, `ngc7000-north-america.md`. The filename becomes the URL slug — `m31-andromeda` becomes `/photos/m31-andromeda/`.

## Featuring a photo on the homepage

Set `featured: true` in one photo's frontmatter. That photo becomes the full-width hero image on the homepage. Only one photo should be featured at a time — if multiple are set, the first one found wins.

To change the featured photo, set `featured: false` on the current one and `featured: true` on the new one.

## Publishing

Once you've added your files, commit and push to `main`:

```bash
git add .
git commit -m "Add M31 Andromeda Galaxy"
git push
```

The site rebuilds and deploys automatically. First deploy after a push takes about 90 seconds. You can watch the progress at:

https://github.com/jtgcyber/astrophotography-site/actions

## Previewing locally before publishing

If you want to check how things look before pushing:

```bash
npm run dev
```

Open http://localhost:4321 in your browser. The dev server hot-reloads, so you'll see changes as you save files.

## Removing a photo

Delete both the `.md` and `.jpg` files from `src/content/photos/`, commit, and push.

## Full-resolution images

Full-res originals are stored in Azure Blob Storage (`astrophotojtgcyber` / `full-res` container), not in the Git repo. The `npm run add-photos` script handles the upload automatically.

On each photo's detail page, a "View full resolution" link appears if the `full_res` URL is set in the markdown frontmatter. Visitors click it to see the original in a new tab.

To upload a full-res image manually:
```bash
az storage blob upload --account-name astrophotojtgcyber --container-name full-res \
  --name my-photo.jpg --file ./my-photo.jpg --content-type image/jpeg --auth-mode login
```
Then add `full_res: "https://astrophotojtgcyber.blob.core.windows.net/full-res/my-photo.jpg"` to the photo's frontmatter.

## Image sizing tips

- **Ideal source size:** 2400–4000px on the long edge as JPG. This gives Astro enough resolution to generate sharp thumbnails and full-size views.
- **Avoid committing 50MB+ TIFFs** to the repo. Export a web-sized JPG from your processing software instead.
- You don't need to create thumbnails — Astro's image pipeline generates optimised WebP versions at multiple sizes automatically.

## Changing the site design

- **Colours, fonts, spacing:** Edit the CSS custom properties at the top of `src/styles/global.css`. Change `--bg`, `--accent`, `--font-display`, etc. and the whole site updates.
- **Navigation links:** Edit `src/components/Nav.astro`.
- **Site title and default meta description:** Edit `src/layouts/Layout.astro`.

## Custom domain

In the Azure Portal, go to your Static Web App resource → **Custom domains** → add your domain. Azure walks you through the DNS records. SSL is automatic.
