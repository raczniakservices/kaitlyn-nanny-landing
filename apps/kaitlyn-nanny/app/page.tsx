import { IntakeForm } from "../components/IntakeForm";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Testimonials } from "../components/Testimonials";
import { Button } from "../components/ui/button";

export default function Page() {
  return (
    <>
      <section id="care-form" className="py-10 sm:py-14 min-h-screen">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Hero - Photo + Intro */}
            <Reveal>
              <div className="mb-16 text-center relative">
                {/* subtle hero sheen */}
                <div
                  className="pointer-events-none absolute inset-x-0 -top-6 mx-auto h-[260px] max-w-3xl opacity-70 blur-2xl"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(520px 220px at 50% 20%, hsla(var(--accent), 0.22) 0%, transparent 60%), radial-gradient(520px 220px at 20% 70%, hsla(var(--lavender), 0.16) 0%, transparent 60%)",
                  }}
                />

                <div className="relative">
                  <div className="mb-6 flex justify-center">
                    <div className="hero-avatar-stack relative h-36 w-36 sm:h-40 sm:w-40">
                      {/* animated halo + sparkles (moves with the photo) */}
                      <div className="hero-avatar-halo" aria-hidden="true" />
                      <div className="hero-avatar-sparkles" aria-hidden="true">
                        <span className="hero-sparkle hero-sparkle-1" aria-hidden="true" />
                        <span className="hero-sparkle hero-sparkle-2" aria-hidden="true" />
                        <span className="hero-sparkle hero-sparkle-3" aria-hidden="true" />
                        <span className="hero-sparkle hero-sparkle-4" aria-hidden="true" />
                        <span className="hero-sparkle hero-sparkle-5" aria-hidden="true" />
                        <span className="hero-sparkle hero-sparkle-6" aria-hidden="true" />
                      </div>

                      {/* soft glow behind the photo */}
                      <div
                        className="hero-avatar-glow"
                        aria-hidden="true"
                      />

                      {/* clean ring (no weird perimeter artifacts) */}
                      <div className="hero-avatar-wrap absolute inset-0 overflow-hidden rounded-full ring-4 ring-white shadow-2xl outline outline-2 outline-[hsl(var(--accent))]/25">
                        <img
                          src="/kaitlyn.jpg"
                          alt="Kaitlyn Noel Raczniak"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))] uppercase">
                    CHILDCARE &middot; BEL AIR
                  </p>

                  <h1 className="mt-3 font-[var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl font-semibold text-[hsl(var(--text))] tracking-tight">
                    Loving, dependable in home childcare in Bel Air
                  </h1>

                  <p className="mt-4 text-sm sm:text-base text-[hsl(var(--text))]/80 leading-relaxed max-w-2xl mx-auto">
                    Experienced nanny trusted by local families. Patient, engaging care in the comfort of your home. Clear communication every step of the way.
                  </p>

                  <p className="mt-3 font-[var(--font-heading)] text-lg sm:text-xl font-semibold text-[hsl(var(--text))]">
                    Kaitlyn Noel Raczniak
                  </p>

                  <div className="mt-5 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white/70 px-3 py-1 text-sm font-semibold text-[hsl(var(--text))]/85 shadow-sm">
                      <span className="text-[hsl(var(--gold))]" aria-hidden="true">
                        &#9733;&#9733;&#9733;&#9733;&#9733;
                      </span>
                      <span className="font-extrabold text-[hsl(var(--text))]">5.0</span>
                      <span className="text-[hsl(var(--muted))] font-semibold">from 8 Bel Air families</span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm italic text-[hsl(var(--text))]/80 max-w-xl mx-auto">
                    <span className="text-[hsl(var(--accent-deep))] font-extrabold" aria-hidden="true">
                      &ldquo;
                    </span>
                    Kaitlyn is amazing!!! My 4 kids love her!! She&apos;s my kids favorite sitter!!!!{" "}
                    <span className="text-[hsl(var(--accent-deep))]" aria-hidden="true">
                      &#10084;&#65039;
                    </span>
                    <span className="text-[hsl(var(--accent-deep))] font-extrabold" aria-hidden="true">
                      &rdquo;
                    </span>
                    <span className="text-[hsl(var(--muted))] font-semibold">{" "}Melanie D.</span>
                  </p>

                  <div className="mt-7 flex flex-col items-center justify-center gap-2">
                    <Button
                      asChild
                      variant="primary"
                      size="xl"
                      className="w-full sm:w-auto px-10 hover-lift transition-transform hover:-translate-y-0.5"
                    >
                      <a href="#request-care">Request Care with Kaitlyn</a>
                    </Button>

                    <p className="text-xs text-[hsl(var(--muted))]">
                      Kaitlyn personally reviews every request. You&apos;ll hear back from her within 24 hours.
                    </p>

                    <a
                      href="#availability"
                      className="group text-xs font-extrabold text-[hsl(var(--accent-deep))] hover:underline hover:underline-offset-4"
                    >
                      View weekend hours
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Availability + Trust (low friction, quick scan) */}
            <Reveal delay={0.15}>
              <div className="mb-8 grid items-stretch gap-4 sm:grid-cols-2">
                <div id="availability" className="order-1 scroll-mt-10">
                  <div className="h-full rounded-3xl border border-[hsl(var(--border))] bg-white/80 p-5 shadow-soft backdrop-blur-md sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold tracking-[0.22em] text-[hsl(var(--accent-deep))] uppercase">
                          AVAILABILITY
                        </p>
                        <p className="mt-2 text-sm text-[hsl(var(--text))]/80">
                          Currently booking weekends. Perfect for date nights, events, or a little me time!
                        </p>
                      </div>

                      <div className="inline-flex max-w-[190px] items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white/70 px-3 py-1 text-[11px] font-semibold leading-tight text-[hsl(var(--text))]/75 shadow-sm">
                        <span
                          className="grid h-5 w-5 place-items-center rounded-full bg-[hsl(var(--accent))]/12 text-[hsl(var(--accent-deep))]"
                          aria-hidden="true"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M12 2a10 10 0 0 0-10 10c0 2.3.8 4.4 2.1 6.1L2 22l4-2.1A10 10 0 1 0 12 2zm-3 11h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm0-4h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2z"
                            />
                          </svg>
                        </span>
                        Personal reply from Kaitlyn within 24 hours
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {[
                        { day: "Friday", time: "After 7:00 PM", c: "bg-[hsl(var(--accent))]/8 border-[hsl(var(--accent))]/18" },
                        { day: "Saturday", time: "Flexible", c: "bg-[hsl(var(--lavender))]/10 border-[hsl(var(--lavender))]/20" },
                        { day: "Sunday", time: "Until 10:00 PM", c: "bg-[hsl(var(--accent))]/6 border-[hsl(var(--accent))]/14" },
                      ].map((slot) => (
                        <div
                          key={slot.day}
                          className={`flex items-center justify-between gap-3 rounded-full border ${slot.c} px-4 py-2.5 text-sm shadow-sm`}
                        >
                          <span className="font-extrabold text-[hsl(var(--text))]">{slot.day}</span>
                          <span className="text-xs font-semibold text-[hsl(var(--muted))]">{slot.time}</span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs font-semibold text-[hsl(var(--accent-deep))]">
                      Limited weekend spots. Reach out soon!
                    </p>

                    <p className="mt-3 text-xs text-[hsl(var(--muted))]">
                      You&apos;ll message Kaitlyn directly. She personally confirms availability and replies within 24 hours.
                    </p>
                  </div>
                </div>

                <div id="trust" className="order-3 scroll-mt-24 sm:order-2">
                  <div className="h-full rounded-3xl border border-[hsl(var(--border))] bg-white/80 p-5 shadow-soft backdrop-blur-md sm:p-6">
                    <p className="text-xs font-extrabold tracking-[0.22em] text-[hsl(var(--accent-deep))] uppercase">
                      Why Bel Air Families Trust Kaitlyn
                    </p>
                    <p className="mt-2 text-sm text-[hsl(var(--text))]/80">
                      Experienced, caring, and fully qualified for safe, fun in home care.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {([
                        {
                          t: "3+ years nurturing local kids",
                          c: "bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/18",
                        },
                        {
                          t: "CPR and First Aid certified",
                          c: "bg-[hsl(var(--lavender))]/10 border-[hsl(var(--lavender))]/20",
                        },
                        {
                          t: "Background checked",
                          c: "bg-white/70 border-[hsl(var(--border))]",
                        },
                        {
                          t: "References available",
                          c: "bg-[hsl(var(--accent))]/7 border-[hsl(var(--accent))]/14",
                        },
                        {
                          t: "Group care experience",
                          c: "bg-[hsl(var(--lavender))]/8 border-[hsl(var(--lavender))]/18",
                        },
                      ] as const).map(({ t, c }) => (
                        <span
                          key={t}
                          className={`inline-flex h-8 items-center whitespace-nowrap rounded-full border ${c} px-3 text-[11px] sm:text-xs font-semibold text-[hsl(var(--text))]/80 shadow-sm transition-transform duration-200 hover:-translate-y-0.5`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="order-2 flex justify-center sm:order-3 sm:col-span-2">
                  <Button
                    asChild
                    variant="primary"
                    size="md"
                    className="px-6 hover-lift transition-transform hover:-translate-y-0.5"
                  >
                    <a href="#request-care">Message Kaitlyn for Weekend Care →</a>
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Testimonials */}
            <Reveal delay={0.25}>
              <div id="testimonials" className="scroll-mt-20 mb-16">
                <Testimonials initiallyVisible={2} />
              </div>
            </Reveal>

            {/* Photo Gallery */}
            <Reveal delay={0.3}>
              <div className="mb-16">
                <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">IN ACTION</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm h-64 sm:h-auto">
                    <img
                      src="/kaitlyn1.jfif"
                      alt="Kaitlyn with children"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-[50%_20%] sm:object-center sm:aspect-square"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm h-64 sm:h-auto">
                    <img
                      src="/kaitlyn2.jfif"
                      alt="Kaitlyn childcare"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-[50%_20%] sm:object-center sm:aspect-square"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm h-64 sm:h-auto">
                    <img
                      src="/kaitlyn3.jfif"
                      alt="Kaitlyn with kids"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-[50%_30%] sm:object-[50%_20%] sm:aspect-square"
                    />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* FAQ Section */}
            <Reveal delay={0.35}>
              <div id="faq" className="mb-16 rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-6 shadow-sm scroll-mt-20">
                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))] uppercase">
                  Frequently Asked Questions
                </p>
                <p className="mt-2 text-sm text-[hsl(var(--text))]/80">
                  Answers to questions Bel Air parents ask most
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What&apos;s your rate?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">
                      Rates start at $27/hour. Final rate depends on the details of your request (number of kids, hours, etc.). Happy to discuss!
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What services do you provide?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">
                      I provide supervision and play, plus support with homework, meals, bedtime routines, and light tidying as needed.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">Do you have CPR certification?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Yes, I&apos;m fully CPR and First Aid certified.</p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What if I need to cancel?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">
                      Please reach out about cancellations or schedule changes so I can adjust accordingly.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What ages do you work with?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">
                      I&apos;ve worked most with ages 6 to 10 lately and love that range, but I&apos;m open to others. Share your children&apos;s ages in your request and I&apos;ll confirm fit.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">Do you have references?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">
                      Yes! Happy to share references from local families upon request.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <div id="request-care" className="scroll-mt-20">
              <IntakeForm />
            </div>
          </div>
        </Container>
      </section>

      <footer className="pb-16 pt-12">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-widest text-[hsl(var(--muted))] uppercase">
              © {new Date().getFullYear()} Kaitlyn Noel Raczniak &middot; Professional Childcare Services
            </p>
          </div>
        </Container>
      </footer>
    </>
  );
}
