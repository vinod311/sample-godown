# Trivenkem Sample Godown

Internal perfume-sample locator. Pure HTML/CSS/JS – no server, no tracking, no external calls.

**Your sample data is NOT in this repo.** Each person imports the CSV inside the app; it is kept in their own browser only.

## Files
- `index.html` – page structure
- `style.css`  – design
- `app.js`     – all features (search, add/edit/delete, import/export)

## Use on your computer
Double-click `index.html`. Click **Import** and pick your CSV.

## Put it on GitHub
1. github.com → **New repository** → name `sample-godown` → choose **Public** (needed for free GitHub Pages; your data is not in the repo) → Create.
2. Click **uploading an existing file**, drag `index.html`, `style.css`, `app.js`, `README.md`, `.gitignore` → **Commit changes**.
3. Never upload your CSV/JSON backups to GitHub.

## Deploy on Netlify
1. Netlify → **Add new site → Import an existing project → GitHub** → select the repo.
2. Build command: *(empty)* · Publish directory: `.` → **Deploy**.
3. Site settings → Access control → turn on **password protection**.
4. After any change on GitHub, Netlify redeploys automatically.

## Export / backup
Header → **Export**: all samples (CSV), current search results (CSV), full backup (JSON), Print / PDF.
Import accepts CSV, TSV, Excel (.xlsx/.xls) and the JSON backup, and you can pick several files at once. Photos are included in the JSON backup. Export a backup regularly – browser data is lost if the browser's site data is cleared.

## Publish with GitHub Pages (free)
Repo → Settings → Pages → Deploy from a branch → `main` / root → Save. Link: `https://<username>.github.io/<repo>/`.
To update later: Add file → Upload files → same file names → Commit. Then refresh the site.

## Product photos
- One sample: 3-dot menu → Add photo (camera or gallery), or paste an image link in Edit.
- Many at once: Import → Add photos in bulk. Name each photo like the sample name or code (e.g. `AMAZON TREE.jpg` or `B310070229.jpg`).
- Your CSV can also have an `Image URL` column.
