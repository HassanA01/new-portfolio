"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useId, type MouseEvent } from "react";
import {
  X,
  Menu,
  House,
  UserRound,
  BookOpen,
  Images,
  ListTodo,
  Wrench,
} from "lucide-react";

import ConfirmExit from "@/components/ConfirmExit";
import RobotIcon from "@/components/ui/robot-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Icon gradient per nav label, shared by the desktop nav and the mobile drawer. */
const navColors: Record<string, [string, string]> = {
  Home: ["#29c6cb", "#6484ed"],
  "About me": ["#e48caa", "#a17be8"],
  Blog: ["#f0b15b", "#ec7667"],
  Gallery: ["#7cafff", "#c28bea"],
  Todo: ["#65cba6", "#b2c76b"],
  Tools: ["#9aa5b1", "#6b7a90"],
  Agent: ["#ff87ae", "#f5c768"],
};
/** Pages that exist but stay out of the nav for now; remove a path here to show it again. */
const hiddenNav = new Set(["/gallery", "/todo", "/tools"]);
const navIcons = {
  Home: House,
  "About me": UserRound,
  Blog: BookOpen,
  Gallery: Images,
  Todo: ListTodo,
  Tools: Wrench,
} as const;

export default function Header() {
  const iconId = useId();
  const reducedMotion = useReducedMotion();
  const [chatActive, setChatActive] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setChatActive(root.dataset.chat === "true");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-chat"],
    });
    return () => observer.disconnect();
  }, []);
  const menuDialog = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const closeMenu = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      menuDialog.current?.close();
    } else {
      setMenuClosing(true);
    }
  };

  const pathname = usePathname();
  const router = useRouter();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const pendingHref = useRef<string | null>(null);

  const [navHidden, setNavHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let anchor = Math.max(0, window.scrollY);
    setScrolled(anchor > 64);
    setNavHidden(anchor > 8);
    const onScroll = () => {
      const current = Math.max(0, window.scrollY);
      setScrolled(current > 64);
      if (current <= 8) {
        setNavHidden(false);
        anchor = current;
      } else if (Math.abs(current - anchor) >= 10) {
        setNavHidden(current > anchor);
        anchor = current;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const resize = () => {
      if (window.innerWidth > 600) menuDialog.current?.close();
    };
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("resize", resize);
    };
  }, [menuOpen]);

  useEffect(() => {
    const requestLeave = () => {
      pendingHref.current = "/";
      setLeaveOpen(true);
    };
    window.addEventListener("portfolio-request-leave", requestLeave);
    return () =>
      window.removeEventListener("portfolio-request-leave", requestLeave);
  }, []);

  function confirmNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    // Opening another tab keeps this conversation intact.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    if (document.documentElement.dataset.chat === "true") {
      event.preventDefault();
      pendingHref.current = href;
      setLeaveOpen(true);
      return;
    }
    if (href === "/") window.dispatchEvent(new Event("portfolio-reset"));
  }

  function leaveChat() {
    const href = pendingHref.current;
    pendingHref.current = null;
    setLeaveOpen(false);
    if (!href) return;
    window.dispatchEvent(new Event("portfolio-reset"));
    router.push(href);
  }

  return (
    <header className="site-header">
      <div
        className="mobile-topbar"
        data-floating={scrolled}
        data-scroll-hidden={navHidden}
        inert={navHidden}
      >
        <Link
          href="/"
          className="mobile-name signature-link"
          aria-label="Aneeq — Home"
        >
          <span className="signature-mark" aria-hidden="true" />
        </Link>
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => {
            setMenuClosing(false);
            menuDialog.current?.showModal();
            setMenuOpen(true);
          }}
        >
          <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
      <dialog
        ref={menuDialog}
        id="mobile-menu"
        className="mobile-menu-drawer"
        aria-labelledby="mobile-menu-title"
        data-closing={menuClosing}
        onClose={() => {
          setMenuOpen(false);
          setMenuClosing(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName === "drawer-exit"
          )
            menuDialog.current?.close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right)
              closeMenu();
          }
        }}
      >
        <div className="mobile-menu-heading">
          <span
            id="mobile-menu-title"
            className="drawer-signature"
            aria-label="Aneeq"
          >
            <span className="signature-mark" aria-hidden="true" />
          </span>
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label="Close menu"
            autoFocus
            onClick={closeMenu}
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div
          role="navigation"
          aria-label="Mobile navigation"
          className="mobile-menu-links"
        >
          {[
            ["/", "Home"],
            ["/about", "About me"],
            ["/blog", "Blog"],
            ["/gallery", "Gallery"],
            ["/todo", "Todo"],
            ["/tools", "Tools"],
          ]
            .filter(([href]) => !hiddenNav.has(href))
            .map(([href, label], index) => {
              const Icon = navIcons[label as keyof typeof navIcons] ?? House;
              const colors = navColors[label] ?? navColors.Home;
              const gradientId = `${iconId}-mobile-${index}`;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {pathname === href && (
                    <span className="nav-selection" aria-hidden="true" />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={1.7}
                    stroke={`url(#${gradientId})`}
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                      </linearGradient>
                    </defs>
                  </Icon>
                  <span>{label}</span>
                </Link>
              );
            })}
        </div>
        <div className="mobile-menu-theme">
          <span>Appearance</span>
          <ThemeToggle variant="switch" />
        </div>
      </dialog>
      <button
        type="button"
        className="mobile-leave-chat"
        aria-label="Leave chat"
        onClick={() => {
          pendingHref.current = "/";
          setLeaveOpen(true);
        }}
      >
        <X size={19} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <nav
        aria-label="Main navigation"
        data-scroll-hidden={navHidden}
        data-floating={scrolled}
        inert={navHidden && !chatActive}
      >
        <Link
          href="/"
          className="desktop-signature"
          aria-label="Aneeq — Home"
          onClick={(event) => confirmNavigation(event, "/")}
        >
          <span className="signature-mark" aria-hidden="true" />
        </Link>
        <div className="nav-links">
          {[
            ["/", "Home"],
            ["/about", "About me"],
            ["/blog", "Blog"],
            ["/gallery", "Gallery"],
            ...(chatActive ? [["#agent", "Agent"]] : []),
            ["/todo", "Todo"],
            ["/tools", "Tools"],
          ]
            .filter(([href]) => !hiddenNav.has(href))
            .map(([href, label], index) => {
              const Icon =
                label === "Agent"
                  ? RobotIcon
                  : (navIcons[label as keyof typeof navIcons] ?? House);
              const colors = navColors[label] ?? navColors.Home;
              const gradientId = `${iconId}-nav-${index}`;
              return (
                <Link
                  onClick={(event) => {
                    if (href === "#agent") {
                      event.preventDefault();
                      return;
                    }
                    confirmNavigation(event, href);
                  }}
                  key={href}
                  href={href}
                  aria-current={
                    (chatActive ? href === "#agent" : pathname === href)
                      ? "page"
                      : undefined
                  }
                >
                  {(chatActive ? href === "#agent" : pathname === href) && (
                    <motion.span
                      className="nav-selection"
                      layoutId="nav-selection"
                      aria-hidden="true"
                      transition={{
                        duration: reducedMotion ? 0 : 0.38,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  )}
                  <Icon
                    className={
                      label === "Agent"
                        ? "sidebar-link-icon agent-link-icon"
                        : "sidebar-link-icon"
                    }
                    size={17}
                    strokeWidth={1.7}
                    stroke={`url(#${gradientId})`}
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                      </linearGradient>
                    </defs>
                  </Icon>
                  <span className="sidebar-label-window">
                    <span className="sidebar-label-flip">
                      <span>{label}</span>
                      <span aria-hidden="true" className="sidebar-label-back">
                        {label}
                      </span>
                    </span>
                  </span>
                </Link>
              );
            })}
        </div>
        <ThemeToggle className="nav-icon-theme" />
        <div className="sidebar-appearance">
          <ThemeToggle variant="switch" />
        </div>
      </nav>
      <ConfirmExit
        open={leaveOpen}
        className="leave-chat-dialog"
        title="Leave this chat?"
        message="Your conversation won't be saved."
        stayLabel="Cancel"
        exitLabel="Leave"
        emphasis="exit"
        stayClassName="cancel-leave"
        exitClassName="confirm-leave"
        onStay={() => {
          pendingHref.current = null;
          setLeaveOpen(false);
        }}
        onExit={leaveChat}
      />
    </header>
  );
}
