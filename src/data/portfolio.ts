// All site content lives here. Edit this file to update the portfolio;
// components only read from it.

export const profile = {
  name: 'Chetan Nandanwar',
  fullName: 'Nandanwar Chetan Hemraj',
  role: 'Data Scientist · ML Engineer',
  roles: ['retrieval systems', 'computer vision', 'deep learning', 'data pipelines'],
  tagline:
    'M.Tech Data Science at IIT Roorkee. I turn messy data into models and tools that hold up outside the notebook.',
  location: 'Roorkee, India',
  status: 'Open to ML / data science roles',
  email: 'nandanwar_ch@mfs.iitr.ac.in',
  photo: '/chetan.jpg',
  links: {
    github: 'https://github.com/chetan314',
    linkedin: '', // add your LinkedIn URL to show the icon
    resume: '', // e.g. '/Chetan-Nandanwar-Resume.pdf' after placing the file in /public
  },
}

export const about = {
  paragraphs: [
    'I came to machine learning through data work. At Forage AI I spent a year cleaning, validating and restructuring web-scraped and financial data, where I learned that most model problems are data problems.',
    'At IIT Roorkee I study data science and work on deep learning for vision and language: hybrid retrieval for Indian constitutional law, and surgical scene understanding with SAM-based and domain-adaptive models.',
  ],
  focus: ['Data Analytics', 'Deep Learning', 'Computer Vision', 'NLP', 'SQL'],
}

export const stats = [
  { value: 92, suffix: '%', label: 'model accuracy after building a data extraction tool' },
  { value: 50, suffix: '%', label: 'less manual effort from re-engineered SQL workflows' },
  { value: 40, suffix: '%', label: 'less manual cleaning of web-scraped data' },
  { value: 2, suffix: '', label: 'peer-reviewed publications in applied ML' },
]

export type Project = {
  id: string
  title: string
  org: string
  period: string
  summary: string
  points: string[]
  tags: string[]
  metric?: { value: string; label: string }
  links?: { label: string; href: string }[]
  demo?: 'rag' | 'retina' | 'surgical' | 'pipeline'
}

export const projects: Project[] = [
  {
    id: 'rag',
    title: 'RAG for Indian Constitutional Law',
    org: 'Primus Partners',
    period: 'Dec 2025 – Jan 2026',
    summary:
      'A retrieval-augmented Q&A system over the Constitution of India that fuses BM25 with semantic search and understands how Indian legal articles are numbered.',
    points: [
      'Hybrid retrieval: BM25 lexical scores fused with dense semantic similarity',
      'Custom parsing for article-numbering quirks such as 21A, 31-C and 243ZH',
      'Served through FastAPI with a Streamlit front end, packaged in Docker',
    ],
    tags: ['RAG', 'BM25', 'Semantic Search', 'FastAPI', 'Streamlit', 'Docker'],
    metric: { value: 'Hybrid', label: 'lexical + dense retrieval' },
    demo: 'rag',
  },
  {
    id: 'retina',
    title: 'Early Detection of Diabetic Retinopathy',
    org: 'SRMIST · published 2021',
    period: 'Jan – May 2021',
    summary:
      'Image processing pipeline that segments blood vessels, exudates and microaneurysms in retinal fundus images and classifies disease stage.',
    points: [
      'Pre-processing removes background variation and noise',
      'Morphological operations and segmentation isolate lesions',
      'Features from four sub-image partitions feed the classifier',
    ],
    tags: ['Computer Vision', 'Segmentation', 'Morphology', 'Python'],
    metric: { value: '4', label: 'sub-image feature partitions' },
    demo: 'retina',
  },
  {
    id: 'surgical',
    title: 'Surgical Scene Analysis',
    org: 'IIT Roorkee · Research Intern',
    period: 'Jun – Sep 2026',
    summary:
      'Research into deep learning for intraoperative scene understanding: tool and phase recognition, annotation protocols and what it takes to deploy in an operating room.',
    points: [
      'Synthesised four key papers on SAM-based and domain-adaptive architectures',
      'Delivered technical presentations and analysis documents',
    ],
    tags: ['SAM', 'Domain Adaptation', 'Deep Learning', 'Research'],
    metric: { value: '4', label: 'architectures analysed' },
    demo: 'surgical',
  },
  {
    id: 'forage',
    title: 'Data Extraction & QA Tooling',
    org: 'Forage AI',
    period: 'Mar 2022 – Jan 2023',
    summary:
      'Automation for cleaning and structuring web-scraped data, plus a statistical extraction tool for financial records that lifted downstream model accuracy.',
    points: [
      'Automated cleaning cut manual effort by 40%',
      'Re-engineered SQL workflows: 50% less manual work, ~15% faster process',
      'Anomaly and pattern detection on financial data',
    ],
    tags: ['SQL', 'Python', 'Pandas', 'Statistics'],
    metric: { value: '92%', label: 'model accuracy' },
    demo: 'pipeline',
  },
]

export type TimelineItem = {
  role: string
  org: string
  period: string
  kind: 'work' | 'research' | 'leadership'
  points: string[]
}

export const experience: TimelineItem[] = [
  {
    role: 'Research Intern',
    org: 'IIT Roorkee',
    period: 'Jun 2026 – Sep 2026',
    kind: 'research',
    points: [
      'Researched deep learning and computer vision methods for intraoperative surgical scene analysis.',
      'Analysed surgical tool and phase recognition, annotation protocols and OR deployment challenges.',
    ],
  },
  {
    role: 'Placement Coordinator',
    org: 'Placement & Internship Cell, IIT Roorkee',
    period: 'Apr 2026 – Present',
    kind: 'leadership',
    points: [
      'Coordinate with corporate HR teams to schedule interviews and keep candidate evaluations on time.',
      'Manage company outreach and recruitment drive participation for campus placements.',
    ],
  },
  {
    role: 'Wellness Council Member',
    org: 'Cautley Bhawan, IIT Roorkee',
    period: 'Aug 2025 – Sep 2026',
    kind: 'leadership',
    points: [
      'Led renovation and upkeep of shared wellness and library facilities.',
      'Organised community events across the academic year.',
    ],
  },
  {
    role: 'Data Specialist – Technical QA',
    org: 'Forage AI',
    period: 'Mar 2022 – Jan 2023',
    kind: 'work',
    points: [
      'Automated cleaning and structuring of web-scraped data, reducing manual effort by 40%.',
      'Re-engineered processes with better SQL, cutting manual effort by 50% and improving efficiency by ~15%.',
      'Built a data extraction tool for financial data that raised model accuracy to 92% using statistical analysis.',
    ],
  },
]

export const education = [
  { degree: 'M.Tech, Data Science', school: 'Indian Institute of Technology Roorkee', year: '2025 – 2027', score: 'CGPA 8.05' },
  { degree: 'B.Tech', school: 'SRM Institute of Science and Technology', year: '2021', score: 'CGPA 7.26' },
]

export const publications = [
  {
    title: 'A Unified and Semantic Methodology for Early Detection of Diabetic Retinopathy using Artificial Intelligence',
    authors: 'Aruna Arulmani, Chetan Nandanwar, Wahid Alhaan, Sumeet Kumar',
    venue: 'Annals of the Romanian Society for Cell Biology',
    year: 2021,
  },
  {
    title: 'Projecting Height and Weight with Machine Learning Using Anthropometric Measurements',
    authors: 'Shiela David, Chetan Nandanwar, Sumeet Kumar, Wahid Alhaan',
    venue: 'International Journal of Advanced Science and Technology (SERSC)',
    year: 2020,
  },
]

export const skills = [
  { group: 'Languages', items: ['Python', 'C++', 'C', 'SQL'] },
  { group: 'Data & ML', items: ['Pandas', 'NumPy', 'Matplotlib', 'Statistical Analysis', 'Image Segmentation', 'Hybrid Retrieval (BM25 + dense)'] },
  { group: 'Serving & Tools', items: ['FastAPI', 'Streamlit', 'Docker', 'MySQL', 'Git & GitHub', 'Jupyter', 'Google Colab', 'Excel'] },
  { group: 'Research Areas', items: ['Deep Learning', 'Computer Vision', 'NLP', 'Segment Anything (SAM)', 'Domain Adaptation'] },
  { group: 'CS Foundations', items: ['Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP'] },
  { group: 'Spoken', items: ['English', 'Hindi', 'Marathi'] },
]

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'research', label: 'Research' },
  { id: 'contact', label: 'Contact' },
]
