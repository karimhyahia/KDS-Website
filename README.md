# KDS – Keller & Dach Spezialisten

Astro + Storyblok + Vercel landing page.

## Stack

| Layer | Tool |
|-------|------|
| Static site generator | [Astro](https://astro.build/) |
| Headless CMS | [Storyblok](https://www.storyblok.com/) (EU region) |
| Hosting | [Vercel](https://vercel.com/) |

## Local development

```bash
npm install
npm run dev      # http://localhost:4321 (uses STORYBLOK_TOKEN draft content)
npm run build    # outputs to dist/
npm run preview  # serve the built site
```

Required env vars in `.env` (gitignored):

```
STORYBLOK_TOKEN=<preview/public access token>
STORYBLOK_PERSONAL_TOKEN=<personal access token, only for CLI/seed>
STORYBLOK_SPACE_ID=292282210158437
```

## Storyblok workflow

The Storyblok component schemas live in `.storyblok/components/<space-id>/components.json`.

```bash
# Pull latest schemas from Storyblok into the repo
npx storyblok components pull --space 292282210158437

# Push local schema changes up to Storyblok
npx storyblok components push --space 292282210158437

# Seed initial story + upload project images (one-off)
node scripts/seed-storyblok.mjs
```

## Vercel deployment

1. Import this repo at <https://vercel.com/new>.
2. Framework preset: **Astro** (auto-detected).
3. Add the env var `STORYBLOK_TOKEN` in **Project Settings → Environment Variables** (use the Preview/Public token, not the Personal one).
4. Deploy.

To rebuild on Storyblok content changes, add a Vercel Deploy Hook URL to Storyblok → Settings → Webhooks → "Story published".

## Project structure

```
src/
├── components/
│   ├── Navbar.astro          # static, not editable in CMS
│   ├── Footer.astro          # static, not editable in CMS
│   └── storyblok/            # mapped to Storyblok component schemas
│       ├── Page.astro
│       ├── Hero.astro
│       ├── Services.astro
│       ├── ServiceCard.astro
│       ├── Projects.astro
│       ├── ProjectCard.astro
│       ├── About.astro
│       ├── AboutFeature.astro
│       ├── CtaSection.astro
│       └── Contact.astro
├── layouts/
│   ├── Layout.astro          # head + JSON-LD + body shell
│   └── LegalLayout.astro     # for impressum / datenschutz
├── pages/
│   ├── index.astro           # fetches story "home" from Storyblok
│   ├── impressum.astro       # static
│   └── datenschutz.astro     # static
└── styles/
    └── global.css

public/
├── images/                   # static assets, also mirrored to Storyblok
└── script.js                 # nav + form behaviour

_legacy/                      # original static HTML site, kept for reference
```
