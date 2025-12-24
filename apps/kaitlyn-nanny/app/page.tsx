import { IntakeForm } from "../components/IntakeForm";
import { Container } from "../components/Container";
import { NavBar } from "../components/NavBar";
import { Reveal } from "../components/Reveal";

export default function Page() {
  return (
    <main>
      <NavBar
        items={[
          { label: "Request care", href: "#care-form" }
        ]}
        primaryCtaHref="#care-form"
      />

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
                    <div className="absolute -bottom-2 -right-2 rounded-full bg-white px-3 py-1 shadow-lg border-2 border-[hsl(var(--accent))]/20">
                      <span className="text-xs font-bold text-[hsl(var(--accent-deep))]">Bel Air, MD</span>
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
                <div className="rounded-xl border border-[hsl(var(--border))] bg-white/90 px-4 py-3 shadow-sm text-center">
                  <p className="text-sm font-bold text-[hsl(var(--text))]">Weekends Only</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Fri night – Sunday</p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="rounded-xl border border-[hsl(var(--border))] bg-white/90 px-4 py-3 shadow-sm text-center">
                  <p className="text-sm font-bold text-[hsl(var(--text))]">Quick Response</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Usually within 24 hours</p>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="rounded-xl border border-[hsl(var(--border))] bg-white/90 px-4 py-3 shadow-sm text-center">
                  <p className="text-sm font-bold text-[hsl(var(--text))]">Experienced Care</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">Professional & warm</p>
                </div>
              </Reveal>
            </div>

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


