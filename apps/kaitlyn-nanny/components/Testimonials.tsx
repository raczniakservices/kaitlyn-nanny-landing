"use client";
import { useState, useEffect } from "react";

type Testimonial = {
  quote: string;
  author: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "\"Kaitlyn is amazing with children, I see her in action! She's patient, caring and trustworthy! 💗\"",
    author: "Robin M."
  },
  {
    quote:
      "\"Kaitlyn is one of the few people I fully trust to watch my kids. My husband and I can have a worry-free night out when they are under her care.\"",
    author: "Jenny M. S."
  },
  {
    quote:
      "\"Kaitlyn is wonderful with children. Not only does she put their safety first, she also tries to make sure they have fun. Her communication is amazing and we never have to worry about our kids while she is with them.\"",
    author: "Nikita P. R."
  },
  {
    quote:
      "\"She has a heart for children, you will be blessed to have your child in her care♡\"",
    author: "Maxine D. M. J."
  },
  {
    quote:
      "\"I worked with Kaitlyn at celebre e for a year and I would always be excited to see when we were assigned to the same room for the day because I knew I had a reliable teacher who would be engaged with the children all day!\"",
    author: "Rachel W."
  },
  {
    quote:
      "\"Kaitlyn is amazing!!! My 4 kids love her!! She's so patient esp with my 8 year old who is hard to calm at night. She's my kids favorite sitter!!!! ❤️\"",
    author: "Melanie D."
  },
  {
    quote:
      "\"Kaitlyn has cared for our kids for years. She’s reliable, keeps us updated, and is great with routines. She helps with homework, keeps screen time in check, and we trust her completely.\"",
    author: "Ashley R."
  },
  {
    quote:
      "\"Her flexibility with early/late hours and last-minute schedule changes has been a lifesaver for our family.\"",
    author: "Steve R."
  }
];

export function Testimonials({ initiallyVisible = 2 }: { initiallyVisible?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
      setTimeout(() => setIsAnimating(false), 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goNext = () => {
    if (isAnimating) return;
    setIsPaused(true); // Pause auto-play when user manually navigates
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    setTimeout(() => setIsAnimating(false), 300);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goPrev = () => {
    if (isAnimating) return;
    setIsPaused(true);
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    setTimeout(() => setIsAnimating(false), 300);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goTo = (idx: number) => {
    if (isAnimating || idx === currentIndex) return;
    setIsPaused(true);
    setIsAnimating(true);
    setCurrentIndex(idx);
    setTimeout(() => setIsAnimating(false), 300);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <div className="mb-4">
      <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">
        WHAT PEOPLE SAY
      </p>

      <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-white/90 p-8 shadow-sm">

        {/* Testimonial content with fade animation */}
        <div 
          className={`min-h-[140px] flex flex-col justify-center transition-opacity duration-300 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p className="text-base leading-relaxed text-[hsl(var(--text))] font-semibold">
            {current.quote.replace(/^"|"$/g, '')}
          </p>
          <p className="mt-4 text-sm font-semibold text-[hsl(var(--text))]/80">
            {current.author}
          </p>
        </div>

        {/* Navigation controls */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={isAnimating}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[hsl(var(--border))] text-[hsl(var(--text))] text-xl font-semibold transition-colors hover:bg-[hsl(var(--bg))] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 shadow-sm"
            aria-label="Previous testimonial"
          >
            ‹
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                disabled={isAnimating}
                className={`h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:cursor-not-allowed ${
                  idx === currentIndex
                    ? "bg-[hsl(var(--accent))] w-8 shadow-sm"
                    : "bg-[hsl(var(--border))] w-2.5 hover:bg-[hsl(var(--accent))]/50 hover:w-4"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={isAnimating}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[hsl(var(--border))] text-[hsl(var(--text))] text-xl font-semibold transition-colors hover:bg-[hsl(var(--bg))] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 shadow-sm"
            aria-label="Next testimonial"
          >
            ›
          </button>
        </div>

        {/* Counter */}
        <p className="mt-4 text-center text-xs font-semibold text-[hsl(var(--muted))]">
          {currentIndex + 1} / {TESTIMONIALS.length}
        </p>
      </div>
    </div>
  );
}


