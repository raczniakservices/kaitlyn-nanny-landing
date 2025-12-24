import { IntakeForm } from "../components/IntakeForm";
import { Container } from "../components/Container";
import { PortraitBadge } from "../components/PortraitBadge";
import { NavBar } from "../components/NavBar";
import { CalendlyCTA } from "../components/CalendlyCTA";
import { Reveal } from "../components/Reveal";

export default function Page() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "";

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
            <Reveal>
              <div className="mb-10 text-center">
              <div className="relative inline-block">
                <div className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10 rounded-[2.5rem] bg-gradient-to-r from-[hsl(var(--accent))]/20 via-[hsl(var(--gold))]/10 to-[hsl(var(--lavender))]/18 blur-2xl" />
                <h1 className="font-[var(--font-heading)] text-6xl font-semibold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl bg-gradient-to-br from-[hsl(var(--accent-deep))] via-[hsl(var(--accent))] to-[hsl(var(--lavender))] bg-clip-text text-transparent drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] animate-gentle-float">
                  Care with Kaitlyn
                </h1>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-[hsl(var(--text))]/85 sm:text-xl font-semibold tracking-wide">
                Thoughtful, professional childcare in the Bel Air area
              </p>
              {calendlyUrl ? (
                <div className="mt-6 flex items-center justify-center">
                  <CalendlyCTA url={calendlyUrl} />
                </div>
              ) : null}
            </div>
            </Reveal>

            <div id="availability" className="mb-10 grid gap-4 sm:grid-cols-3">
              <Reveal delay={0.05}>
                <div className="hover-lift rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">AVAILABILITY</p>
                  <p className="mt-2 text-sm font-semibold text-[hsl(var(--text))]">
                    Weekends only right now (Fri night → Sun)
                  </p>
                  <p className="mt-2 text-xs text-[hsl(var(--muted))]">
                    Share your preferred date/time window and I'll confirm what's open.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="hover-lift rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">COMMUNICATION</p>
                  <p className="mt-2 text-sm font-semibold text-[hsl(var(--text))]">
                    Clear details, quick confirmations
                  </p>
                  <p className="mt-2 text-xs text-[hsl(var(--muted))]">
                    You'll get a confirmation email and a response as soon as I'm available.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="hover-lift rounded-2xl border border-[hsl(var(--border))] bg-white/85 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-bold tracking-[0.22em] text-[hsl(var(--accent-deep))]">FIT</p>
                  <p className="mt-2 text-sm font-semibold text-[hsl(var(--text))]">
                    A calm, reliable presence in your home
                  </p>
                  <p className="mt-2 text-xs text-[hsl(var(--muted))]">
                    Tell me about routines, allergies, pets, and any special notes.
                  </p>
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


