"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "./Container";

type NavItem = { label: string; href: string };

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NavBar({
  items,
  primaryCtaHref = "#request-care"
}: {
  items: NavItem[];
  primaryCtaHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const safeItems = useMemo(() => items.filter((x) => x.href.startsWith("#")), [items]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div
        className={cx(
          "sticky top-0 z-50 w-full",
          "bg-[hsl(var(--bg))]/70 backdrop-blur",
          scrolled && "border-b border-[hsl(var(--border))]"
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            <a href="#" className="group inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-sm font-bold text-[hsl(var(--text))] shadow-sm">
                K
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-[hsl(var(--text))]">
                  Kaitlyn Noel Raczniak
                </span>
                <span className="block text-xs text-[hsl(var(--muted))]">In-home childcare</span>
              </span>
            </a>

            <nav className="hidden items-center gap-6 lg:flex">
              {safeItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-semibold text-[hsl(var(--muted))] transition hover:text-[hsl(var(--text))]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={primaryCtaHref}
                className="hidden items-center justify-center rounded-xl bg-[hsl(var(--text))] px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 sm:inline-flex"
              >
                Send inquiry
              </a>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm font-semibold text-[hsl(var(--text))] shadow-sm transition hover:bg-white/80 lg:hidden"
                aria-label="Open menu"
              >
                <IconMenu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile menu */}
      <div
        className={cx(
          "fixed inset-0 z-[60]",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cx(
            "absolute inset-0 bg-black/30 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />

        <div
          className={cx(
            "absolute right-0 top-0 h-full w-[min(420px,92vw)] bg-white shadow-2xl transition-transform",
            open ? "translate-x-0" : "translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5">
            <p className="text-sm font-semibold">Menu</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm font-semibold text-[hsl(var(--text))] shadow-sm transition hover:bg-white/80"
              aria-label="Close menu"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5">
            <div className="grid gap-2">
              {safeItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-4 py-3 text-sm font-semibold text-[hsl(var(--text))] transition hover:bg-white"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <a
              href={primaryCtaHref}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[hsl(var(--text))] px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95"
            >
              Send inquiry
            </a>

            <p className="mt-4 text-xs text-[hsl(var(--muted))]">
              Availability is currently weekends only. If your schedule is flexible, include details in the request and
              I’ll respond as soon as I’m available.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}


