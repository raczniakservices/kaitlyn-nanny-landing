import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Clock,
  Gauge,
  MapPin,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Target
} from 'lucide-react';

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold tracking-wide text-white/80">
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-white/70">{body}</p>
    </div>
  );
}

function Card({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(600px 260px at 20% 0%, rgba(249,115,22,0.20), transparent 60%)'
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-black/30 p-2 text-brand-200">{icon}</div>
          <div className="text-lg font-extrabold text-white">{title}</div>
        </div>
        <div className="mt-3 text-sm leading-relaxed text-white/70">{body}</div>
      </div>
    </div>
  );
}

function MiniStat({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-extrabold text-white/80">
        <span className="text-brand-200">{icon}</span> {title}
      </div>
      <div className="mt-1 text-xs text-white/60">{body}</div>
    </div>
  );
}

function StepCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
      <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">{step}</div>
      <div className="mt-2 text-lg font-extrabold">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/70">{body}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
      <div className="text-base font-extrabold">{q}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/70">{a}</div>
    </div>
  );
}

export default function LandingPage() {
  const title = 'Raczniak Automations - Google Business Profile + Google Ads for more booked jobs';
  const description =
    'We help local service businesses get more calls from Google with Google Business Profile optimization and Google Ads. Optional landing page and conversion tracking available when needed.';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/brand/facebook-cover.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/brand/facebook-cover.png" />
      </Head>

      <div className="min-h-screen bg-ink-950 text-white">
        <div className="absolute inset-0 bg-hero-radial" />
        <div className="absolute inset-0 opacity-[0.08] [background-size:28px_28px] bg-grid-fade" />

        <header className="relative">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <Image src="/brand/profile-avatar.png" alt="Raczniak Automations" fill priority />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight">Raczniak Automations</div>
                <div className="text-xs font-bold text-white/60">Google growth for local services</div>
              </div>
            </Link>

            <div className="hidden items-center gap-4 md:flex">
              <Link href="#services" className="text-sm font-extrabold text-white/70 hover:text-white">GBP + Ads</Link>
              <Link href="#process" className="text-sm font-extrabold text-white/70 hover:text-white">How it works</Link>
              <Link href="#faq" className="text-sm font-extrabold text-white/70 hover:text-white">FAQ</Link>
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400"
              >
                Get a free Google audit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="relative">
          {/* HERO */}
          <section className="mx-auto max-w-6xl px-6 pb-14 pt-10 md:pb-20 md:pt-14">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Pill>
                    <MapPin className="h-4 w-4 text-brand-200" /> Baltimore / DMV
                  </Pill>
                  <Pill>
                    <Target className="h-4 w-4 text-brand-200" /> Built for calls + booked jobs
                  </Pill>
                </div>

                <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Get more <span className="text-brand-300">calls from Google</span> with GBP + Google Ads done right.
                </h1>
                <p className="mt-5 text-base leading-relaxed text-white/75">
                  If your Google presence is leaking leads, we fix it. We optimize your <b className="text-white">Google Business Profile</b>, then run
                  <b className="text-white"> Google Ads</b> that drive high-intent calls. If needed, we add a simple landing page and conversion tracking so you can measure ROI.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/intake"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400"
                  >
                    Start the free Google audit <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#services"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white hover:bg-white/10"
                  >
                    See the plan <Gauge className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat icon={<Clock className="h-4 w-4" />} title="Fast wins" body="Fix the biggest Google leaks first" />
                  <MiniStat icon={<BarChart3 className="h-4 w-4" />} title="Track ROI" body="Calls + leads + source" />
                  <MiniStat icon={<BadgeCheck className="h-4 w-4" />} title="Clean setup" body="No spammy tactics" />
                  <MiniStat icon={<Gauge className="h-4 w-4" />} title="Higher intent" body="Focus on buyers, not browsers" />
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-brand-500/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 shadow-soft backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">FREE GOOGLE AUDIT</div>
                      <div className="mt-2 text-xl font-extrabold tracking-tight">We’ll show you exactly what to fix in Google.</div>
                      <div className="mt-2 text-sm text-white/70">
                        Answer a few questions and we’ll reply with a short plan for your GBP and Google Ads.
                      </div>
                    </div>
                    <div className="hidden h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:block">
                      <Image src="/brand/profile-avatar.png" alt="" width={48} height={48} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold">
                        <PhoneCall className="h-4 w-4 text-brand-200" /> Calls-first setup
                      </div>
                      <div className="mt-1 text-sm text-white/70">
                        Your goal is booked jobs, so we optimize for calls and qualified leads.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold">
                        <MessageCircle className="h-4 w-4 text-brand-200" /> Simple, clear plan
                      </div>
                      <div className="mt-1 text-sm text-white/70">
                        You’ll get a short checklist of fixes and the ad approach that makes sense for your area.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/intake"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-black hover:bg-white/90"
                    >
                      Start intake <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-4 text-xs text-white/55">
                    Tip: if you already have a Google Business Profile link, include it in intake so we can audit it faster.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            <SectionTitle
              eyebrow="WHAT WE DO"
              title="Google Business Profile + Google Ads, built to drive booked jobs."
              body="Most campaigns fail because GBP is misconfigured, ads are set up wrong, and conversions aren't tracked. We keep it tight and focused on Google."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Card
                title="Google Business Profile (GBP)"
                body="Setup, cleanup, categories, services, photos, posts, and a conversion-first profile that ranks and drives calls."
                icon={<MapPin className="h-5 w-5" />}
              />
              <Card
                title="Google Ads management"
                body="Search campaigns built around real buyer intent in your service area. We track calls/leads and optimize for booked jobs."
                icon={<Target className="h-5 w-5" />}
              />
              <Card
                title="Conversion tracking (optional)"
                body="If you need it: call tracking and conversion tracking so you know what's producing jobs, not just clicks."
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <Card
                title="Landing page (optional)"
                body="When your site doesn't convert, we build a simple, fast page designed to turn Google traffic into leads."
                icon={<Sparkles className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* PROCESS */}
          <section id="process" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            <SectionTitle
              eyebrow="PROCESS"
              title="Tight loop: audit -> fix leaks -> launch -> measure -> scale."
              body="We start with your Google foundation (GBP), then we launch Ads only after the basics are right."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-4">
              <StepCard step="01" title="Audit Google" body="We review your GBP and your current Ads (if any) for the biggest leaks." />
              <StepCard step="02" title="Fix GBP" body="Categories, services, photos, posts, and conversion-focused setup." />
              <StepCard step="03" title="Launch Ads" body="Search campaigns for buyers in your area, optimized for calls/leads." />
              <StepCard step="04" title="Scale" body="Measure results, cut waste, and expand what works." />
            </div>
          </section>

          {/* FAQ + CTA */}
          <section id="faq" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            <SectionTitle
              eyebrow="FAQ"
              title="Quick answers, no fluff."
              body="If you have a GBP link, include it in intake so we can tailor the plan on the first message."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Faq
                q="Do you only work with Baltimore businesses?"
                a="Baltimore is the starting focus, but the system works anywhere. If you’re outside the area, submit anyway and we’ll confirm fit."
              />
              <Faq q="Can you do GBP only (no ads)?" a="Yes. GBP-only is common. We'll recommend the fastest path based on your current setup." />
              <Faq
                q="What if we already have a website?"
                a="Perfect. We'll use it if it converts. If it doesn't, we can build a simple landing page just for Google traffic."
              />
              <Faq q="What do you need from me to start?" a="Your service area, your GBP link (if you have one), and your goals. That's it." />
            </div>

            <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur">
              <div className="grid items-center gap-6 md:grid-cols-[1.4fr_0.6fr]">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">NEXT STEP</div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight">Get the free audit + plan.</div>
                  <div className="mt-3 text-sm leading-relaxed text-white/70">
                    We'll reply with your quickest wins for GBP and Google Ads, and the simplest campaign that can start producing booked jobs.
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/intake"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400"
                  >
                    Start intake <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#services"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white hover:bg-white/10"
                  >
                    See what you get <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="relative border-t border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <Image src="/brand/profile-avatar.png" alt="" fill />
                </div>
                <div>
                  <div className="text-sm font-extrabold">Raczniak Automations</div>
                  <div className="text-xs text-white/55">Google Business Profile + Google Ads</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-extrabold text-white/55">
                <Link href="#services" className="hover:text-white">GBP + Ads</Link>
                <Link href="#process" className="hover:text-white">
                  How it works
                </Link>
                <Link href="/intake" className="hover:text-white">
                  Intake
                </Link>
              </div>
            </div>
            <div className="mt-6 text-xs text-white/40">© {new Date().getFullYear()} Raczniak Automations. Built to convert.</div>
          </div>
        </footer>
      </div>
    </>
  );
}


