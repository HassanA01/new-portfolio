import "server-only";

type Role = {
  company: string;
  slug: string;
  role: string;
  dates: string;
  team?: string;
  href: string;
  current?: boolean;
  /** Plain-text versions of the bullets shown on About. */
  highlights: string[];
};

/** Mirrors the career journey on About; keep the two in step. */
const roles: Role[] = [
  {
    company: "Stripe",
    slug: "stripe",
    role: "Software Engineer",
    dates: "Sep 2026 – Present",
    team: "Compartments and Accounts Platform",
    href: "https://stripe.com",
    current: true,
    highlights: [
      "I work on the account and compartment infrastructure that lets Stripe organize different accounts and manage how they’re connected.",
      "One product my team owns and manages is Stripe Organizations.",
    ],
  },
  {
    company: "CircleCI",
    slug: "circleci",
    role: "Software Engineer",
    dates: "May 2026 – Aug 2026",
    team: "Web Experiences",
    href: "https://circleci.com",
    highlights: [
      "I built a smooth onboarding experience for Cursor’s Origin VCS integration, helping users connect their Cursor Origin repositories to CircleCI natively or through Cursor’s Marketplace.",
      "I also did a bunch of development on the Pipelines page: smarter filters, inline workflow views, and navigation improvements.",
    ],
  },
  {
    company: "Dayforce",
    slug: "dayforce",
    role: "AI Software Engineer",
    dates: "Sep 2025 – May 2026",
    team: "Innovation Solutions",
    href: "https://www.dayforce.com",
    highlights: [
      "I founded Dayforce Deploy, an AI-powered solution that automates client configuration validation.",
      "I built a multi-agent harness using the orchestrator-worker pattern and MCP tools for agentic end-to-end testing, turning uploaded scenarios into instructions for specialized agents to execute in Dayforce.",
      "I used LangGraph, Langfuse, Playwright MCP and Qdrant, and went through multiple iterations to arrive at this solution.",
    ],
  },
  {
    company: "Magnet Forensics",
    slug: "magnet-forensics",
    role: "Software Engineer Intern",
    dates: "Jan 2025 – Apr 2025",
    team: "Fastrak",
    href: "https://www.magnetforensics.com",
    highlights: [
      "I built Fastrak, a tool that lets investigators extract phone data using standard PCs instead of keeping a GrayKey device tied up for the whole process.",
    ],
  },
  {
    company: "Annaly",
    slug: "annaly",
    role: "Software Engineer Intern",
    dates: "Feb 2024 – Aug 2024",
    href: "https://www.annaly.com",
    highlights: [
      "I built an ETL alerting system that tracks incoming data from vendors and alerts the team when something is missing or delayed.",
      "I updated the way our financial applications worked with Excel files, helping calculations run faster and use fewer server resources.",
    ],
  },
  {
    company: "Enbridge",
    slug: "enbridge",
    role: "Data Analyst Intern",
    dates: "Jun 2023 – Sep 2023",
    href: "https://www.enbridge.com",
    highlights: [
      "Gained exposure to enterprise systems and workflows through training in SAP S/4HANA and SAP Business Technology Platform (BTP).",
    ],
  },
  {
    company: "KOHO",
    slug: "koho",
    role: "Software Engineer Intern",
    dates: "May 2022 – May 2023",
    team: "Mobile | Foundations",
    href: "https://www.koho.ca",
    highlights: [
      "I integrated Google Pay into KOHO’s mobile app so Android users could make payments with their phones.",
      "I built automated tests for sign-up and Save Accounts, helping the team catch issues before changes reached users.",
    ],
  },
  {
    company: "University of Toronto",
    slug: "university-of-toronto",
    role: "Teaching Assistant",
    dates: "Jan 2022 – May 2025",
    team: "CSC108 | CSC148",
    href: "https://www.utoronto.ca",
    highlights: [
      "I led weekly labs, supported lectures, marked midterms/exams, and invigilated them as well.",
    ],
  },
];

/**
 * What Aneeq builds with, grounded in the project catalogue and the career
 * highlights above. Names match the marks in components/TechMarks.tsx where
 * an icon exists; anything else renders as a text pill.
 */
const skillGroups = [
  { label: "Languages", items: ["Python", "TypeScript", "Go"] },
  {
    label: "Frameworks",
    items: [
      "Next.js",
      "React",
      "FastAPI",
      "Flask",
      "Express.js",
      "Node.js",
      "Tailwind CSS",
    ],
  },
  {
    label: "Data & infra",
    items: [
      "PostgreSQL",
      "Redis",
      "Docker",
      "GCP",
      "AWS",
      "Firebase",
      "Temporal",
    ],
  },
  {
    label: "AI",
    items: [
      "OpenAI",
      "Claude",
      "PyTorch",
      "scikit-learn",
      "LangGraph",
      "Langfuse",
      "Qdrant",
      "MCP",
    ],
  },
];

export type ProfileTopic = "career" | "about" | "contact" | "skills";

/**
 * Public portfolio facts for the agent. `label`/`detail` are the lowercase
 * summary the model reads; the structured fields drive the chat cards.
 */
export function getPublicProfile(topic: ProfileTopic) {
  if (topic === "skills")
    return {
      topic: "skills" as const,
      title: "what i build with",
      items: skillGroups.map((group) => ({
        label: group.label.toLowerCase(),
        detail: group.items.join(", ").toLowerCase(),
      })),
      groups: skillGroups,
      unknown:
        "proficiency levels and years of experience per tool have not been provided here",
      href: "/?explore=projects",
    };
  if (topic === "career")
    return {
      topic: "career" as const,
      title: "the journey so far",
      items: roles.map((role) => ({
        label: role.company.toLowerCase(),
        detail: [
          role.role.toLowerCase(),
          role.dates.toLowerCase().replace(" – ", " to "),
          role.team?.toLowerCase(),
        ]
          .filter(Boolean)
          .join(" · "),
        ...role,
        logo: `/company-logos/${role.slug}.${role.slug === "annaly" ? "svg" : "png"}`,
        about: `/about#career-role-${role.company.replaceAll(" ", "-")}`,
      })),
      href: "/about#career-journey",
    };
  if (topic === "contact")
    return {
      topic: "contact" as const,
      title: "let’s connect",
      items: [
        {
          label: "github",
          detail: "hassana01",
          handle: "hassana01",
          icon: "github" as const,
          href: "https://github.com/hassana01",
        },
        {
          label: "linkedin",
          detail: "hassana01",
          handle: "hassana01",
          icon: "linkedin" as const,
          href: "https://www.linkedin.com/in/hassana01",
        },
        {
          label: "x",
          detail: "@hassananeeq01",
          handle: "@HassanAneeq01",
          icon: "x" as const,
          href: "https://x.com/HassanAneeq01",
        },
      ],
      href: "/about",
    };
  return {
    topic: "about" as const,
    title: "a little about me",
    items: [
      {
        label: "hey, i’m aneeq",
        detail: "i like sports, travelling and doomscrolling at night.",
      },
      { label: "currently", detail: "software engineer at stripe" },
      { label: "education", detail: "hbsc at the university of toronto" },
      { label: "interests", detail: "futbol, food, filosophy" },
      { label: "languages", detail: "english, urdu, arabic, french" },
    ],
    greeting: "Aneeq",
    portrait: "/aneeq.jpg",
    facts: [
      {
        label: "Currently",
        value: "Software Engineer at",
        emphasis: "Stripe",
        company: "stripe",
      },
      {
        label: "Education",
        value: "HBSc @",
        emphasis: "University of Toronto",
        company: "university-of-toronto",
      },
      {
        label: "Interests",
        value: "Futbol, Food, Filosophy",
      },
      {
        label: "Languages",
        value: "English, Urdu, Arabic, French",
      },
    ],
    unknown:
      "language proficiency levels, gpa, and further personal details have not been provided here",
    href: "/about",
  };
}
