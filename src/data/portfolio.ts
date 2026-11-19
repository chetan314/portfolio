// ─────────────────────────────────────────────────────────────────────────
// All site content lives here. Edit this file to update the portfolio —
// components only read from it.
// ─────────────────────────────────────────────────────────────────────────

export const profile = {
  name: 'Chetan Nandanwar',
  first: 'Chetan',
  last: 'Nandanwar',
  fullName: 'Nandanwar Chetan Hemraj',
  role: 'ML Engineer & Data Scientist',
  headline: 'I build retrieval systems and vision models that hold up on real, messy data.',
  location: 'Roorkee, India',
  coords: '29.86°N 77.89°E',
  timezone: 'Asia/Kolkata',
  status: 'Open to ML / Data Science roles · 2027',
  email: 'nandanwar_ch@mfs.iitr.ac.in',
  photo: `${import.meta.env.BASE_URL}chetan.jpg`,
  links: {
    github: 'https://github.com/chetan314',
    linkedin: 'https://www.linkedin.com/in/chetan-nandanwar-293826225/',
    instagram: 'https://www.instagram.com/username__string/',
    resume: '', // e.g. '/Chetan-Nandanwar-Resume.pdf' after placing the file in /public
  },
}

export const marquee = [
  'Retrieval-Augmented Generation',
  'Computer Vision',
  'BM25 × Dense',
  'Segment Anything',
  'Domain Adaptation',
  'Image Segmentation',
  'SQL Pipelines',
  'FastAPI',
  'IIT Roorkee',
]

// ── 02 · Model card ─────────────────────────────────────────────────────
export const modelCard = {
  id: 'chetan-nandanwar/ml-engineer-v2026',
  pitch: [
    'I came to machine learning through data work. A year of cleaning, validating and restructuring web-scraped and financial data at Forage AI taught me that most model problems are data problems.',
    'At IIT Roorkee I work on deep learning for vision and language: hybrid retrieval for Indian constitutional law, and surgical scene understanding with SAM-based and domain-adaptive models.',
  ],
  tags: ['data-analytics', 'deep-learning', 'computer-vision', 'nlp', 'sql'],
  rows: [
    { k: 'Architecture', v: 'Data engineer → ML researcher, fine-tuned at IIT Roorkee' },
    { k: 'Intended use', v: 'Retrieval / RAG systems, computer vision, data pipelines that ship' },
    { k: 'Strengths', v: 'Turning messy, real-world data into something a model can trust' },
    { k: 'Languages', v: 'English · Hindi · Marathi · Python · SQL · C++' },
    { k: 'Base location', v: 'Roorkee, India' },
  ],
  metrics: [
    { value: 92, suffix: '%', label: 'model accuracy after a data-extraction tool I built' },
    { value: 50, suffix: '%', label: 'less manual effort from re-engineered SQL workflows' },
    { value: 40, suffix: '%', label: 'less manual cleaning of web-scraped data' },
    { value: 2, suffix: '', label: 'peer-reviewed publications in applied ML' },
  ],
  training: [
    { k: 'M.Tech, Data Science', v: 'IIT Roorkee', when: '2025 – 2027', score: 'CGPA 8.05' },
    { k: 'B.Tech', v: 'SRM Institute of Science & Technology', when: '2017 – 2021', score: 'CGPA 7.26' },
    { k: 'Class XII', v: 'Dinanath Jr. College (Maharashtra Board)', when: '2017', score: '76.6%' },
    { k: 'Class X', v: "St. Xavier's (CBSE)", when: '2014', score: 'CGPA 8.8' },
  ],
}

// ── 03 · Selected work ──────────────────────────────────────────────────
export type Tone = 'blue' | 'orange' | 'acid' | 'ink'
export type DemoKind = 'rag' | 'retina' | 'surgical' | 'pipeline'

export type Project = {
  id: string
  code: string
  title: string
  kicker: string
  org: string
  period: string
  tone: Tone
  summary: string
  tags: string[]
  metric: { value: string; label: string }
  demo: DemoKind
  demoNote: string
  caseStudy: { problem: string; approach: string[]; outcome: string }
  links?: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    id: 'rag',
    code: 'P/01',
    title: 'Constitutional RAG',
    kicker: 'Hybrid retrieval for Indian law',
    org: 'Primus Partners',
    period: 'Dec 2025 – Jan 2026',
    tone: 'blue',
    summary:
      'A retrieval-augmented Q&A system over the Constitution of India that fuses BM25 with semantic search — and actually understands how Indian articles are numbered.',
    tags: ['RAG', 'BM25', 'Semantic search', 'FastAPI', 'Streamlit', 'Docker'],
    metric: { value: 'BM25 + dense', label: 'score fusion' },
    demo: 'rag',
    demoNote: 'Live: a miniature version of the retriever, running in your browser.',
    caseStudy: {
      problem:
        'Legal questions mix plain language ("can police hold me without a lawyer?") with exact citations ("Art. 21-A", "243ZH"). Pure semantic search blurs the citations; pure keyword search misses the paraphrases.',
      approach: [
        'Okapi BM25 for exact lexical matches, fused with dense semantic similarity under a tunable weight.',
        'A citation parser that normalises article-numbering quirks — 21A vs 21-A vs "21 a", 31C, 243ZH — and boosts exact hits.',
        'Served through FastAPI with a Streamlit front end, packaged in Docker for repeatable deployment.',
      ],
      outcome:
        'One retriever that handles both exact citations and paraphrased questions, deployed as a containerised API with a usable front end.',
    },
  },
  {
    id: 'retina',
    code: 'P/02',
    title: 'Retinopathy Screen',
    kicker: 'Early detection of diabetic retinopathy',
    org: 'SRMIST · published 2021',
    period: 'Jan – May 2021',
    tone: 'orange',
    summary:
      'An image-processing pipeline that segments blood vessels, exudates and microaneurysms in retinal fundus images, then classifies using features from four sub-image partitions.',
    tags: ['Computer vision', 'Morphology', 'Segmentation', 'Python'],
    metric: { value: '4', label: 'sub-image feature partitions' },
    demo: 'retina',
    demoNote: 'Live: real morphological operators on a synthetic fundus, computed in your browser.',
    caseStudy: {
      problem:
        'Diabetic retinopathy is treatable when caught early, but its first signs — microaneurysms and exudates — are a few pixels wide and sit on top of uneven illumination.',
      approach: [
        'Pre-processing to remove background variation and noise before any segmentation.',
        'Morphological operations and segmentation to isolate blood vessels, exudates and microaneurysms.',
        'Features extracted from four sub-image partitions feed the classifier, so local lesions are not averaged away.',
      ],
      outcome:
        'Published in the Annals of the Romanian Society for Cell Biology (2021) as “A Unified and Semantic Methodology for Early Detection of Diabetic Retinopathy using AI”.',
    },
  },
  {
    id: 'surgical',
    code: 'P/03',
    title: 'Surgical Scene AI',
    kicker: 'Intraoperative scene understanding',
    org: 'IIT Roorkee · Research Intern',
    period: 'Jun – Sep 2026',
    tone: 'acid',
    summary:
      'Research into deep learning for the operating room: surgical tool and phase recognition, annotation protocols, and what it takes to deploy a model next to a surgeon.',
    tags: ['SAM', 'Domain adaptation', 'Phase recognition', 'Research'],
    metric: { value: '4', label: 'key architectures synthesised' },
    demo: 'surgical',
    demoNote: 'Illustrative: the tool + phase annotation task, with point-prompted masks.',
    caseStudy: {
      problem:
        'Surgical video is hard data: smoke, blood, specular glare and constant camera motion — and labelled data is scarce, expensive and hospital-specific.',
      approach: [
        'Synthesised four key papers on SAM-based and domain-adaptive architectures for surgical segmentation.',
        'Analysed tool and phase recognition, annotation protocols, and operating-room deployment constraints.',
        'Delivered technical presentations and written analyses to the research group.',
      ],
      outcome:
        'Technical presentations and analysis documents covering architectures, annotation protocols and OR deployment challenges.',
    },
  },
  {
    id: 'forage',
    code: 'P/04',
    title: 'Data QA Engine',
    kicker: 'Automated cleaning + anomaly detection',
    org: 'Forage AI',
    period: 'Mar 2022 – Jan 2023',
    tone: 'ink',
    summary:
      'Automation that cleans and structures web-scraped data, plus a statistical extraction tool for financial records that lifted downstream model accuracy to 92%.',
    tags: ['SQL', 'Python', 'Pandas', 'Statistics'],
    metric: { value: '92%', label: 'downstream model accuracy' },
    demo: 'pipeline',
    demoNote: 'Live: run the cleaning pipeline step by step on a messy scrape.',
    caseStudy: {
      problem:
        'Scraped financial data arrives with inconsistent formats, duplicates and silent outliers — and every bad row leaks straight into downstream models.',
      approach: [
        'Automated trimming, normalisation, de-duplication and type coercion of web-scraped records.',
        'Re-engineered the QA workflow around better SQL queries.',
        'Statistical pattern and anomaly detection on financial data, packaged as an extraction tool.',
      ],
      outcome:
        '40% less manual cleaning, 50% less manual effort from the SQL re-engineering, ~15% better process efficiency, and model accuracy raised to 92%.',
    },
  },
]

// ── 04 · Training log (experience) ──────────────────────────────────────
export type Epoch = {
  period: string
  role: string
  org: string
  kind: 'education' | 'work' | 'research' | 'leadership' | 'project'
  points: string[]
  loss: number // a playful, monotonically-ish decreasing "loss" for the chart
}

export const epochs: Epoch[] = [
  {
    period: '2017 – 2021',
    role: 'B.Tech',
    org: 'SRM Institute of Science & Technology',
    kind: 'education',
    points: ['Two applied-ML publications: anthropometric regression (2020) and diabetic retinopathy detection (2021).'],
    loss: 0.92,
  },
  {
    period: 'Mar 2022 – Jan 2023',
    role: 'Data Specialist — Technical QA',
    org: 'Forage AI',
    kind: 'work',
    points: [
      'Automated cleaning of web-scraped data: −40% manual effort.',
      'Re-engineered SQL workflows: −50% manual effort, ~15% more efficient.',
      'Built a financial data-extraction tool that raised model accuracy to 92%.',
    ],
    loss: 0.61,
  },
  {
    period: 'Aug 2025 →',
    role: 'M.Tech, Data Science',
    org: 'IIT Roorkee',
    kind: 'education',
    points: ['CGPA 8.05. Deep learning, computer vision, NLP and data analytics.'],
    loss: 0.44,
  },
  {
    period: 'Aug 2025 – Sep 2026',
    role: 'Wellness Council Member',
    org: 'Cautley Bhawan, IIT Roorkee',
    kind: 'leadership',
    points: ['Led renovation of shared wellness and library facilities; ran community events all year.'],
    loss: 0.39,
  },
  {
    period: 'Dec 2025 – Jan 2026',
    role: 'RAG Engineer (project)',
    org: 'Primus Partners',
    kind: 'project',
    points: ['Hybrid BM25 + semantic retrieval for Indian constitutional law; FastAPI, Streamlit, Docker.'],
    loss: 0.27,
  },
  {
    period: 'Apr 2026 →',
    role: 'Placement Coordinator',
    org: 'Placement & Internship Cell, IIT Roorkee',
    kind: 'leadership',
    points: ['Coordinate with corporate HR on interview schedules, outreach and campus recruitment drives.'],
    loss: 0.21,
  },
  {
    period: 'Jun – Sep 2026',
    role: 'Research Intern',
    org: 'IIT Roorkee',
    kind: 'research',
    points: [
      'Deep learning for intraoperative surgical scene analysis.',
      'Synthesised four papers on SAM-based and domain-adaptive architectures.',
    ],
    loss: 0.12,
  },
]

// ── 05 · Research ───────────────────────────────────────────────────────
export const publications = [
  {
    key: 'arulmani2021retinopathy',
    title: 'A Unified and Semantic Methodology for Early Detection of Diabetic Retinopathy using Artificial Intelligence',
    authors: ['Aruna Arulmani', 'Chetan Nandanwar', 'Wahid Alhaan', 'Sumeet Kumar'],
    venue: 'Annals of the Romanian Society for Cell Biology',
    publisher: 'Association of Cell Biology Romania',
    year: 2021,
    topic: 'Computer vision · Medical imaging',
  },
  {
    key: 'david2020anthropometric',
    title: 'Projecting Height and Weight with Machine Learning Using Anthropometric Measurements',
    authors: ['Shiela David', 'Chetan Nandanwar', 'Sumeet Kumar', 'Wahid Alhaan'],
    venue: 'International Journal of Advanced Science and Technology',
    publisher: 'Science and Engineering Research Support Society (SERSC)',
    year: 2020,
    topic: 'Regression · Applied ML',
  },
]

export const researchInterests = [
  'Surgical scene understanding',
  'Segment Anything (SAM)',
  'Domain adaptation',
  'Hybrid retrieval & RAG',
  'Medical imaging',
]

// ── 06 · Skills matrix ──────────────────────────────────────────────────
// Each skill lists the projects (by id) where it was used, which drives the matrix.
export const matrixColumns = [
  { id: 'rag', label: 'RAG' },
  { id: 'retina', label: 'Retina' },
  { id: 'surgical', label: 'Surgical' },
  { id: 'forage', label: 'Forage' },
  { id: 'pubs', label: 'Papers' },
] as const

export type SkillGroup = 'Languages' | 'Data & ML' | 'Serving' | 'Research' | 'Foundations'

export const skills: { name: string; group: SkillGroup; used: string[] }[] = [
  { name: 'Python', group: 'Languages', used: ['rag', 'retina', 'surgical', 'forage', 'pubs'] },
  { name: 'SQL / MySQL', group: 'Languages', used: ['forage'] },
  { name: 'C++', group: 'Languages', used: [] },
  { name: 'C', group: 'Languages', used: [] },
  { name: 'Pandas', group: 'Data & ML', used: ['rag', 'forage', 'pubs'] },
  { name: 'NumPy', group: 'Data & ML', used: ['rag', 'retina', 'forage', 'pubs'] },
  { name: 'Matplotlib', group: 'Data & ML', used: ['retina', 'forage', 'pubs'] },
  { name: 'Statistical analysis', group: 'Data & ML', used: ['forage', 'pubs'] },
  { name: 'Image segmentation', group: 'Data & ML', used: ['retina', 'surgical'] },
  { name: 'BM25 + dense retrieval', group: 'Data & ML', used: ['rag'] },
  { name: 'FastAPI', group: 'Serving', used: ['rag'] },
  { name: 'Streamlit', group: 'Serving', used: ['rag'] },
  { name: 'Docker', group: 'Serving', used: ['rag'] },
  { name: 'Git & GitHub', group: 'Serving', used: ['rag', 'retina', 'forage'] },
  { name: 'Jupyter / Colab', group: 'Serving', used: ['retina', 'surgical', 'pubs'] },
  { name: 'Deep learning', group: 'Research', used: ['surgical'] },
  { name: 'Computer vision', group: 'Research', used: ['retina', 'surgical', 'pubs'] },
  { name: 'NLP', group: 'Research', used: ['rag'] },
  { name: 'SAM', group: 'Research', used: ['surgical'] },
  { name: 'Domain adaptation', group: 'Research', used: ['surgical'] },
  { name: 'DSA', group: 'Foundations', used: [] },
  { name: 'DBMS', group: 'Foundations', used: ['forage'] },
  { name: 'Operating systems', group: 'Foundations', used: [] },
  { name: 'Computer networks', group: 'Foundations', used: [] },
  { name: 'OOP', group: 'Foundations', used: [] },
]

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'log', label: 'Log' },
  { id: 'research', label: 'Research' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]
