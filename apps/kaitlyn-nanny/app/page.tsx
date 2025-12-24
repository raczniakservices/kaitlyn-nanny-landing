import { IntakeForm } from "../components/IntakeForm";
import { Container } from "../components/Container";
import { PortraitBadge } from "../components/PortraitBadge";

export default function Page() {
  return (
    <main>
      <section id="care-form" className="py-10 sm:py-14 min-h-screen">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 flex items-center justify-center">
              <div className="inline-flex items-center gap-3 rounded-full border-2 border-[hsl(var(--accent))]/50 bg-white/95 px-5 py-2.5 shadow-xl backdrop-blur-xl">
                <PortraitBadge />
                <div className="leading-tight">
                  <p className="text-sm font-bold tracking-wide text-[hsl(var(--text))]">Kaitlyn Noel Raczniak</p>
                  <p className="text-[10px] font-bold tracking-[0.25em] text-[hsl(var(--accent-deep))]">PROFESSIONAL CHILDCARE</p>
                </div>
              </div>
            </div>

            <div className="mb-12 text-center animate-fade-in">
              <div className="relative inline-block">
                <div className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10 rounded-[2.5rem] bg-gradient-to-r from-[hsl(var(--accent))]/20 via-[hsl(var(--gold))]/10 to-[hsl(var(--lavender))]/18 blur-2xl" />
                <h1 className="font-[var(--font-heading)] text-6xl font-semibold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl bg-gradient-to-br from-[hsl(var(--accent-deep))] via-[hsl(var(--accent))] to-[hsl(var(--lavender))] bg-clip-text text-transparent drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] animate-gentle-float">
                  Care with Kaitlyn
                </h1>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-[hsl(var(--text))]/85 sm:text-xl font-semibold tracking-wide">
                Thoughtful, professional childcare in the Bel Air area
              </p>
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


