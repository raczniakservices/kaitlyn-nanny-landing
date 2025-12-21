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
  const title = 'Raczniak Automations — More booked jobs with GBP, Ads, Landing Pages & Automations';
  const description =
    'We build a full lead engine for local service businesses: Google Business Profile optimization, high-converting landing pages, conversion tracking, Google/Facebook ads, and follow-up automations so leads don’t leak.';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/brand/facebook-cover.svg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/brand/facebook-cover.svg" />
      </Head>

      <div className="min-h-screen bg-ink-950 text-white">
        <div className="absolute inset-0 bg-hero-radial" />
        <div className="absolute inset-0 opacity-[0.18] [background-size:28px_28px] bg-grid-fade" />

        <header className="relative">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <Image src="/brand/profile-avatar.svg" alt="Raczniak Automations" fill priority />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight">Raczniak Automations</div>
                <div className="text-xs font-bold text-white/60">Baltimore-area service businesses</div>
              </div>
            </Link>

            <div className="hidden items-center gap-4 md:flex">
              <Link href="#services" className="text-sm font-extrabold text-white/70 hover:text-white">
                Services
              </Link>
              <Link href="#process" className="text-sm font-extrabold text-white/70 hover:text-white">
                Process
              </Link>
              <Link href="#faq" className="text-sm font-extrabold text-white/70 hover:text-white">
                FAQ
              </Link>
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400"
              >
                Get a free audit <ArrowRight className="h-4 w-4" />
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
                    <Target className="h-4 w-4 text-brand-200" /> Built for booked jobs
                  </Pill>
                  <Pill>
                    <Sparkles className="h-4 w-4 text-brand-200" /> Conversion-first
                  </Pill>
                </div>

                <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Turn clicks into <span className="text-brand-300">booked jobs</span> — with a lead engine that doesn’t leak.
                </h1>
                <p className="mt-5 text-base leading-relaxed text-white/75">
                  We build and run the system: <b className="text-white">Google Business Profile</b>,{' '}
                  <b className="text-white">high‑converting landing pages</b>, <b className="text-white">tracking</b>,{' '}
                  <b className="text-white">Google/Facebook ads</b>, and <b className="text-white">follow‑up automations</b>.
                  The goal is simple: more qualified leads, faster response, higher close rate.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/intake"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400"
                  >
                    Start the free audit <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#services"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white hover:bg-white/10"
                  >
                    See what we build <Gauge className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat icon={<Clock className="h-4 w-4" />} title="Fast wins" body="Fix the biggest leaks first" />
                  <MiniStat icon={<BarChart3 className="h-4 w-4" />} title="Track ROI" body="Calls + forms + source" />
                  <MiniStat icon={<Bot className="h-4 w-4" />} title="Automate" body="Text-back + follow-ups" />
                  <MiniStat icon={<BadgeCheck className="h-4 w-4" />} title="Clean setup" body="No black-box magic" />
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-brand-500/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 shadow-soft backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">FREE GROWTH AUDIT</div>
                      <div className="mt-2 text-xl font-extrabold tracking-tight">We’ll show you exactly what to fix.</div>
                      <div className="mt-2 text-sm text-white/70">
                        Answer a few questions and we’ll reply with a short plan + screenshots of your biggest conversion leaks.
                      </div>
                    </div>
                    <div className="hidden h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:block">
                      <Image src="/brand/profile-avatar.svg" alt="" width={48} height={48} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold">
                        <PhoneCall className="h-4 w-4 text-brand-200" /> Tracking + call flow
                      </div>
                      <div className="mt-1 text-sm text-white/70">
                        We set up conversions so you can see what actually produces booked jobs.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold">
                        <MessageCircle className="h-4 w-4 text-brand-200" /> Facebook-first outreach option
                      </div>
                      <div className="mt-1 text-sm text-white/70">
                        If you prefer, we’ll message your page first instead of cold calling.
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
                    <Link
                      href="/automations"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/10"
                    >
                      See our automation demos <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-4 text-xs text-white/55">
                    Tip: if you already have a GBP/website, include the link in intake so we can audit it faster.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            <SectionTitle
              eyebrow="WHAT WE BUILD"
              title="Everything your ads need to convert (and prove it)."
              body="Most campaigns fail because the landing page leaks, tracking is missing, response is slow, and follow-up is inconsistent. We fix the whole chain."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Card
                title="Google Business Profile (GBP)"
                body="Setup, cleanup, categories, services, photos, posts, offers—built to rank and convert calls."
                icon={<MapPin className="h-5 w-5" />}
              />
              <Card
                title="High-converting landing pages"
                body="Fast, mobile-first, persuasive pages built for leads—not pretty portfolios. Forms that qualify."
                icon={<Sparkles className="h-5 w-5" />}
              />
              <Card
                title="Conversion tracking (GTM/GA/Ads)"
                body="Calls + forms + source attribution so we can scale what works and cut what doesn’t."
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <Card
                title="Follow-up automations"
                body="Missed-call text-back, quote follow-ups, review requests, simple CRM workflows that stop leakage."
                icon={<Bot className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* PROCESS */}
          <section id="process" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            <SectionTitle
              eyebrow="PROCESS"
              title="Tight loop: audit → fix leaks → launch → measure → scale."
              body="We don’t start by “running ads.” We start by building a funnel that can actually convert—and then we scale it with tracking."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-4">
              <StepCard step="01" title="Audit" body="We scan your site/GBP and identify the biggest conversion leaks." />
              <StepCard step="02" title="Build" body="Landing page + tracking + forms + call flow. Fast." />
              <StepCard step="03" title="Launch" body="Google Search / LSA / Meta — based on your service + area." />
              <StepCard step="04" title="Scale" body="Optimize to booked jobs. Kill waste. Expand what works." />
            </div>
          </section>

          {/* FAQ + CTA */}
          <section id="faq" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            <SectionTitle
              eyebrow="FAQ"
              title="Quick answers, no fluff."
              body="If you have a specific niche or location, include it in intake so we can tailor the plan on the first message."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Faq
                q="Do you only work with Baltimore businesses?"
                a="Baltimore is the starting focus, but the system works anywhere. If you’re outside the area, submit anyway and we’ll confirm fit."
              />
              <Faq q="Can you just do GBP and not ads?" a="Yes. GBP-only is common. We’ll recommend the fastest path based on your current setup." />
              <Faq
                q="What if we already have a website?"
                a="Perfect. We can optimize the existing site—or build a conversion-focused landing page that outperforms it."
              />
              <Faq q="How do you contact us?" a="Facebook message by default (your choice), but you can choose text/email/phone in the intake." />
            </div>

            <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur">
              <div className="grid items-center gap-6 md:grid-cols-[1.4fr_0.6fr]">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">NEXT STEP</div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight">Get the free audit + plan.</div>
                  <div className="mt-3 text-sm leading-relaxed text-white/70">
                    We’ll reply with your quickest wins: what to change, what to track, and the simplest campaign that can start producing booked jobs.
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
                    href="/automations"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white hover:bg-white/10"
                  >
                    View demos <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/admin/targets" className="text-center text-xs font-extrabold text-white/40 hover:text-white/70">
                    Internal (targets)
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
                  <Image src="/brand/profile-avatar.svg" alt="" fill />
                </div>
                <div>
                  <div className="text-sm font-extrabold">Raczniak Automations</div>
                  <div className="text-xs text-white/55">Landing pages • tracking • ads • automations</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-extrabold text-white/55">
                <Link href="#services" className="hover:text-white">
                  Services
                </Link>
                <Link href="#process" className="hover:text-white">
                  Process
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


