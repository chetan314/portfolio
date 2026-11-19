// A tiny hybrid retriever that runs in the browser for the RAG demo.
// Lexical: Okapi BM25. "Dense": cosine similarity over a hand-built concept
// space (a stand-in for sentence embeddings so the demo needs no model).
// Citations like "Art. 21-A" or "article 243 g" are parsed and boosted.

import { articles, type Article } from '../data/constitution'

const STOP = new Set(
  'a an the of to in on for and or is are be can i me my any by with from as at it this that do does what who how which shall not no into under all every their his her they without why tell about get if there was will would should could'.split(' '),
)

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem)
    .filter((t) => !STOP.has(t))
}

function stem(t: string) {
  if (t.length > 4 && t.endsWith('ies')) return t.slice(0, -3) + 'y'
  if (t.length > 5 && t.endsWith('ing')) return t.slice(0, -3)
  if (t.length > 4 && t.endsWith('ed')) return t.slice(0, -2)
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1)
  return t
}

// ---- concept space -------------------------------------------------------
const CONCEPTS: Record<string, string[]> = {
  equality: ['equal', 'equality', 'discriminat', 'discriminate', 'fair', 'bias', 'treat', 'same'],
  speech: ['speech', 'expression', 'press', 'media', 'journalist', 'opinion', 'say', 'protest', 'criticise', 'criticize', 'tweet', 'post', 'assemble', 'union'],
  liberty: ['life', 'liberty', 'privacy', 'dignity', 'live', 'personal', 'surveillance', 'free'],
  education: ['education', 'school', 'child', 'children', 'study', 'learn', 'student', 'kid'],
  arrest: ['arrest', 'detain', 'detention', 'custody', 'police', 'jail', 'magistrate', 'lawyer', 'bail'],
  religion: ['religion', 'faith', 'worship', 'conscience', 'belief', 'temple', 'mosque', 'church', 'convert', 'propagate'],
  courts: ['court', 'supreme', 'high', 'writ', 'remedy', 'petition', 'habea', 'mandamu', 'certiorari', 'justice', 'enforce'],
  property: ['property', 'land', 'own', 'house', 'acquire', 'acquisition', 'seize'],
  amendment: ['amend', 'amendment', 'change', 'modify', 'parliament', 'repeal', 'majority'],
  emergency: ['emergency', 'president', 'failure', 'machinery', 'dismiss', 'rule', 'governor'],
  duty: ['duty', 'duties', 'obligation', 'responsib', 'flag', 'anthem', 'environment'],
  caste: ['caste', 'untouchability', 'dalit', 'disability', 'backward'],
  employment: ['job', 'employment', 'appointment', 'office', 'reservation', 'post', 'hire', 'government'],
  local: ['panchayat', 'village', 'local', 'rural', 'gram', 'self'],
  family: ['marriage', 'divorce', 'inheritance', 'civil', 'code', 'family', 'uniform'],
}
const CONCEPT_KEYS = Object.keys(CONCEPTS)
const STEMMED_CONCEPTS = CONCEPT_KEYS.map((k) => CONCEPTS[k].map(stem))

function embed(tokens: string[]): number[] {
  const v = CONCEPT_KEYS.map(() => 0)
  for (const t of tokens) {
    STEMMED_CONCEPTS.forEach((words, i) => {
      if (words.some((w) => t === w || (w.length >= 5 && t.startsWith(w)))) v[i] += 1
    })
  }
  return v
}

function cosine(a: number[], b: number[]) {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

// ---- citation parsing ----------------------------------------------------
/** Finds references like "Article 21A", "art. 21-A", "Art 243 G". */
export function parseCitations(q: string): string[] {
  const out = new Set<string>()
  const re = /\b(?:art(?:icle)?s?)\.?\s*(\d{1,3})\s*(?:[-–(]?\s*([a-z]{1,2})\b\)?)?/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(q))) {
    const num = m[1]
    const suffix = (m[2] ?? '').toUpperCase()
    // Prefer the suffixed id if it exists in the corpus, else the bare number.
    if (suffix && articles.some((a) => a.id === num + suffix)) out.add(num + suffix)
    else out.add(num)
  }
  return [...out]
}

// ---- index ---------------------------------------------------------------
type Doc = { article: Article; tokens: string[]; tf: Map<string, number>; vec: number[] }

const docs: Doc[] = articles.map((article) => {
  const tokens = tokenize(`${article.title} ${article.title} ${article.text}`)
  const tf = new Map<string, number>()
  tokens.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1))
  return { article, tokens, tf, vec: embed(tokens) }
})
const avgdl = docs.reduce((s, d) => s + d.tokens.length, 0) / docs.length
const df = new Map<string, number>()
docs.forEach((d) => new Set(d.tokens).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)))

function bm25(qTokens: string[], d: Doc, k1 = 1.4, b = 0.75) {
  let s = 0
  for (const t of qTokens) {
    const f = d.tf.get(t)
    if (!f) continue
    const n = df.get(t) ?? 0
    const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5))
    s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.tokens.length) / avgdl)))
  }
  return s
}

export type Hit = {
  article: Article
  lexical: number // 0..1, normalised within the query
  dense: number // 0..1 cosine
  score: number
  cited: boolean
}

export type SearchResult = {
  hits: Hit[]
  tokens: string[]
  citations: string[]
  ms: number
}

export function search(query: string, alpha = 0.5, k = 3): SearchResult {
  const t0 = performance.now()
  const citations = parseCitations(query)
  const tokens = tokenize(query.replace(/\b(?:art(?:icle)?s?)\.?\s*\d{1,3}\s*[-–]?\s*[a-z]{0,2}\b/gi, ' '))
  const qv = embed(tokens)
  const raw = docs.map((d) => ({ d, lex: bm25(tokens, d), dense: cosine(qv, d.vec) }))
  const maxLex = Math.max(...raw.map((r) => r.lex), 1e-9)
  const hits = raw
    .map(({ d, lex, dense }) => {
      const lexical = lex / maxLex
      const cited = citations.includes(d.article.id)
      const score = (1 - alpha) * lexical + alpha * dense + (cited ? 1 : 0)
      return { article: d.article, lexical, dense, score, cited }
    })
    .filter((h) => h.score > 0.02)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
  return { hits, tokens, citations, ms: performance.now() - t0 }
}
