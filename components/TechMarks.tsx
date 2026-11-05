"use client";

import { useId, useRef } from "react";
import {
  siAstro,
  siBootstrap,
  siClaude,
  siDatabricks,
  siDocker,
  siExpress,
  siFastapi,
  siFfmpeg,
  siFirebase,
  siFlask,
  siFramer,
  siGmail,
  siGo,
  siGooglecloud,
  siGooglepubsub,
  siGrafana,
  siLangchain,
  siLanggraph,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siPytorch,
  siRadixui,
  siReact,
  siRedis,
  siScikitlearn,
  siShadcnui,
  siShopify,
  siSocketdotio,
  siSwiper,
  siTailwindcss,
  siTemporal,
  siThreedotjs,
  siTimescale,
  siTypescript,
  siVercel,
  siVite,
  type SimpleIcon,
} from "simple-icons";

/** Marks the current icon library no longer ships; paths from its 9.x release (CC0). */
const siOpenai: SimpleIcon = {
  title: "OpenAI",
  slug: "openai",
  hex: "412991",
  source: "https://openai.com/brand",
  path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  svg: "",
  guidelines: undefined,
  license: undefined,
};
const siAmazonaws: SimpleIcon = {
  title: "AWS",
  slug: "amazonaws",
  hex: "232F3E",
  source: "https://aws.amazon.com/architecture/icons/",
  path: "M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z",
  svg: "",
  guidelines: undefined,
  license: undefined,
};

/** Catalogue tech names → brand marks. Anything missing falls back to a text pill. */
const marks: Record<string, SimpleIcon> = {
  AWS: siAmazonaws,
  OpenAI: siOpenai,
  Astro: siAstro,
  Bootstrap: siBootstrap,
  Claude: siClaude,
  "Cloud Pub/Sub": siGooglepubsub,
  Databricks: siDatabricks,
  Docker: siDocker,
  Express: siExpress,
  "Express.js": siExpress,
  FastAPI: siFastapi,
  FFmpeg: siFfmpeg,
  Firebase: siFirebase,
  Flask: siFlask,
  GCP: siGooglecloud,
  "Gmail API": siGmail,
  Go: siGo,
  Grafana: siGrafana,
  LangChain: siLangchain,
  LangGraph: siLanggraph,
  Motion: siFramer,
  "Next.js": siNextdotjs,
  "Node.js": siNodedotjs,
  PostgreSQL: siPostgresql,
  Python: siPython,
  PyTorch: siPytorch,
  RadixUI: siRadixui,
  React: siReact,
  Redis: siRedis,
  "scikit-learn": siScikitlearn,
  Shadcn: siShadcnui,
  "Shopify GraphQL Admin API": siShopify,
  "Socket.io": siSocketdotio,
  "Swiper.js": siSwiper,
  "Tailwind CSS": siTailwindcss,
  Temporal: siTemporal,
  "Three.js": siThreedotjs,
  TimescaleDB: siTimescale,
  TypeScript: siTypescript,
  Vercel: siVercel,
  Vite: siVite,
};

/** Where each mark goes: the tool's own home page, in a new tab. */
const links: Record<string, string> = {
  Astro: "https://astro.build",
  AWS: "https://aws.amazon.com",
  Bootstrap: "https://getbootstrap.com",
  Claude: "https://www.anthropic.com/claude",
  "Cloud Pub/Sub": "https://cloud.google.com/pubsub",
  Databricks: "https://www.databricks.com",
  Docker: "https://www.docker.com",
  Express: "https://expressjs.com",
  "Express.js": "https://expressjs.com",
  FastAPI: "https://fastapi.tiangolo.com",
  FFmpeg: "https://ffmpeg.org",
  Firebase: "https://firebase.google.com",
  Flask: "https://flask.palletsprojects.com",
  GCP: "https://cloud.google.com",
  "Gmail API": "https://developers.google.com/gmail/api",
  Go: "https://go.dev",
  Grafana: "https://grafana.com",
  LangChain: "https://www.langchain.com",
  LangGraph: "https://www.langchain.com/langgraph",
  Motion: "https://motion.dev",
  "Next.js": "https://nextjs.org",
  "Node.js": "https://nodejs.org",
  OpenAI: "https://openai.com",
  PostgreSQL: "https://www.postgresql.org",
  Python: "https://www.python.org",
  PyTorch: "https://pytorch.org",
  RadixUI: "https://www.radix-ui.com",
  React: "https://react.dev",
  Redis: "https://redis.io",
  "scikit-learn": "https://scikit-learn.org",
  Shadcn: "https://ui.shadcn.com",
  "Shopify GraphQL Admin API": "https://shopify.dev/docs/api/admin-graphql",
  "Socket.io": "https://socket.io",
  "Swiper.js": "https://swiperjs.com",
  "Tailwind CSS": "https://tailwindcss.com",
  Temporal: "https://temporal.io",
  "Three.js": "https://threejs.org",
  TimescaleDB: "https://www.timescale.com",
  TypeScript: "https://www.typescriptlang.org",
  Vercel: "https://vercel.com",
  Vite: "https://vite.dev",
};

function channel(hex: string, offset: number) {
  return parseInt(hex.slice(offset, offset + 2), 16);
}
/** Brand colour and a lighter tint of it, for the same gradient fill the social marks use. */
function tints(hex: string) {
  const [r, g, b] = [channel(hex, 0), channel(hex, 2), channel(hex, 4)];
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance < 0.12) return null; // near-black brands read best in plain ink
  const lift = (v: number) => Math.round(v + (255 - v) * 0.38);
  return [`#${hex}`, `rgb(${lift(r)} ${lift(g)} ${lift(b)})`] as const;
}

function TechMark({ name, icon }: { name: string; icon: SimpleIcon }) {
  const id = useId();
  const tip = useRef<HTMLSpanElement>(null);
  const gradient = tints(icon.hex);
  const href = links[name];
  const show = (target: HTMLElement) => {
    const el = tip.current;
    if (!el || typeof el.showPopover !== "function") return;
    const bounds = target.getBoundingClientRect();
    el.style.left = `${bounds.left + bounds.width / 2}px`;
    el.style.top = `${bounds.bottom + 8}px`;
    el.style.transform = "translateX(-50%)";
    el.showPopover();
  };
  const hide = () => tip.current?.hidePopover?.();
  const mark = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
      )}
      <path d={icon.path} fill={gradient ? `url(#${id}-g)` : "currentColor"} />
    </svg>
  );
  const shared = {
    className: "tech-mark",
    "aria-describedby": id,
    onMouseEnter: (event: { currentTarget: HTMLElement }) =>
      show(event.currentTarget),
    onMouseLeave: hide,
    onFocus: (event: { currentTarget: HTMLElement }) =>
      show(event.currentTarget),
    onBlur: hide,
  };
  return (
    <li>
      {href ? (
        <a
          {...shared}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${icon.title} (opens in a new tab)`}
        >
          {mark}
        </a>
      ) : (
        <button {...shared} type="button" aria-label={icon.title}>
          {mark}
        </button>
      )}
      <span
        ref={tip}
        id={id}
        popover="manual"
        role="tooltip"
        className="inline-mention-popover tech-mark-tip"
      >
        {name}
      </span>
    </li>
  );
}

/**
 * The technologies behind a project as brand marks, with the name on hover
 * or focus. Same gradient treatment as the social marks in the chat.
 */
export default function TechMarks({
  tech,
  max = 6,
  label,
}: {
  tech: string[];
  max?: number;
  label: string;
}) {
  return (
    <ul className="tech-marks" aria-label={label}>
      {tech.slice(0, max).map((name) =>
        marks[name] ? (
          <TechMark key={name} name={name} icon={marks[name]} />
        ) : (
          <li key={name}>
            {links[name] ? (
              <a
                className="tech-mark-pill"
                href={links[name]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
              </a>
            ) : (
              <span className="tech-mark-pill">{name}</span>
            )}
          </li>
        ),
      )}
    </ul>
  );
}
