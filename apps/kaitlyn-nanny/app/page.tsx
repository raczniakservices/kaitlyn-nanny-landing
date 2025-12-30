import { IntakeForm } from "../components/IntakeForm";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Testimonials } from "../components/Testimonials";
import { Button } from "../components/ui/button";

export default function Page() {
  return (
    <main>
      <section id="care-form" className="py-10 sm:py-14 min-h-screen">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Hero - Photo + Intro */}
            <Reveal>
              <div className="mb-16 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-xl">
                      <img 
                        src="/kaitlyn.jpg" 
                        alt="Kaitlyn Raczniak"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">
                  CHILDCARE · BEL AIR
                </p>
                <h1 className="mt-3 font-[var(--font-heading)] text-4xl sm:text-5xl font-bold text-[hsl(var(--text))] tracking-tight">
                  Kaitlyn Noel Raczniak
                </h1>

                <p className="mt-4 text-base sm:text-lg text-[hsl(var(--text))]/85 leading-relaxed max-w-2xl mx-auto">
                  Thoughtful, steady care with clear communication—so your kids feel comfortable and you can step out with confidence.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-2">
                  <Button asChild variant="primary" size="xl" className="w-full sm:w-auto">
                    <a href="#request-care">Send a care request</a>
                  </Button>
                  <p className="text-xs text-[hsl(var(--muted))]">
                    Requests are reviewed personally. You’ll hear back directly from Kaitlyn.
                  </p>
                  <a
                    href="#availability"
                    className="text-xs font-semibold text-[hsl(var(--muted))] underline underline-offset-4 hover:text-[hsl(var(--text))]"
                  >
                    See weekend availability
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Availability */}
            <div
              id="availability"
              className="mb-16 rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-6 shadow-sm scroll-mt-8"
            >
              <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">AVAILABILITY</p>
              <p className="mt-2 text-sm text-[hsl(var(--text))]/85">
                Availability is currently limited to weekends.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-[hsl(var(--text))]">Friday</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">After 7:00 PM</p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-[hsl(var(--text))]">Saturday</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Flexible</p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-[hsl(var(--text))]">Sunday</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Until 10:00 PM</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-[hsl(var(--muted))]">
                Most requests receive a response within 24 hours.
              </p>
            </div>

            {/* Trust details */}
            <Reveal delay={0.2}>
              <div id="trust" className="mb-16 rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-6 shadow-sm scroll-mt-20">
                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">TRUST</p>
                <div className="mt-4 grid gap-2 text-sm text-[hsl(var(--text))]/90">
                  <p><span className="font-semibold">3+ years</span> professional childcare experience</p>
                  <p><span className="font-semibold">Group care:</span> regularly manages 16 children (ages 6–10)</p>
                  <p><span className="font-semibold">Supervision:</span> up to 30 children (program settings)</p>
                  <p><span className="font-semibold">Safety-focused:</span> school transportation driver</p>
                </div>
                
                {/* Credentials badges */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm font-semibold text-[hsl(var(--text))]">CPR Certified</p>
                  </div>
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm font-semibold text-[hsl(var(--text))]">First Aid Certified</p>
                  </div>
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm font-semibold text-[hsl(var(--text))]">Background Checked</p>
                  </div>
                </div>
                
                <p className="mt-4 text-xs text-[hsl(var(--muted))]">References available upon request.</p>
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
                      className="h-full w-full object-cover object-[50%_20%] sm:object-center sm:aspect-square"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm h-64 sm:h-auto">
                    <img 
                      src="/kaitlyn2.jfif" 
                      alt="Kaitlyn childcare"
                      className="h-full w-full object-cover object-[50%_20%] sm:object-center sm:aspect-square"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm h-64 sm:h-auto">
                    <img 
                      src="/kaitlyn3.jfif" 
                      alt="Kaitlyn with kids"
                      className="h-full w-full object-cover object-[50%_30%] sm:object-[50%_20%] sm:aspect-square"
                    />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* FAQ Section */}
            <Reveal delay={0.35}>
              <div id="faq" className="mb-16 rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-6 shadow-sm scroll-mt-20">
                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">COMMON QUESTIONS</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What&apos;s your rate?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Rates start at $27/hour. Final rate depends on the details of your request.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What services do you provide?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Supervision and play, plus support with homework, meals, bedtime routines, and light tidying as needed.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">Do you have CPR certification?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Yes—CPR and First Aid certified.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What if I need to cancel?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Please reach out as soon as plans change so I can adjust my schedule.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What ages do you work with?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Most of my recent experience is ages 6–10. Share your children’s ages in your request and I’ll confirm fit.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <div id="request-care" className="scroll-mt-20">
              <div className="mb-4 rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-6 shadow-sm">
                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">REQUEST</p>
                <p className="mt-2 text-sm text-[hsl(var(--text))]/85">
                  This helps me understand your needs before confirming availability.
                </p>
              </div>
              <IntakeForm />
            </div>
          </div>
        </Container>
      </section>

      <footer className="pb-16 pt-12">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-widest text-[hsl(var(--muted))] uppercase">
              © {new Date().getFullYear()} Kaitlyn Noel Raczniak · Professional Childcare Services
            </p>
          </div>
        </Container>
      </footer>
    </main>
  );
}


