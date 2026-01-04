"use client";

import { useMemo } from "react";
import { Button } from "./ui/button";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Testimonial = {
  quote: string; // plain text (no surrounding quotes needed)
  author: string;
  highlights?: string[];
};

function StarsRow() {
  return (
    <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, idx) => (
        <svg
          key={idx}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="text-[hsl(var(--gold))]"
        >
          <path
            fill="currentColor"
            d="M12 17.3l-6.18 3.64 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.67 1.64 7.03L12 17.3z"
          />
        </svg>
      ))}
    </div>
  );
}

function QuoteMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="text-[hsl(var(--accent))]/35"
    >
      <path
        fill="currentColor"
        d="M7.5 6C5.6 6 4 7.6 4 9.5V13c0 2.8 1.5 5.4 3.9 6.9l.9-1.7C7 17.2 6 15.2 6 13.1V13h2.5C10.4 13 12 11.4 12 9.5S10.4 6 8.5 6H7.5zm9 0c-1.9 0-3.5 1.6-3.5 3.5V13c0 2.8 1.5 5.4 3.9 6.9l.9-1.7c-1.8-1-2.8-3-2.8-5.1V13h2.5c1.9 0 3.5-1.6 3.5-3.5S19.4 6 17.5 6h-1z"
      />
    </svg>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedQuote({ text, highlights }: { text: string; highlights?: string[] }) {
  const cleaned = useMemo(() => String(text || ""), [text]);

  const ordered = useMemo(() => {
    return (highlights || [])
      .map((h) => String(h || "").trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
  }, [highlights]);

  const parts = useMemo(() => {
    if (ordered.length === 0) return [cleaned];
    const pattern = new RegExp(`(${ordered.map(escapeRegExp).join("|")})`, "ig");
    return cleaned.split(pattern);
  }, [cleaned, ordered]);

  const hits = useMemo(
    () => new Set(ordered.map((h) => h.toLowerCase())),
    [ordered]
  );

  return (
    <>
      {parts.map((p, idx) => {
        const lower = String(p).toLowerCase();
        const isHit = hits.has(lower);
        if (!isHit) return <span key={idx}>{p}</span>;
        return (
          <span key={idx} className="font-extrabold text-[hsl(var(--accent-deep))] not-italic">
            {p}
          </span>
        );
      })}
    </>
  );
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Kaitlyn is amazing with children, I see her in action! She's patient, caring and trustworthy! 💗",
    highlights: ["amazing", "patient", "trustworthy"],
    author: "Robin M.",
  },
  {
    quote:
      "Kaitlyn is one of the few people I fully trust to watch my kids. My husband and I can have a worry-free night out when they are under her care.",
    highlights: ["fully trust", "worry-free night out"],
    author: "Jenny M. S.",
  },
  {
    quote:
      "Kaitlyn is wonderful with children. Not only does she put their safety first, she also tries to make sure they have fun. Her communication is amazing and we never have to worry about our kids while she is with them.",
    highlights: ["safety first", "communication is amazing", "never have to worry"],
    author: "Nikita P. R.",
  },
  {
    quote: "She has a heart for children, you will be blessed to have your child in her care♡",
    highlights: ["heart for children", "blessed"],
    author: "Maxine D. M. J.",
  },
  {
    quote:
      "I worked with Kaitlyn for a year and I would always be excited when we were assigned to the same room because I knew I had a reliable teacher who would be engaged with the children all day!",
    highlights: ["reliable", "engaged"],
    author: "Rachel W.",
  },
  {
    quote:
      "Kaitlyn is amazing!!! My 4 kids love her!! She's so patient esp with my 8 year old who is hard to calm at night. She's my kids favorite sitter!!!! ❤️",
    highlights: ["amazing!!!", "love her!!", "favorite sitter!!!!"],
    author: "Melanie D.",
  },
  {
    quote:
      "Kaitlyn has cared for our kids for years. She’s reliable, keeps us updated, and is great with routines. She helps with homework, keeps screen time in check, and we trust her completely.",
    highlights: ["reliable", "keeps us updated", "trust her completely"],
    author: "Ashley R.",
  },
  {
    quote: "Her flexibility with early/late hours and last-minute schedule changes has been a lifesaver for our family.",
    highlights: ["flexibility", "lifesaver"],
    author: "Steve R.",
  },
];

// Keep signature compatible with existing usage (page passes `initiallyVisible` today).
export function Testimonials(_props: { initiallyVisible?: number }) {
  const bgImages = useMemo(() => ["/kaitlyn1.jfif", "/kaitlyn2.jfif", "/kaitlyn3.jfif", "/kaitlyn.jpg"], []);

  return (
    <section className="mb-4 kaitlyn-testimonials">
      <div className="mb-4 flex flex-col items-start gap-2 sm:items-center">
        <h3 className="text-sm font-extrabold tracking-[0.10em] text-[hsl(var(--accent-deep))] uppercase sm:text-center">
          What Parents Are Saying About Kaitlyn
        </h3>
        <p className="text-sm text-[hsl(var(--text))]/80 sm:text-center">
          From real moms who&apos;ve trusted her with their kids
        </p>

        <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white/70 px-3 py-1 text-sm font-semibold text-[hsl(var(--text))]/85 shadow-sm sm:self-center">
          <span>5.0</span>
          <StarsRow />
          <span className="text-[hsl(var(--muted))] font-semibold">based on {TESTIMONIALS.length} families</span>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white/60 shadow-soft backdrop-blur-md"
        style={{
          // Non-white base so even if images are slow, the card never shows a stark white "missing" bottom.
          backgroundColor: "hsl(330 30% 92% / 0.75)",
        }}
      >
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true }}
          navigation
          loop
          speed={450}
          className="w-full"
        >
          {TESTIMONIALS.map((t, idx) => {
            const bg = bgImages[idx % bgImages.length];
            const isFirst = idx === 0;
            // Vary the "pretty" glow layer per-slide so repeated photos don't feel identical.
            const a1 = 12 + ((idx * 17) % 70); // 12..81
            const a2 = 18 + ((idx * 23) % 65); // 18..82
            const p1x = 12 + ((idx * 19) % 70);
            const p1y = 15 + ((idx * 11) % 70);
            const p2x = 85 - ((idx * 13) % 70);
            const p2y = 78 - ((idx * 9) % 55);
            // Use fallbacks so the overlay paints even before CSS vars are available (prevents the white flash on first load).
            const glow = `radial-gradient(900px 320px at ${p1x}% ${p1y}%, hsl(var(--accent, 340 85% 60%) / ${a1 / 100}) 0%, transparent 55%), radial-gradient(900px 320px at ${p2x}% ${p2y}%, hsl(var(--lavender, 280 60% 70%) / ${a2 / 100}) 0%, transparent 55%)`;
            return (
              <SwiperSlide key={`${t.author}-${idx}`}>
                <div className="relative h-[420px] py-8 px-12 sm:h-[440px] sm:py-10 sm:px-14 md:h-[460px] md:px-16 flex flex-col">
                  <div className="pointer-events-none absolute inset-0">
                    <img
                      src={bg}
                      alt=""
                      loading="eager"
                      fetchPriority={isFirst ? "high" : "low"}
                      decoding="async"
                      className="h-full w-full object-cover opacity-[0.2] blur-[10px] scale-110"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, hsl(var(--bg, 330 30% 92%) / 0.25) 0%, hsl(var(--bg, 330 30% 92%) / 0.72) 55%, hsl(var(--bg, 330 30% 92%) / 0.88) 100%)",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: glow,
                      }}
                    />
                  </div>

                  <div className="relative flex flex-col flex-1 justify-center">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <StarsRow />
                      <QuoteMark />
                    </div>

                    <p className="text-lg sm:text-2xl leading-relaxed text-[hsl(var(--text))] font-semibold italic">
                      <span aria-hidden="true">&ldquo;</span>
                      <HighlightedQuote text={t.quote} highlights={t.highlights} />
                      <span aria-hidden="true">&rdquo;</span>
                    </p>

                    <p className="mt-6 text-sm font-semibold text-[hsl(var(--text))]/80">- {t.author}</p>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild variant="primary" size="xl" className="w-full sm:w-auto">
          <a href="#request-care">Book Kaitlyn for Your Family Today</a>
        </Button>
      </div>
    </section>
  );
}
