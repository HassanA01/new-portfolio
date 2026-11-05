"use client";

import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionChevron,
  disclosureSpring,
} from "@/components/ui/accordion";
import FilterPill from "@/components/FilterPill";
import GlassDropCap from "@/components/GlassDropCap";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import BackgroundStory from "@/components/BackgroundStory";
import EducationJourney from "@/components/EducationJourney";
import ProjectShowcase from "@/components/ProjectShowcase";
import TodoList from "@/components/TodoList";
import CareerTree from "@/components/CareerTree";
import InlineMention from "@/components/InlineMention";
import { Cormorant_Garamond } from "next/font/google";

const sectionSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  variable: "--font-drop-cap",
});

/** `hidden` keeps a section's content in the codebase without rendering it. */
const allSections = [
  {
    id: "background",
    title: "Background",
    description:
      "A little about where I come from and the experiences that shaped me. More to come.",
  },
  {
    id: "education-journey",
    title: "Education journey",
    description: "My school years, from Brampton to the University of Toronto.",
  },
  {
    id: "career-journey",
    title: "Career journey",
    description:
      "The roles, projects, and lessons along the way. More to come.",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Things I’ve built and projects I’m working on. More to come.",
  },
  {
    id: "todo",
    title: "Todo",
    description: "Things still on my list for this site, so I don’t forget.",
  },
  {
    id: "exploring",
    title: "What I’m exploring",
    description:
      "A place for current interests, questions, and things I’m trying out. More to come.",
    hidden: true,
  },
];
const sections = allSections.filter((section) => !section.hidden);

const careerRoles = [
  ["Stripe", "Software Engineer", "Sep 2026 – Present"],
  ["CircleCI", "Software Engineer", "May 2026 – Aug 2026"],
  ["Dayforce", "AI Software Engineer", "Sep 2025 – May 2026"],
  ["Magnet Forensics", "Software Engineer Intern", "Jan 2025 – Apr 2025"],
  ["Annaly", "Software Engineer Intern", "Feb 2024 – Aug 2024"],
  ["Enbridge", "Data Analyst Intern", "Jun 2023 – Sep 2023"],
  ["KOHO", "Software Engineer Intern", "May 2022 – May 2023"],
  ["University of Toronto", "Teaching Assistant", "Jan 2022 – May 2025"],
];

const careerTeams: Record<string, string> = {
  Stripe: "Compartments and Accounts Platform",
  CircleCI: "Web Experiences",
  Dayforce: "Innovation Solutions",
  "Magnet Forensics": "Fastrak",
  KOHO: "Mobile | Foundations",
  "University of Toronto": "CSC108 | CSC148",
};

const careerHighlights: Record<string, string[]> = {
  "University of Toronto": [
    "I led weekly labs, supported lectures, marked midterms/exams, and invigilated them as well.",
  ],
  "Magnet Forensics": [
    "I built Fastrak, a tool that lets investigators extract phone data using standard PCs instead of keeping a GrayKey device tied up for the whole process.",
  ],
  Annaly: [
    "I built an ETL alerting system that tracks incoming data from vendors and alerts the team when something is missing or delayed.",
    "I updated the way our financial applications worked with Excel files, helping calculations run faster and use fewer server resources.",
  ],
  KOHO: [
    "I integrated Google Pay into KOHO’s mobile app so Android users could make payments with their phones.",
    "I built automated tests for sign-up and Save Accounts, helping the team catch issues before changes reached users.",
  ],
};

const companyHomepages: Record<string, string> = {
  Stripe: "https://stripe.com",
  CircleCI: "https://circleci.com",
  Dayforce: "https://www.dayforce.com",
  "Magnet Forensics": "https://www.magnetforensics.com",
  Annaly: "https://www.annaly.com",
  Enbridge: "https://www.enbridge.com",
  KOHO: "https://www.koho.ca",
  "University of Toronto": "https://www.utoronto.ca",
};

export default function AboutSections({
  initialCareerView = "Condensed",
}: {
  initialCareerView?: string;
}) {
  const screenshotDialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(sections[0].id);
  const [careerFilter, setCareerFilter] = useState<string | null>(null);
  const [careerView, setCareerView] = useState(initialCareerView);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("career-view");
      if (
        !document.cookie
          .split("; ")
          .some((cookie) => cookie.startsWith("career-view=")) &&
        (saved === "Condensed" || saved === "Story")
      ) {
        document.cookie = `career-view=${saved}; Path=/; Max-Age=31536000; SameSite=Lax`;
        setCareerView(saved);
      }
    } catch {
      // Keep the default when browser storage is unavailable.
    }
  }, []);

  const selectCareerView = (view: string) => {
    setCareerView(view);
    document.cookie = `career-view=${view}; Path=/; Max-Age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("career-view", view);
    } catch {
      // The selection still works for this visit without storage.
    }
  };

  const [openRoles, setOpenRoles] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map(({ id }) => [id, true])),
  );
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const company = Object.keys(openRoles).find((name) => openRoles[name]);
    if (!company || !window.matchMedia("(max-width: 600px)").matches) return;
    const row = document
      .getElementById(`career-role-${company.replaceAll(" ", "-")}`)
      ?.closest(".career-role");
    if (!row) return;
    let frame = 0;
    const start = performance.now();
    const origin = window.scrollY;
    const tick = (now: number) => {
      const progress = reducedMotion ? 1 : Math.min((now - start) / 900, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const bounds = row.getBoundingClientRect();
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const offset = Math.max(24, (viewportHeight - bounds.height) / 2);
      const target = window.scrollY + bounds.top - offset;
      window.scrollTo({
        top: origin + (target - origin) * eased,
        behavior: "instant",
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const cancel = () => cancelAnimationFrame(frame);
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("wheel", cancel, { passive: true });
    return () => {
      cancel();
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("wheel", cancel);
    };
  }, [openRoles, reducedMotion]);

  useEffect(() => {
    let frame = 0;
    const updateActive = () => {
      frame = 0;
      const readingLine = Math.min(200, window.innerHeight * 0.25);
      let current = sections[0].id;
      for (const { id } of sections) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= readingLine)
          current = id;
      }
      if (
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 4
      )
        current = sections[sections.length - 1].id;
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(updateActive);
    };
    const observer = new ResizeObserver(schedule);
    const content = document.querySelector(".about-sections");
    if (content) observer.observe(content);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    updateActive();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="about-layout">
      <dialog
        ref={screenshotDialog}
        className="career-image-dialog"
        aria-label="CircleCI Pipelines screenshot"
        onClick={(event) => {
          if (event.target === event.currentTarget)
            screenshotDialog.current?.close();
        }}
      >
        <Image
          src="/circleci-pipelines.png"
          alt="CircleCI Pipelines page with run filters and inline workflows"
          width={3490}
          height={2098}
          sizes="95vw"
        />
      </dialog>
      <aside className="about-toc">
        <nav aria-label="Table of contents">
          {sections.map(({ id, title }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => {
                setExpanded((current) => ({ ...current, [id]: true }));
                setActive(id);
              }}
            >
              {title}
            </a>
          ))}
        </nav>
      </aside>
      <div className="about-sections">
        {sections.map(({ id, title, description }) => (
          <Accordion
            bounce="mobile"
            as="section"
            key={id}
            id={id}
            className="about-section"
            open={expanded[id]}
            onOpenChange={(open) =>
              setExpanded((current) => ({ ...current, [id]: open }))
            }
          >
            <h2 className={sectionSerif.className}>
              <AccordionTrigger className="about-section-trigger">
                {title}
                <AccordionChevron size={18} />
              </AccordionTrigger>
            </h2>
            <AccordionContent overflowVisible>
              <div className="about-section-body">
                {id === "background" ? (
                  <BackgroundStory />
                ) : id === "education-journey" ? (
                  <EducationJourney />
                ) : id === "career-journey" ? (
                  <>
                    <div
                      className="career-view-switch"
                      role="group"
                      aria-label="Career view"
                    >
                      {["Condensed", "Story"].map((view) => (
                        <motion.button
                          key={view}
                          type="button"
                          whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                          transition={disclosureSpring}
                          aria-pressed={careerView === view}
                          onClick={() => selectCareerView(view)}
                        >
                          {careerView === view && (
                            <motion.span
                              className="career-view-selection"
                              layoutId="career-view-selection"
                              transition={{
                                duration: reducedMotion ? 0 : 0.25,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            />
                          )}
                          <span>{view}</span>
                        </motion.button>
                      ))}
                    </div>
                    {careerView === "Condensed" ? (
                      <>
                        <div
                          className="career-filters"
                          role="group"
                          aria-label="Filter career roles"
                        >
                          {["All", "Internships", "AI", "Full-time"].map(
                            (filter) => (
                              <FilterPill
                                key={filter}
                                selected={
                                  filter === "All"
                                    ? careerFilter === null
                                    : careerFilter === filter
                                }
                                onClick={() =>
                                  setCareerFilter((current) =>
                                    filter === "All" || current === filter
                                      ? null
                                      : filter,
                                  )
                                }
                              >
                                {filter}
                              </FilterPill>
                            ),
                          )}
                        </div>
                        <div className="career-roles">
                          <AnimatePresence initial={false}>
                            {careerRoles
                              .filter(([company]) => {
                                if (!careerFilter) return true;
                                if (careerFilter === "Full-time")
                                  return (
                                    company === "Stripe" ||
                                    company === "CircleCI"
                                  );
                                if (careerFilter === "AI")
                                  return company === "Dayforce";
                                return [
                                  "Magnet Forensics",
                                  "Annaly",
                                  "Enbridge",
                                  "KOHO",
                                ].includes(company);
                              })
                              .map(([company, title, dates]) => (
                                <Accordion
                                  bounce="mobile"
                                  layout="position"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: reducedMotion ? 0 : 0.35,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                  style={{ overflow: "hidden" }}
                                  open={!!openRoles[company]}
                                  onOpenChange={(open) =>
                                    setOpenRoles({ [company]: open })
                                  }
                                  id={`career-role-${company.replaceAll(" ", "-")}`}
                                  className="career-role"
                                  key={company}
                                  data-open={!!openRoles[company]}
                                  data-company={company
                                    .toLowerCase()
                                    .replaceAll(" ", "-")}
                                >
                                  <div className="career-role-heading">
                                    <a
                                      className="career-role-logo-link"
                                      href={companyHomepages[company]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`${company} homepage (opens in a new tab)`}
                                    >
                                      <Image
                                        className="career-role-logo"
                                        src={`/company-logos/${company.toLowerCase().replaceAll(" ", "-")}.${company === "Annaly" ? "svg" : "png"}`}
                                        alt=""
                                        width={22}
                                        height={22}
                                      />
                                    </a>
                                    <AccordionTrigger className="career-role-trigger">
                                      <span className="career-role-label">
                                        {title} @ <strong>{company}</strong>
                                      </span>
                                      <span className="career-role-dates">
                                        {dates}
                                      </span>
                                      <AccordionChevron />
                                    </AccordionTrigger>
                                  </div>
                                  <AccordionContent>
                                    <div className="career-role-title">
                                      {company !== "Magnet Forensics" &&
                                        company !== "Annaly" &&
                                        company !== "Enbridge" && (
                                          <span className="career-team-name">
                                            {careerTeams[company] ??
                                              "More to come."}
                                          </span>
                                        )}
                                      {careerHighlights[company] && (
                                        <ul className="career-highlights">
                                          {careerHighlights[company].map(
                                            (point) => (
                                              <li key={point}>
                                                {company ===
                                                  "Magnet Forensics" &&
                                                point.includes("Fastrak") ? (
                                                  <>
                                                    I built{" "}
                                                    <InlineMention
                                                      name="Fastrak"
                                                      href="https://www.magnetforensics.com/products/magnet-graykey-fastrak/"
                                                      className="tool-fastrak"
                                                    />
                                                    {point.split("Fastrak")[1]}
                                                  </>
                                                ) : (
                                                  point
                                                )}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      )}
                                      {company === "Enbridge" && (
                                        <ul className="career-highlights">
                                          <li>
                                            Gained exposure to enterprise
                                            systems and workflows through
                                            training in{" "}
                                            <strong>SAP S/4HANA</strong> and{" "}
                                            <strong>
                                              SAP Business Technology Platform
                                              (BTP)
                                            </strong>
                                            .
                                          </li>
                                        </ul>
                                      )}
                                      {company === "Stripe" && (
                                        <ul className="career-highlights">
                                          <li>
                                            I work on the account and
                                            compartment infrastructure that lets
                                            Stripe organize different accounts
                                            and manage how they’re connected.
                                          </li>
                                          <li>
                                            One product my team owns and manages
                                            is{" "}
                                            <InlineMention
                                              name="Stripe Organizations"
                                              href="https://stripe.com/blog/stripe-organizations-powering-the-worlds-most-complex-businesses"
                                              className="tool-stripe"
                                            />
                                            .
                                          </li>
                                        </ul>
                                      )}
                                      {company === "Dayforce" && (
                                        <ul className="career-highlights">
                                          <li>
                                            I founded{" "}
                                            <InlineMention
                                              name="Dayforce Deploy"
                                              href="https://www.dayforce.com/ca/blog/dayforce-deploy-hcm-implementation"
                                              className="tool-dayforce"
                                            />
                                            , an AI-powered solution that
                                            automates client configuration
                                            validation.
                                          </li>
                                          <li>
                                            I built a multi-agent harness using
                                            the orchestrator-worker pattern and
                                            MCP tools for agentic end-to-end
                                            testing, turning uploaded scenarios
                                            into instructions for specialized
                                            agents to execute in Dayforce.
                                          </li>
                                          <li>
                                            I used tools like{" "}
                                            <InlineMention
                                              name="LangGraph"
                                              href="https://docs.langchain.com/oss/python/langgraph/overview"
                                              className="tool-langgraph"
                                            />
                                            ,{" "}
                                            <InlineMention
                                              name="Langfuse"
                                              href="https://langfuse.com/"
                                              className="tool-langfuse"
                                            />
                                            ,{" "}
                                            <InlineMention
                                              name="Playwright MCP"
                                              href="https://github.com/microsoft/playwright-mcp"
                                              className="tool-playwright"
                                            />
                                            , and{" "}
                                            <InlineMention
                                              name="Qdrant"
                                              href="https://qdrant.tech/"
                                              className="tool-qdrant"
                                            />
                                            , and went through multiple
                                            iterations to arrive at this
                                            solution.
                                          </li>
                                        </ul>
                                      )}
                                      {company === "CircleCI" && (
                                        <ul className="career-highlights">
                                          <li>
                                            I built a smooth onboarding
                                            experience for{" "}
                                            <InlineMention
                                              name="Cursor’s Origin VCS integration"
                                              href="https://cursor.com/origin"
                                              className="tool-cursor"
                                            />
                                            , helping users connect their Cursor
                                            Origin repositories to CircleCI
                                            natively or through Cursor’s
                                            Marketplace.
                                          </li>
                                          <li>
                                            Also, I did a bunch of development
                                            on the Pipelines Page: smarter
                                            filters, inline workflow views, and
                                            navigation improvements.
                                            <div className="career-media">
                                              <div className="career-video">
                                                <iframe
                                                  src="https://www.youtube-nocookie.com/embed/xRJxcriVzx0"
                                                  title="CircleCI and Cursor Origin integration"
                                                  loading="lazy"
                                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                  referrerPolicy="strict-origin-when-cross-origin"
                                                  allowFullScreen
                                                />
                                              </div>
                                              <a
                                                className="career-blog-card"
                                                href="https://circleci.com/blog/circleci-cursor-origin/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <Image
                                                  src="https://images.ctfassets.net/il1yandlcjgk/5wPv8lJNwKKmmTPugKUzEn/7585bbf2f122943012fb2acdff2beddf/speed-header-1.png?w=560&fm=jpg"
                                                  alt=""
                                                  fill
                                                  unoptimized
                                                  sizes="280px"
                                                />
                                                <span>
                                                  <small>
                                                    CircleCI Blog ↗
                                                  </small>
                                                  <strong>
                                                    CircleCI is now available on
                                                    Cursor Origin
                                                  </strong>
                                                </span>
                                              </a>
                                              <button
                                                type="button"
                                                className="career-screenshot-card"
                                                onClick={() =>
                                                  screenshotDialog.current?.showModal()
                                                }
                                                aria-label="View CircleCI Pipelines screenshot"
                                              >
                                                <Image
                                                  src="/circleci-pipelines.png"
                                                  alt="CircleCI Pipelines page with run filters and inline workflows"
                                                  fill
                                                  sizes="(max-width: 600px) 220px, 240px"
                                                />
                                              </button>
                                            </div>
                                          </li>
                                        </ul>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </Accordion>
                              ))}
                          </AnimatePresence>
                        </div>
                      </>
                    ) : (
                      <div className={`career-story ${sectionSerif.variable}`}>
                        <p className="story-opening">
                          <GlassDropCap>T</GlassDropCap>he condensed version
                          really just shows my tech career. In reality, I worked
                          numerous jobs before I got my first tech job.
                        </p>
                        <p className="story-paragraph">
                          My first job was actually at{" "}
                          <span className="story-wendys">Wendy’s</span>{" "}
                          <span className="story-job-dates">
                            (Sep 2018 – Jan 2019)
                          </span>
                          .
                        </p>
                        <p className="story-paragraph story-wendys-details">
                          Yeah, I cleaned dishes, took orders, and put the fries
                          in the bag. It taught me how to deal with people in
                          all kinds of moods, from friendly regulars to
                          customers having a rough day, and how to stay patient
                          when things got busy.
                        </p>
                        <p className="story-paragraph story-wendys-details">
                          Looking back, it was a great learning experience and
                          my first real taste of the working world.
                        </p>
                        <p className="story-paragraph">
                          Honestly, a full play-by-play would probably get
                          boring. Before I landed my first tech job in 2022, I
                          worked a mix of roles that taught me a lot about
                          adapting to different people and environments. Explore
                          the folders below to learn more 🙂.
                        </p>
                        <CareerTree />
                      </div>
                    )}
                  </>
                ) : id === "projects" ? (
                  <ProjectShowcase />
                ) : id === "todo" ? (
                  <>
                    <p>{description}</p>
                    <TodoList className="about-todo-list" />
                  </>
                ) : (
                  <p>{description}</p>
                )}
              </div>
            </AccordionContent>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
