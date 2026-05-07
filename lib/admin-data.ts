export type AdminSkill = {
  id: string;
  name: string;
  category: string;
  downloads: number;
  status: "Published" | "Draft" | "Archived";
  createdAt: string;
  slug: string;
  description: string;
  previewBg: string;
  content: string;
  tags: string;
};

export type Submission = {
  id: string;
  submitterName: string;
  submitterEmail: string;
  submitterId?: string;
  skillName: string;
  category: string;
  description?: string;
  submittedDate: string;
  content: string;
  github?: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type ActivityItem = {
  id: string;
  type: "submission" | "approval" | "subscriber" | "rejection";
  description: string;
  timestamp: string;
};

export type DailyMetric = {
  date: string;
  downloads: number;
  visitors: number;
};

export type CategoryDownload = {
  category: string;
  downloads: number;
  fill: string;
};

export type TrafficSource = {
  name: string;
  value: number;
  fill: string;
};

function generateDailyData(days: number): DailyMetric[] {
  const data: DailyMetric[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      downloads: Math.floor(Math.random() * 400) + 80,
      visitors: Math.floor(Math.random() * 900) + 200,
    });
  }
  return data;
}

export const DAILY_DATA_30 = generateDailyData(30);
export const DAILY_DATA_7 = DAILY_DATA_30.slice(-7);
export const DAILY_DATA_90 = generateDailyData(90);

export const CATEGORY_DOWNLOADS: CategoryDownload[] = [
  { category: "Writing", downloads: 12400, fill: "#A37764" },
  { category: "Coding", downloads: 18900, fill: "#B8906E" },
  { category: "Marketing", downloads: 8700, fill: "#C9A882" },
  { category: "Automation", downloads: 11200, fill: "#D4B896" },
  { category: "Business", downloads: 9600, fill: "#8B6348" },
  { category: "Research", downloads: 7100, fill: "#6B4A34" },
  { category: "Social Media", downloads: 14300, fill: "#E0C8B0" },
];

export const TRAFFIC_SOURCES: TrafficSource[] = [
  { name: "Direct", value: 38, fill: "#A37764" },
  { name: "Search", value: 31, fill: "#8B6348" },
  { name: "Social", value: 18, fill: "#C9A882" },
  { name: "Referral", value: 13, fill: "#D4B896" },
];

export const ADMIN_SKILLS: AdminSkill[] = [
  {
    id: "1",
    name: "Blog Post Generator",
    category: "Writing",
    downloads: 4821,
    status: "Published",
    createdAt: "2026-01-15",
    slug: "blog-post-generator",
    description: "Generate SEO-optimized blog posts from a simple topic prompt.",
    previewBg: "#D6E4F0",
    content: `You are a professional SEO blog writer. When given a topic, write a comprehensive, engaging blog post that:\n- Has a compelling headline\n- Includes an introduction, 3-5 main sections with subheadings\n- Is optimized for search with natural keyword usage\n- Ends with a clear call to action\n\nTopic: {{topic}}\nTarget audience: {{audience}}\nWord count: {{word_count}}`,
    tags: "writing, seo, content",
  },
  {
    id: "2",
    name: "Code Reviewer Pro",
    category: "Coding",
    downloads: 6340,
    status: "Published",
    createdAt: "2026-01-20",
    slug: "code-reviewer-pro",
    description: "Get detailed code reviews with improvement suggestions and best practices.",
    previewBg: "#D4EAD4",
    content: `You are a senior software engineer conducting a thorough code review. Analyze the provided code for:\n- Bugs and logic errors\n- Security vulnerabilities\n- Performance issues\n- Code style and readability\n- Best practices adherence\n\nProvide specific line-by-line feedback with examples of improvements.\n\nCode: {{code}}\nLanguage: {{language}}`,
    tags: "coding, review, quality",
  },
  {
    id: "3",
    name: "Ad Copy Writer",
    category: "Marketing",
    downloads: 3150,
    status: "Published",
    createdAt: "2026-02-01",
    slug: "ad-copy-writer",
    description: "Write high-converting ad copy for Facebook, Google, and LinkedIn.",
    previewBg: "#F5DEB3",
    content: `You are a direct-response copywriter. Create compelling ad copy that:\n- Hooks attention in the first line\n- Highlights the core benefit\n- Creates urgency or FOMO\n- Has a clear CTA\n\nProduct: {{product}}\nPlatform: {{platform}}\nTarget audience: {{audience}}`,
    tags: "marketing, ads, copywriting",
  },
  {
    id: "4",
    name: "Email Drip Sequence",
    category: "Automation",
    downloads: 2890,
    status: "Published",
    createdAt: "2026-02-05",
    slug: "email-drip-sequence",
    description: "Build a complete 5-email nurture sequence for any product.",
    previewBg: "#E8D5F0",
    content: `You are an email marketing specialist. Create a 5-email nurture sequence for: {{product}}\n\nEmail 1 (Day 0): Welcome + value\nEmail 2 (Day 2): Education\nEmail 3 (Day 5): Social proof\nEmail 4 (Day 8): Objection handling\nEmail 5 (Day 12): Offer + CTA`,
    tags: "automation, email, nurture",
  },
  {
    id: "5",
    name: "Business Plan Builder",
    category: "Business",
    downloads: 5120,
    status: "Published",
    createdAt: "2026-02-10",
    slug: "business-plan-builder",
    description: "Generate a structured business plan with financials overview.",
    previewBg: "#FFE4CC",
    content: `You are a business consultant. Create a comprehensive business plan for: {{business_idea}}\n\nInclude: Executive Summary, Market Analysis, Product/Service Description, Marketing Strategy, Operations Plan, Financial Projections (3 years), Risk Analysis.`,
    tags: "business, planning, strategy",
  },
  {
    id: "6",
    name: "SQL Query Builder",
    category: "Coding",
    downloads: 7200,
    status: "Published",
    createdAt: "2026-02-15",
    slug: "sql-query-builder",
    description: "Write complex SQL queries from plain English descriptions.",
    previewBg: "#C8E6C9",
    content: `You are a database expert. Convert the following request into optimized SQL:\n\nRequest: {{request}}\nDatabase type: {{db_type}}\nSchema: {{schema}}\n\nReturn the SQL query with an explanation of each clause.`,
    tags: "coding, sql, database",
  },
  {
    id: "7",
    name: "Research Summarizer",
    category: "Research",
    downloads: 4005,
    status: "Draft",
    createdAt: "2026-03-01",
    slug: "research-summarizer",
    description: "Summarize academic papers and research documents into key insights.",
    previewBg: "#FFF9C4",
    content: `You are a research analyst. Summarize the following document into:\n- 3-sentence executive summary\n- 5 key findings\n- Methodology overview\n- Limitations\n- Practical implications\n\nDocument: {{document}}`,
    tags: "research, summary, academic",
  },
  {
    id: "8",
    name: "Twitter Thread Crafter",
    category: "Social Media",
    downloads: 8910,
    status: "Published",
    createdAt: "2026-03-05",
    slug: "twitter-thread-crafter",
    description: "Turn any idea or article into a viral Twitter thread.",
    previewBg: "#DCEEFB",
    content: `You are a Twitter content strategist. Turn the following into a viral thread:\n\nTopic: {{topic}}\n\nCreate 8-12 tweets where:\n- Tweet 1 hooks with a bold claim\n- Tweets 2-10 deliver value\n- Final tweet has a CTA and summary\n\nKeep each tweet under 280 chars.`,
    tags: "social, twitter, content",
  },
  {
    id: "9",
    name: "API Docs Generator",
    category: "Coding",
    downloads: 2640,
    status: "Archived",
    createdAt: "2026-01-10",
    slug: "api-docs-generator",
    description: "Auto-generate clear API docs from your code or endpoint specs.",
    previewBg: "#E8F5E9",
    content: `You are a technical writer. Generate OpenAPI-style documentation for:\n\nEndpoint: {{endpoint}}\nMethod: {{method}}\nParameters: {{params}}\nResponse: {{response}}\n\nInclude: description, parameters table, request/response examples, error codes.`,
    tags: "coding, docs, api",
  },
  {
    id: "10",
    name: "Meeting Notes Formatter",
    category: "Automation",
    downloads: 3380,
    status: "Published",
    createdAt: "2026-03-10",
    slug: "meeting-notes-formatter",
    description: "Turn raw meeting transcripts into structured action-item notes.",
    previewBg: "#F3E5F5",
    content: `You are an executive assistant. Transform the following meeting transcript into:\n\n- Meeting summary (2-3 sentences)\n- Key decisions made\n- Action items (owner + deadline)\n- Open questions\n- Next meeting agenda suggestions\n\nTranscript: {{transcript}}`,
    tags: "automation, meetings, productivity",
  },
];

export const SUBMISSIONS: Submission[] = [
  {
    id: "s1",
    submitterName: "Alex Rivera",
    submitterEmail: "alex@example.com",
    skillName: "YouTube Script Writer",
    category: "Writing",
    submittedDate: "2026-05-02",
    content: `You are a YouTube script writer. Create a compelling script for a {{duration}} minute video about {{topic}}. Include: hook (first 15 seconds), main content with timestamps, B-roll suggestions, and CTA at the end.`,
    status: "Pending",
  },
  {
    id: "s2",
    submitterName: "Priya Nair",
    submitterEmail: "priya.n@example.com",
    skillName: "Python Debugger",
    category: "Coding",
    submittedDate: "2026-05-01",
    content: `You are a Python expert. Debug the following code and explain each bug found:\n\nCode: {{code}}\n\nFor each bug provide: location, cause, and corrected code snippet.`,
    status: "Pending",
  },
  {
    id: "s3",
    submitterName: "Marcus Chen",
    submitterEmail: "marcus@example.com",
    skillName: "LinkedIn Outreach Generator",
    category: "Marketing",
    submittedDate: "2026-04-30",
    content: `You are a sales expert. Write a personalized LinkedIn connection message for: Target: {{target_name}}, Title: {{title}}, Company: {{company}}. Keep under 300 chars, personalized, no spam.`,
    status: "Pending",
  },
  {
    id: "s4",
    submitterName: "Sarah Johnson",
    submitterEmail: "sarah.j@example.com",
    skillName: "Grant Proposal Writer",
    category: "Writing",
    submittedDate: "2026-04-28",
    content: `You are a nonprofit grant writer. Write a compelling grant proposal for: Organization: {{org}}, Grant amount: {{amount}}, Purpose: {{purpose}}. Include need statement, objectives, evaluation plan.`,
    status: "Approved",
  },
  {
    id: "s5",
    submitterName: "Tom Bradley",
    submitterEmail: "tom.b@example.com",
    skillName: "Spam Email Filter",
    category: "Automation",
    submittedDate: "2026-04-25",
    content: `Analyze the following email and determine if it is spam. Rate 0-10 and explain why. This tool was used for unauthorized email harvesting. Rejecting for TOS violation.`,
    status: "Rejected",
  },
  {
    id: "s6",
    submitterName: "Nina Patel",
    submitterEmail: "nina.p@example.com",
    skillName: "Competitive Analysis Report",
    category: "Business",
    submittedDate: "2026-04-24",
    content: `You are a business analyst. Create a detailed competitive analysis for {{company}} vs {{competitors}}. Include: market positioning, SWOT, pricing comparison, feature matrix.`,
    status: "Approved",
  },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: "a1", type: "submission", description: `Alex Rivera submitted "YouTube Script Writer"`, timestamp: "2 hours ago" },
  { id: "a2", type: "subscriber", description: "New subscriber: developer@startup.io", timestamp: "3 hours ago" },
  { id: "a3", type: "approval", description: `"Grant Proposal Writer" was approved and published`, timestamp: "5 hours ago" },
  { id: "a4", type: "submission", description: `Nina Patel submitted "Competitive Analysis Report"`, timestamp: "6 hours ago" },
  { id: "a5", type: "subscriber", description: "New subscriber: creator@agency.co", timestamp: "8 hours ago" },
  { id: "a6", type: "rejection", description: `"Spam Email Filter" was rejected (TOS violation)`, timestamp: "1 day ago" },
  { id: "a7", type: "approval", description: `"Twitter Thread Crafter" reached 8,000 downloads`, timestamp: "1 day ago" },
  { id: "a8", type: "submission", description: `Marcus Chen submitted "LinkedIn Outreach Generator"`, timestamp: "2 days ago" },
];

export const TOP_SEARCH_QUERIES = [
  { query: "blog post generator", count: 342 },
  { query: "code review", count: 289 },
  { query: "email automation", count: 241 },
  { query: "twitter thread", count: 198 },
  { query: "sql query", count: 176 },
  { query: "business plan", count: 154 },
  { query: "research summary", count: 132 },
  { query: "ad copy", count: 118 },
];

export const GEO_DATA = [
  { country: "United States", visitors: 4820, flag: "🇺🇸" },
  { country: "United Kingdom", visitors: 1240, flag: "🇬🇧" },
  { country: "India", visitors: 980, flag: "🇮🇳" },
  { country: "Canada", visitors: 760, flag: "🇨🇦" },
  { country: "Germany", visitors: 540, flag: "🇩🇪" },
  { country: "Australia", visitors: 420, flag: "🇦🇺" },
  { country: "France", visitors: 380, flag: "🇫🇷" },
  { country: "Netherlands", visitors: 310, flag: "🇳🇱" },
];
