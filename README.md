# Chetan Nandanwar — Portfolio

Single-page portfolio built with Vite, React 19, TypeScript (strict), Tailwind CSS v4, Framer Motion and Lenis.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build
```

## Edit content

All text lives in [`src/data/portfolio.ts`](src/data/portfolio.ts): profile, links, stats, projects, experience, education, publications and skills. Components only read from it.

- **LinkedIn / resume:** fill `profile.links.linkedin` and `profile.links.resume` (put the PDF in `public/` and use `/your-file.pdf`). The icons and buttons appear automatically when set.
- **Photo:** `public/chetan.jpg`. **Social preview:** `public/og.png` (1200×630).
- **RAG demo corpus:** `src/data/constitution.ts` (paraphrased articles); retrieval logic in `src/lib/retrieval.ts`.

## What's where

| Path | Purpose |
| --- | --- |
| `src/index.css` | Theme tokens (`@theme`), glass, spotlight and chip styles |
| `src/components/NeuralCanvas.tsx` | Mouse-reactive neural field in the hero (Canvas 2D, pauses off-screen) |
| `src/components/Cursor.tsx` | Dot + ring cursor (fine pointers only) |
| `src/components/demos/RagPlayground.tsx` | Live hybrid retrieval: BM25 + concept-vector "dense" scores, α slider, citation parsing |
| `src/components/demos/RetinaDemo.tsx` | Procedural fundus image stepping through the DR pipeline stages |
| `src/lib/scroll.ts` | Lenis smooth scroll and `scrollToId` |

Motion respects `prefers-reduced-motion`: Lenis, the cursor, canvas animation and auto-cycling demos switch off.

## Deploy

**Vercel:** import the repo at vercel.com/new. Vite is detected; `vercel.json` adds long-lived caching for hashed assets.

**Netlify:** import the repo, or run `npx netlify deploy --prod --dir=dist` after `npm run build`. `netlify.toml` has the build settings.

**Cloudflare Pages:** build command `npm run build`, output directory `dist`.

After the first deploy, add your live URL as `og:url` in `index.html` so link previews resolve the image with an absolute URL.
