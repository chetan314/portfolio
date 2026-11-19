// Synthetic fundus generator + a real morphological pipeline.
// Everything here runs on actual pixels: green channel → denoise →
// contrast stretch → black-hat / top-hat → threshold → connected components.

export const N = 240
const C = N / 2
const FOV_R = 114
const DISC = { x: 70, y: 118, r: 15 }

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Lesion = { x: number; y: number; r: number }

export function generateFundus(seed: number): ImageData {
  const rand = rng(seed)
  const cv = document.createElement('canvas')
  cv.width = cv.height = N
  const g = cv.getContext('2d', { willReadFrequently: true })!
  g.fillStyle = '#000'
  g.fillRect(0, 0, N, N)

  g.save()
  g.beginPath()
  g.arc(C, C, FOV_R, 0, Math.PI * 2)
  g.clip()

  const bg = g.createRadialGradient(C + 10, C, 10, C, C, FOV_R)
  bg.addColorStop(0, '#d8692f')
  bg.addColorStop(0.75, '#a8401c')
  bg.addColorStop(1, '#6e2410')
  g.fillStyle = bg
  g.fillRect(0, 0, N, N)

  // uneven illumination — the thing pre-processing must remove
  const ill = g.createLinearGradient(0, 0, N, N * 0.6)
  const side = rand() > 0.5
  ill.addColorStop(side ? 0 : 1, 'rgba(255,190,120,0.28)')
  ill.addColorStop(side ? 1 : 0, 'rgba(40,0,0,0.18)')
  g.fillStyle = ill
  g.fillRect(0, 0, N, N)

  // macula
  const mac = g.createRadialGradient(152, 124, 2, 152, 124, 24)
  mac.addColorStop(0, 'rgba(70,12,0,0.5)')
  mac.addColorStop(1, 'rgba(70,12,0,0)')
  g.fillStyle = mac
  g.fillRect(0, 0, N, N)

  // vessels: recursive branching from the optic disc
  g.lineCap = 'round'
  g.lineJoin = 'round'
  const branch = (x: number, y: number, a: number, w: number, len: number, depth: number, curl: number) => {
    let px = x
    let py = y
    const steps = Math.floor(len / 4)
    for (let i = 0; i < steps; i++) {
      a += curl + (rand() - 0.5) * 0.22
      const nx = px + Math.cos(a) * 4
      const ny = py + Math.sin(a) * 4
      g.strokeStyle = `rgba(92,16,8,${0.75 + w * 0.04})`
      g.lineWidth = w
      g.beginPath()
      g.moveTo(px, py)
      g.lineTo(nx, ny)
      g.stroke()
      px = nx
      py = ny
      if (depth > 0 && i > 3 && rand() < 0.085) {
        branch(px, py, a + (rand() > 0.5 ? 1 : -1) * (0.5 + rand() * 0.5), w * 0.68, len * 0.55, depth - 1, curl * 0.6)
      }
      w = Math.max(1.1, w * 0.992)
    }
  }
  branch(DISC.x + 4, DISC.y - 6, -0.55, 4.4, 190, 3, 0.012)
  branch(DISC.x + 4, DISC.y + 6, 0.55, 4.4, 190, 3, -0.012)
  branch(DISC.x - 4, DISC.y - 6, -2.4, 3.6, 70, 2, -0.01)
  branch(DISC.x - 4, DISC.y + 6, 2.4, 3.6, 70, 2, 0.01)
  branch(DISC.x + 6, DISC.y, 0.05, 2.4, 60, 1, 0)

  // optic disc
  const disc = g.createRadialGradient(DISC.x, DISC.y, 2, DISC.x, DISC.y, DISC.r + 4)
  disc.addColorStop(0, '#fff3c4')
  disc.addColorStop(0.6, '#f6c070')
  disc.addColorStop(1, 'rgba(230,140,70,0)')
  g.fillStyle = disc
  g.beginPath()
  g.arc(DISC.x, DISC.y, DISC.r + 4, 0, Math.PI * 2)
  g.fill()

  const inField = () => {
    for (;;) {
      const x = 40 + rand() * 160
      const y = 30 + rand() * 180
      const dc = Math.hypot(x - C, y - C)
      const dd = Math.hypot(x - DISC.x, y - DISC.y)
      if (dc < FOV_R - 18 && dd > 34) return { x, y }
    }
  }

  // severity varies with the seed
  const severity = rand()
  const clusters = severity < 0.25 ? 0 : 1 + Math.floor(rand() * 3)
  for (let k = 0; k < clusters; k++) {
    const c = inField()
    const n = 3 + Math.floor(rand() * 6)
    for (let i = 0; i < n; i++) {
      g.fillStyle = '#ffe27a'
      g.beginPath()
      g.arc(c.x + (rand() - 0.5) * 22, c.y + (rand() - 0.5) * 22, 1.4 + rand() * 1.8, 0, Math.PI * 2)
      g.fill()
    }
  }
  const mas = severity < 0.12 ? 0 : 2 + Math.floor(rand() * 8)
  for (let i = 0; i < mas; i++) {
    const p = inField()
    g.fillStyle = '#4e0a05'
    g.beginPath()
    g.arc(p.x, p.y, 1.7 + rand() * 0.6, 0, Math.PI * 2)
    g.fill()
  }
  g.restore()

  const img = g.getImageData(0, 0, N, N)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] + d[i + 1] + d[i + 2] === 0) continue
    const n = (rand() - 0.5) * 16
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  return img
}

/* ----------------------------------------------------------- morphology */
function filter1D(src: Float32Array, r: number, horiz: boolean, op: 'max' | 'min') {
  const out = new Float32Array(src.length)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let v = op === 'max' ? -Infinity : Infinity
      for (let k = -r; k <= r; k++) {
        const xx = horiz ? x + k : x
        const yy = horiz ? y : y + k
        if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue
        const s = src[yy * N + xx]
        v = op === 'max' ? (s > v ? s : v) : s < v ? s : v
      }
      out[y * N + x] = v
    }
  }
  return out
}
const dilate = (a: Float32Array, r: number) => filter1D(filter1D(a, r, true, 'max'), r, false, 'max')
const erode = (a: Float32Array, r: number) => filter1D(filter1D(a, r, true, 'min'), r, false, 'min')

function components(mask: Uint8Array) {
  const label = new Int32Array(mask.length).fill(-1)
  const comps: { px: number[]; minx: number; maxx: number; miny: number; maxy: number }[] = []
  const stack: number[] = []
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i] >= 0) continue
    const c = { px: [] as number[], minx: N, maxx: 0, miny: N, maxy: 0 }
    label[i] = comps.length
    stack.push(i)
    while (stack.length) {
      const p = stack.pop()!
      c.px.push(p)
      const x = p % N
      const y = (p / N) | 0
      if (x < c.minx) c.minx = x
      if (x > c.maxx) c.maxx = x
      if (y < c.miny) c.miny = y
      if (y > c.maxy) c.maxy = y
      const nb = [p - 1, p + 1, p - N, p + N]
      for (const q of nb) {
        if (q < 0 || q >= mask.length) continue
        if (Math.abs((q % N) - x) > 1) continue
        if (mask[q] && label[q] < 0) {
          label[q] = comps.length
          stack.push(q)
        }
      }
    }
    comps.push(c)
  }
  return comps
}

export type Quadrant = { name: string; vessel: number; exudates: number; mas: number }

export type Analysis = {
  raw: ImageData
  pre: ImageData
  morph: ImageData
  seg: ImageData
  mas: Lesion[]
  exudates: Lesion[]
  quadrants: Quadrant[]
  grade: string
  ms: number
}

export function analyse(raw: ImageData): Analysis {
  const t0 = performance.now()
  const d = raw.data
  const fov = new Uint8Array(N * N)
  const disc = new Uint8Array(N * N)
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const i = y * N + x
      fov[i] = Math.hypot(x - C, y - C) < FOV_R - 7 ? 1 : 0
      disc[i] = Math.hypot(x - DISC.x, y - DISC.y) < DISC.r + 11 ? 1 : 0
    }

  // 1 · green channel + 3×3 mean (denoise)
  const green = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) green[i] = d[i * 4 + 1]
  const smooth = new Float32Array(N * N)
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let s = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx
          const yy = y + dy
          if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue
          s += green[yy * N + xx]
          n++
        }
      smooth[y * N + x] = s / n
    }

  // 2 · flatten illumination: estimate the background with an alternating
  //     sequential filter (closing then opening removes small dark AND bright
  //     structures), subtract it, then stretch symmetrically around mid-grey.
  // pad outside the field of view with the FOV median so filters don't see black
  const inside: number[] = []
  for (let i = 0; i < N * N; i++) if (fov[i]) inside.push(smooth[i])
  inside.sort((a, b) => a - b)
  const med = inside[inside.length >> 1]
  const padded = smooth.map((v, i) => (fov[i] ? v : med))
  const bgEst = dilate(erode(erode(dilate(padded, 6), 6), 11), 11) // closing → opening
  const flat = new Float32Array(N * N)
  const vals: number[] = []
  for (let i = 0; i < N * N; i++) {
    flat[i] = padded[i] - bgEst[i]
    if (fov[i] && !disc[i]) vals.push(flat[i])
  }
  vals.sort((a, b) => a - b)
  const span = Math.max(Math.abs(vals[Math.floor(vals.length * 0.005)]), Math.abs(vals[Math.floor(vals.length * 0.998)]), 1)
  const pre = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) pre[i] = fov[i] ? Math.max(0, Math.min(255, 150 + (flat[i] / span) * 125)) : 0

  // 3 · black-hat (dark thin structures) and top-hat (bright small spots)
  const prePad = pre.map((v, i) => (fov[i] ? v : 150))
  const closed = erode(dilate(prePad, 4), 4)
  const opened = dilate(erode(prePad, 4), 4)
  const black = new Float32Array(N * N)
  const top = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    const ok = fov[i] && !disc[i]
    black[i] = ok ? closed[i] - prePad[i] : 0
    top[i] = ok ? prePad[i] - opened[i] : 0
  }

  // 4 · thresholds (relative to each map's distribution)
  const pct = (a: Float32Array, p: number) => {
    const v: number[] = []
    for (let i = 0; i < a.length; i++) if (fov[i] && !disc[i]) v.push(a[i])
    v.sort((x, y) => x - y)
    return v[Math.floor(v.length * p)]
  }
  const tb = Math.max(28, pct(black, 0.86))
  const tt = 80 // exudates are far brighter than anything else once the disc is masked
  const vMask = new Uint8Array(N * N)
  const eMask = new Uint8Array(N * N)
  for (let i = 0; i < N * N; i++) {
    vMask[i] = black[i] > tb ? 1 : 0
    // must also be brighter than the flattened background (~150), which rules
    // out the narrow gaps between neighbouring vessels
    eMask[i] = top[i] > tt && pre[i] > 205 ? 1 : 0
  }

  const mas: Lesion[] = []
  const vessel = new Uint8Array(N * N)
  for (const c of components(vMask)) {
    const w = c.maxx - c.minx + 1
    const h = c.maxy - c.miny + 1
    if (c.px.length < 5) continue
    const cx = (c.minx + c.maxx) / 2
    const cy = (c.miny + c.maxy) / 2
    const darkest = Math.min(...c.px.map((q) => pre[q]))
    const roundSmall = c.px.length <= 34 && w <= 8 && h <= 8 && w / h < 2 && h / w < 2
    if (roundSmall && darkest < 100 && Math.hypot(cx - C, cy - C) < FOV_R - 16) {
      mas.push({ x: cx, y: cy, r: Math.max(w, h) / 2 + 4 })
    } else if (c.px.length > 24) {
      for (const p of c.px) vessel[p] = 1
    }
  }
  const exudates: Lesion[] = []
  const exu = new Uint8Array(N * N)
  for (const c of components(eMask)) {
    if (c.px.length < 3) continue
    for (const p of c.px) exu[p] = 1
    exudates.push({ x: (c.minx + c.maxx) / 2, y: (c.miny + c.maxy) / 2, r: 3 })
  }

  // images
  const gray = (src: Float32Array, gain = 1) => {
    const o = new ImageData(N, N)
    for (let i = 0; i < N * N; i++) {
      const v = Math.min(255, src[i] * gain)
      o.data[i * 4] = o.data[i * 4 + 1] = o.data[i * 4 + 2] = v
      o.data[i * 4 + 3] = 255
    }
    return o
  }
  const preImg = gray(pre)
  const morph = new ImageData(N, N)
  for (let i = 0; i < N * N; i++) {
    const b = Math.min(255, black[i] * 3)
    const t = top[i] > 40 ? Math.min(255, top[i] * 2.2) : 0
    // vessels white, bright lesions acid
    morph.data[i * 4] = Math.min(255, b + t * 0.87)
    morph.data[i * 4 + 1] = Math.min(255, b + t)
    morph.data[i * 4 + 2] = b
    morph.data[i * 4 + 3] = 255
  }
  const seg = new ImageData(N, N)
  for (let i = 0; i < N * N; i++) {
    const v = pre[i] * 0.35 + 20 * fov[i]
    let r = v
    let g = v
    let b = v
    if (vessel[i]) [r, g, b] = [36, 87, 255]
    if (exu[i]) [r, g, b] = [223, 255, 0]
    seg.data[i * 4] = r
    seg.data[i * 4 + 1] = g
    seg.data[i * 4 + 2] = b
    seg.data[i * 4 + 3] = 255
  }

  // 5 · four sub-image partitions
  const names = ['Superior-temporal', 'Superior-nasal', 'Inferior-temporal', 'Inferior-nasal']
  const quadrants: Quadrant[] = names.map((name) => ({ name, vessel: 0, exudates: 0, mas: 0 }))
  const area = [0, 0, 0, 0]
  const qi = (x: number, y: number) => (y < C ? 0 : 2) + (x < C ? 1 : 0)
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const i = y * N + x
      if (!fov[i]) continue
      const q = qi(x, y)
      area[q]++
      if (vessel[i]) quadrants[q].vessel++
    }
  quadrants.forEach((q, i) => (q.vessel = (q.vessel / (area[i] || 1)) * 100))
  exudates.forEach((e) => quadrants[qi(e.x, e.y)].exudates++)
  mas.forEach((m) => quadrants[qi(m.x, m.y)].mas++)

  const grade =
    mas.length === 0 && exudates.length === 0
      ? 'No apparent DR'
      : exudates.length === 0 && mas.length <= 4
        ? 'Mild NPDR'
        : 'Moderate NPDR'

  return { raw, pre: preImg, morph, seg, mas, exudates, quadrants, grade, ms: performance.now() - t0 }
}

export const CENTER = C
export const FOV_RADIUS = FOV_R
