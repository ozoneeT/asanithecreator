# Setup

## Running locally

```bash
npm install
npm run dev
```

The dev server also serves the `api/*` functions (via a plugin in `vite.config.ts`),
so `/portfolio` and `/studio` behave the same locally as on Vercel.

---

## Cloudflare R2

Videos live in an R2 bucket and are listed by a `manifest.json` stored in that
same bucket. Nothing is hardcoded: uploading or deleting in `/studio` changes the
site with no code change and no redeploy.

The bucket can live in **any** Cloudflare account you already have — the custom
domain just has to be a zone in that same account. Borrowing a subdomain from
another project (e.g. `videos.sydhustle.com`) is fully supported.

### 1. Create the bucket

1. **R2 → Create bucket**, e.g. `asani-portfolio`.
2. **Settings → Public access → Connect Domain** → enter your subdomain,
   e.g. `videos.sydhustle.com`.
   Do **not** rely on the `*.r2.dev` URL: Cloudflare rate-limits it and documents
   it as development-only.
3. **R2 → API → Manage API Tokens → Create API Token**
   → *Object Read & Write*, scoped to this bucket. Copy the secret now; it is
   shown only once.

### 2. Allow browser uploads (CORS)

Uploads go straight from the browser to R2, so the bucket must accept them.
Under **Settings → CORS Policy**, add:

```json
[
  {
    "AllowedOrigins": [
      "https://asanithecreator.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Without this, uploads fail with a CORS error while everything else keeps working.

### 3. Configure

```bash
cp .env.example .env.local
```

Fill it in, and set `STUDIO_PASSWORD` to something long and random — it is the
only thing standing between the public and your upload/delete endpoints.

`VITE_R2_PUBLIC_HOST` is the same hostname as `R2_PUBLIC_HOST`. It is the only
value sent to the browser, which is fine: it appears in every video URL anyway.

On Vercel, add all of these under **Settings → Environment Variables**.

### 4. Upload

Open `/studio` on your phone, enter the password, pick a video, add a title and
caption, upload. It is live on `/portfolio` as soon as it finishes — there is no
transcoding step to wait for.

---

## How it fits together

```
READ  (no serverless cost — the manifest is public and edge-cached)
  /portfolio → GET https://<host>/manifest.json → native <video> per MP4

WRITE (authenticated)
  /studio → POST /api/upload-url  → presigned PUTs for video + poster
          → browser PUTs both straight to R2
          → POST /api/finalize    → appends the entry to manifest.json
```

The R2 secret only ever exists inside the serverless functions. The browser
receives a one-time URL scoped to two object keys and nothing else.

### Why the poster is captured in the browser

R2 does not transcode or generate thumbnails. Before uploading, `/studio` draws a
frame from the file you picked onto a canvas and uploads that alongside the video.
Costs nothing and needs no server.

### Why uploads are codec-checked

iPhones record HEVC (H.265) by default. Safari plays it; **Chrome and Firefox do
not**. A "does it play here?" test would therefore pass on your phone and fail for
most visitors — so `/studio` inspects the file's container bytes instead and
rejects HEVC before it uploads.

To avoid it entirely: **Settings → Camera → Formats → Most Compatible**.

### Vimeo fallback

While the library is being migrated, `/portfolio` falls back to the old hardcoded
Vimeo list whenever R2 is unconfigured or the manifest is empty. Once everything
is in R2, delete:

- `lib/legacyVimeo.ts`
- `PORTFOLIO_VIDEOS` in `constants.tsx`
- `public/posters/` (R2 serves posters now)
- the `@vimeo/player` dependency and the iframe branch in `components/PortfolioPage.tsx`

### Known issue

Vimeo video `1163715939` ("Travel Content Reel") is private or deleted and renders
an error. It disappears once the library moves to R2.
