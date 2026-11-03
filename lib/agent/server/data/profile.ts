import "server-only";

/** Public portfolio facts; keep these synchronized with About. */
export function getPublicProfile(topic: "career" | "about" | "contact") {
  if (topic === "career")
    return {
      title: "the journey so far",
      items: [
        {
          label: "stripe",
          detail:
            "software engineer · sep 2026 to present · compartments and accounts platform",
        },
        {
          label: "circleci",
          detail: "software engineer · may to aug 2026 · web experiences",
        },
        {
          label: "dayforce",
          detail:
            "ai software engineer · sep 2025 to may 2026 · innovation solutions",
        },
        {
          label: "magnet forensics",
          detail: "software engineer intern · jan to apr 2025 · fastrak",
        },
        {
          label: "annaly",
          detail: "software engineer intern · feb to aug 2024",
        },
        {
          label: "enbridge",
          detail: "data analyst intern · jun to sep 2023",
        },
        {
          label: "koho",
          detail: "software engineer intern · may 2022 to may 2023",
        },
        {
          label: "university of toronto",
          detail:
            "teaching assistant · jan 2022 to may 2025 · csc108 and csc148",
        },
      ],
      href: "/about#career-journey",
    };
  if (topic === "contact")
    return {
      title: "let’s connect",
      items: [
        {
          label: "github",
          detail: "hassana01",
          href: "https://github.com/hassana01",
        },
        {
          label: "linkedin",
          detail: "hassana01",
          href: "https://www.linkedin.com/in/hassana01",
        },
        {
          label: "x",
          detail: "@hassananeeq01",
          href: "https://x.com/HassanAneeq01",
        },
      ],
      href: "/about",
    };
  return {
    title: "a little about me",
    items: [
      {
        label: "hey, i’m aneeq",
        detail: "i like sports, travelling and doomscrolling at night.",
      },
      { label: "currently", detail: "software engineer at stripe" },
      { label: "education", detail: "university of toronto" },
    ],
    unknown:
      "spoken languages, language proficiency, and further personal details have not been provided here",
    href: "/about",
  };
}
