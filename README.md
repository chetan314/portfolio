# Chetan Nandanwar — Portfolio

A neo-brutalist portfolio for an ML engineer. Swiss editorial grid, hard shadows, colour blocking, and a live in-browser demo inside every project card.

**Stack:** Vite · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · Lenis · Lucide

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build
```

## Edit content

Everything you'd want to change lives in **`src/data/portfolio.ts`**: profile, links, model-card copy, projects and case studies, timeline, publications and the skills matrix. Components only read from it.

- **Resume download:** drop the PDF in `public/` and set `profile.links.resume`.
- **Project links:** add `links: [{ label: 'GitHub', href: '…' }]` to any project.
- **Photo:** replace `public/chetan.jpg` (square, ≥ 640px).

## Sections

| # | Section | Interactive piece |
|---|---|---|
| 00 | Hero | Attention-map canvas (cursor = query), kinetic type, CV-annotated portrait |
| 01 | Marquee | Crossed, counter-scrolling strips |
| 02 | Model card | Tabs (README / Training data / Usage) and animated eval metrics |
| 03 | Selected work | 4 live demos plus shared-layout case-study dialogs |
| 04 | Training log | Pinned horizontal scroll with a loss curve that draws itself |
| 05 | Research | Publications with one-click BibTeX |
| 06 | Skills matrix | Skill × project grid with filters |
| 07 | Contact | Terminal (`help`, `projects`, `sudo hire` …) and magnetic CTAs |

### The demos

- **RAG** (`src/lib/retrieval.ts`): real Okapi BM25 fused with a concept-space "dense" score over an 18-article slice of the Constitution. It parses citations like `Art. 21-A` / `243 g`, and you can drag the α slider.
- **Retinopathy** (`src/components/demos/retina.ts`): a synthetic fundus run through real pixel ops: green channel, denoise, background flattening, black-hat/top-hat, thresholds, connected components and per-quadrant features. About 100 ms in the browser.
- **Surgical scene**: an illustrative Cholec80-style phase timeline and tool detections. Click a tool to toggle its SAM-style mask.
- **Data QA**: step through trim → ISO dates → ₹ parsing (incl. "lakh") → de-dup → robust-z anomaly flags.

## Deploy

### Vercel (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo and accept the defaults (`vercel.json` sets framework, build command and caching headers).
3. Vercel exposes `VERCEL_PROJECT_PRODUCTION_URL` at build time, and `vite.config.ts` uses it to write absolute `og:image` / canonical URLs. For a custom domain, set `SITE_URL=https://your.domain` in the project's environment variables.

Or use the CLI:

```bash
npx vercel --prod
```

### Netlify / Cloudflare Pages

Build command `npm run build`, output directory `dist`, and set `SITE_URL` to the final URL so social previews resolve.

## Performance and accessibility notes

- Only `transform` / `opacity` are animated. Demos are code-split (`React.lazy`), and the hero canvas pauses off-screen and when the tab is hidden.
- `prefers-reduced-motion` turns off Lenis, the custom cursor, the canvas animation and the marquees, and the timeline switches to a vertical list.
- The custom cursor only appears on fine pointers. All demos are keyboard-operable, with labelled controls and live regions.
- Secondary text uses `#666` rather than `#777` so it passes WCAG AA on the paper background.
