import { IntakeForm } from "../components/IntakeForm";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";

export default function Page() {
  return (
    <main>
      <section id="care-form" className="py-10 sm:py-14 min-h-screen">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Hero - Photo + Intro */}
            <Reveal>
              <div className="mb-12 text-center">
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

                <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl font-bold text-[hsl(var(--text))] tracking-tight">
                  Hi, I&apos;m Kaitlyn
                </h1>
                <p className="mt-3 text-base sm:text-lg text-[hsl(var(--text))]/80 leading-relaxed max-w-2xl mx-auto">
                  I provide calm, reliable weekend childcare for families in the Bel Air area. 
                  I love creating a safe environment where kids feel comfortable and parents feel confident.
                </p>
                <p className="mt-4 text-sm text-[hsl(var(--muted))] max-w-xl mx-auto">
                  Currently offering weekend care due to my weekday work schedule. Working on expanding to weekday availability soon!
                </p>
              </div>
            </Reveal>

            {/* Quick Info Cards - Simplified */}
            <div id="availability" className="mb-10 grid gap-3 sm:grid-cols-3">
              <Reveal delay={0.05}>
                <div className="min-h-[84px] rounded-xl border border-[hsl(var(--border))] bg-white/90 px-4 py-3 shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-sm font-bold text-[hsl(var(--text))]">Weekend availability</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Fri night – Sunday</p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="min-h-[84px] rounded-xl border border-[hsl(var(--border))] bg-white/90 px-4 py-3 shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-sm font-bold text-[hsl(var(--text))]">Quick response</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Usually within 24 hours</p>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="min-h-[84px] rounded-xl border border-[hsl(var(--border))] bg-white/90 px-4 py-3 shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-sm font-bold text-[hsl(var(--text))]">In-home childcare</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Calm, reliable, professional</p>
                </div>
              </Reveal>
            </div>

            {/* Trust details */}
            <Reveal delay={0.2}>
              <div className="mb-10 rounded-2xl border border-[hsl(var(--border))] bg-white/90 p-6 shadow-sm">
                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">TRUST</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-[hsl(var(--text))]/90">
                  <li>Professional childcare experience: 3+ years</li>
                  <li>Regularly manages groups of 16 kids (ages 6-10) and has supervised up to 30 children</li>
                  <li>Summer camp counselor - experienced with field trips and group activities</li>
                  <li>School transportation driver - safety-focused and dependable</li>
                </ul>
                
                {/* Credentials badges */}
                <div className="mt-5 flex flex-wrap gap-2 items-center">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))]/10 to-[hsl(var(--lavender))]/10 px-3 py-1.5 text-xs font-bold text-[hsl(var(--text))]">
                    <span className="text-[hsl(var(--accent-deep))]">✓</span> CPR Certified
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))]/10 to-[hsl(var(--lavender))]/10 px-3 py-1.5 text-xs font-bold text-[hsl(var(--text))]">
                    <span className="text-[hsl(var(--accent-deep))]">✓</span> First Aid Certified
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[hsl(var(--accent))]/10 to-[hsl(var(--lavender))]/10 px-3 py-1.5 text-xs font-bold text-[hsl(var(--text))]">
                    <span className="text-[hsl(var(--accent-deep))]">✓</span> Background Checked
                  </div>
                </div>
                
                <p className="mt-4 text-xs text-[hsl(var(--muted))]">References available upon request.</p>
              </div>
            </Reveal>

            {/* Testimonials */}
            <Reveal delay={0.25}>
              <div className="mb-4">
                <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">WHAT PARENTS SAY</p>
                <div className="space-y-3">
                  {/* Testimonial 1 */}
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-white/90 p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-[hsl(var(--text))]/90">
                      &quot;Kaitlyn is amazing with children, I see her in action! She&apos;s patient, caring and trustworthy! 💗&quot;
                    </p>
                    <p className="mt-2 text-xs font-bold text-[hsl(var(--text))]">— Robin M.</p>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-white/90 p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-[hsl(var(--text))]/90">
                      &quot;Kaitlyn is one of the few people I fully trust to watch my kids. My husband and I can have a worry-free night out when they are under her care.&quot;
                    </p>
                    <p className="mt-2 text-xs font-bold text-[hsl(var(--text))]">— Jenny M. S.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Photo Gallery */}
            <Reveal delay={0.3}>
              <div className="mb-8">
                <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">IN ACTION</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] shadow-sm h-64 sm:h-auto">
                    <img 
                      src="/kaitlyn1.jfif" 
                      alt="Kaitlyn with children"
                      className="h-full w-full object-cover object-[50%_20%] sm:object-center sm:aspect-square hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] shadow-sm h-64 sm:h-auto">
                    <img 
                      src="/kaitlyn2.jfif" 
                      alt="Kaitlyn childcare"
                      className="h-full w-full object-cover object-[50%_20%] sm:object-center sm:aspect-square hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] shadow-sm h-64 sm:h-auto">
                    <img 
                      src="/kaitlyn3.jfif" 
                      alt="Kaitlyn with kids"
                      className="h-full w-full object-cover object-[50%_20%] sm:object-center sm:aspect-square hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* FAQ Section */}
            <Reveal delay={0.35}>
              <div className="mb-10 rounded-2xl border border-[hsl(var(--border))] bg-white/90 p-6 shadow-sm">
                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">COMMON QUESTIONS</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What&apos;s your rate?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Rates start at $27/hour depending on details. We&apos;ll discuss the specifics during booking.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What services do you provide?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Beyond supervision and play, I help with homework, meal prep, bedtime routines, light tidying, and educational activities. Just let me know what you need in the booking form!</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">Do you have CPR certification?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Yes! I&apos;m both CPR and First Aid certified.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What if I need to cancel?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Just contact me as soon as possible. As my schedule fills up, I&apos;ll establish a clearer cancellation policy.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">Do you provide transportation?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">Yes, I drive to all jobs. I&apos;m also a school transportation driver, so safety is my priority.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text))]">What ages do you work with?</p>
                    <p className="mt-1 text-sm text-[hsl(var(--text))]/80">I primarily work with ages 6-10, but I have experience with all ages and work with various age groups regularly.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <IntakeForm />
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


