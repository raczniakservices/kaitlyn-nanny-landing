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

            {/* Trust details (testimonials will go here next) */}
            <Reveal delay={0.2}>
              <div className="mb-10 rounded-2xl border border-[hsl(var(--border))] bg-white/90 p-6 shadow-sm">
                <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">TRUST</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-[hsl(var(--text))]/90">
                  <li>Professional childcare experience: 3+ years</li>
                  <li>Trusted with a classroom-sized group (up to 16 kids, ages 6-10) almost every day</li>
                  <li>School transportation driver - safety-focused and dependable</li>
                </ul>
                <p className="mt-4 text-xs text-[hsl(var(--muted))]">References available upon request.</p>
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


