"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "./Container";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "../lib/utils";

type NavItem = { label: string; href: string };

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
  const [scrolled, setScrolled] = useState(false);

  const safeItems = useMemo(() => items.filter((x) => x.href.startsWith("#")), [items]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-bg/70 backdrop-blur",
        scrolled && "border-b border-border"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <a href="#" className="group inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-bold text-text shadow-sm">
              K
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-text">Kaitlyn Noel Raczniak</span>
              <span className="block text-xs text-muted">In-home childcare</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {safeItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-muted transition-colors hover:text-text"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="dark" size="sm" className="hidden sm:inline-flex">
              <a href={primaryCtaHref}>Send inquiry</a>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden bg-white text-text border-border"
                  aria-label="Open menu"
                >
                  <IconMenu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent className="p-0">
                <div className="flex items-center justify-between border-b border-border p-5">
                  <p className="text-sm font-semibold text-text">Menu</p>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-text border-border"
                      aria-label="Close menu"
                    >
                      <IconX className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>

                <div className="p-5">
                  <div className="grid gap-2">
                    {safeItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <a
                          href={item.href}
                          className="rounded-xl border border-border bg-bg px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-white"
                        >
                          {item.label}
                        </a>
                      </SheetClose>
                    ))}
                  </div>

                  <SheetClose asChild>
                    <Button asChild variant="dark" size="lg" className="mt-4 w-full">
                      <a href={primaryCtaHref}>Send inquiry</a>
                    </Button>
                  </SheetClose>

                  <p className="mt-4 text-xs text-muted">
                    Availability is currently weekends only. If your schedule is flexible, include details in the request
                    and I’ll respond as soon as I’m available.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </div>
  );
}


