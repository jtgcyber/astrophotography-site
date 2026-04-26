import sharp from 'sharp';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const INBOX = './photos-inbox';
const OUTPUT = './src/content/photos';
const ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT || 'astrophotojtgcyber';
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'full-res';
const BASE_URL = `https://${ACCOUNT}.blob.core.windows.net/${CONTAINER}`;
const WEB_MAX = 2400;

// Preflight: check Azure auth
try {
  execSync('az account show', { stdio: 'ignore' });
} catch {
  console.error('❌ Not logged into Azure CLI. Run: az login');
  process.exit(1);
}

const files = fs.readdirSync(INBOX).filter(f => /\.(jpg|jpeg|png|tiff?)$/i.test(f));

if (files.length === 0) {
  console.log('📭 No images found in photos-inbox/');
  process.exit(0);
}

console.log(`📸 Found ${files.length} image(s) to process\n`);

const results = [];

for (const file of files) {
  const slug = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const inputPath = path.join(INBOX, file);
  const webPath = path.join(OUTPUT, `${slug}.jpg`);
  const mdPath = path.join(OUTPUT, `${slug}.md`);
  const blobName = `${slug}.jpg`;

  console.log(`→ ${file} (slug: ${slug})`);

  // Check for slug collisions
  if (fs.existsSync(webPath)) {
    console.log(`  ⚠️  Skipped — ${slug}.jpg already exists in content. Use --overwrite to replace.`);
    continue;
  }

  try {
    // 1. Resize for web
    const meta = await sharp(inputPath).metadata();
    await sharp(inputPath)
      .resize({ width: WEB_MAX, height: WEB_MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(webPath);
    const webStat = fs.statSync(webPath);
    console.log(`  ✓ Web version: ${meta.width}×${meta.height} → 2400px max (${(webStat.size / 1024).toFixed(0)}KB)`);

    // 2. Upload full-res to Azure Blob Storage
    execSync(
      `az storage blob upload --account-name ${ACCOUNT} --container-name ${CONTAINER} ` +
      `--name "${blobName}" --file "${inputPath}" --content-type image/jpeg ` +
      `--auth-mode login --overwrite`,
      { stdio: 'pipe' }
    );
    const fullResUrl = `${BASE_URL}/${blobName}`;
    console.log(`  ✓ Full-res uploaded: ${fullResUrl}`);

    // 3. Create template markdown (only if it doesn't exist)
    if (!fs.existsSync(mdPath)) {
      const today = new Date().toISOString().split('T')[0];
      const template = `---
title: "${slug}"
target: ""
date: ${today}
integration_hours: 0
featured: false
image: "./${slug}.jpg"
full_res: "${fullResUrl}"
location: ""
equipment:
  mount: "Unknown"
  telescope: "Unknown"
  camera: "Unknown"
  focal_length_mm: 0
processing: ""
---

Notes about this capture.
`;
      fs.writeFileSync(mdPath, template);
      console.log(`  ✓ Created ${slug}.md — fill in the frontmatter before publishing`);
    } else {
      console.log(`  ℹ ${slug}.md already exists — not overwritten`);
    }

    // 4. All steps succeeded — remove from inbox
    fs.unlinkSync(inputPath);
    console.log(`  ✓ Removed from inbox\n`);
    results.push({ slug, status: 'ok' });

  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
    // Clean up partial web image if this slug didn't fully succeed
    if (fs.existsSync(webPath) && !results.find(r => r.slug === slug)) {
      fs.unlinkSync(webPath);
    }
    results.push({ slug, status: 'failed' });
    console.log('');
  }
}

// Summary
const ok = results.filter(r => r.status === 'ok');
const failed = results.filter(r => r.status === 'failed');
console.log('─'.repeat(40));
console.log(`✅ ${ok.length} processed${failed.length ? `, ❌ ${failed.length} failed` : ''}`);
if (ok.length > 0) {
  console.log(`\nNext steps:`);
  console.log(`  1. Fill in the frontmatter in each new .md file`);
  console.log(`  2. npm run dev — preview locally`);
  console.log(`  3. git add . && git commit && git push`);
}
if (failed.length > 0) {
  process.exit(1);
}
