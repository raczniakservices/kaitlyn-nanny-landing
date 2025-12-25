type Testimonial = {
  quote: string;
  author: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      '“Kaitlyn is amazing with children, I see her in action! She’s patient, caring and trustworthy! 💗”',
    author: "— Robin M."
  },
  {
    quote:
      "“Kaitlyn is one of the few people I fully trust to watch my kids. My husband and I can have a worry-free night out when they are under her care.”",
    author: "— Jenny M. S."
  },
  {
    quote:
      "“Kaitlyn is wonderful with children. Not only does she put their safety first, she also tries to make sure they have fun. Her communication is amazing and we never have to worry about our kids while she is with them.”",
    author: "— Nikita P. R."
  },
  {
    quote:
      "“She has a heart for children, you will be blessed to have your child in her care♡”",
    author: "— Maxine D. M. J."
  },
  {
    quote:
      "“I worked with Kaitlyn at celebre e for a year and I would always be excited to see when we were assigned to the same room for the day because I knew I had a reliable teacher who would be engaged with the children all day!”",
    author: "— Rachel W."
  },
  {
    quote:
      "“Kaitlyn is amazing!!! My 4 kids love her!! She’s so patient esp with my 8 year old who is hard to calm at night. She’s my kids favorite sitter!!!! ❤️”",
    author: "— Melanie D."
  }
];

function Card({ quote, author }: Testimonial) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-white/90 p-4 shadow-sm">
      <p className="text-sm leading-relaxed text-[hsl(var(--text))]/90">{quote}</p>
      <p className="mt-2 text-xs font-bold text-[hsl(var(--text))]">{author}</p>
    </div>
  );
}

export function Testimonials({ initiallyVisible = 2 }: { initiallyVisible?: number }) {
  const visible = TESTIMONIALS.slice(0, initiallyVisible);
  const remaining = TESTIMONIALS.slice(initiallyVisible);

  return (
    <div className="mb-4">
      <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">
        WHAT PEOPLE SAY
      </p>

      <div className="space-y-3">
        {visible.map((t, idx) => (
          <Card key={`${t.author}-${idx}`} quote={t.quote} author={t.author} />
        ))}

        {remaining.length > 0 ? (
          <details className="group rounded-xl border border-[hsl(var(--border))] bg-white/70 shadow-sm">
            <summary className="cursor-pointer select-none list-none px-4 py-3 text-sm font-bold text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-xl">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block transition-transform group-open:rotate-90">›</span>
                Show {remaining.length} more testimonial{remaining.length === 1 ? "" : "s"}
              </span>
            </summary>

            <div className="space-y-3 px-4 pb-4">
              {remaining.map((t, idx) => (
                <Card key={`${t.author}-more-${idx}`} quote={t.quote} author={t.author} />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}


