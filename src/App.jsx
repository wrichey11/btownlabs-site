import { Routes, Route } from "react-router-dom";
import PrivacyPolicy from "./PrivacyPolicy";
function BtownLabsLandingPage() {
  const services = [
    {
      title: "Internal Systems",
      desc: "Purpose-built software that replaces brittle spreadsheets, patchwork tools, and manual handoffs with systems designed around your actual operation.",
    },
    {
      title: "Operational Automation",
      desc: "Automate repetitive workflows, approvals, reporting, and data movement so your team can move faster with fewer errors.",
    },
    {
      title: "Client-Facing Products",
      desc: "Polished portals, platforms, and custom applications that create better customer experiences and stronger business leverage.",
    },
  ];

  const outcomes = [
    "Reduce operational friction",
    "Eliminate manual work",
    "Improve visibility and control",
    "Build software that fits the business",
  ];

  const process = [
    {
      step: "01",
      title: "Diagnose",
      desc: "We start by identifying where the real friction lives: bottlenecks, broken workflows, duplicated work, and systems that no longer fit.",
    },
    {
      step: "02",
      title: "Design",
      desc: "We define the right solution before building, aligning product thinking, user experience, and technical architecture around the business outcome.",
    },
    {
      step: "03",
      title: "Build",
      desc: "We move quickly, communicate clearly, and ship in focused iterations so progress is visible and useful from the start.",
    },
    {
      step: "04",
      title: "Refine",
      desc: "Once live, we improve the system where it matters most so the software keeps creating leverage as the business grows.",
    },
  ];

  const fit = [
    "Growing teams that feel operational drag",
    "Businesses that have outgrown spreadsheets or generic software",
    "Organizations with complex workflows that need a better system",
    "Leaders who value clarity, speed, and practical execution",
  ];

  const principles = [
    ["Practical by default", "We build for the real world, not for demo slides."],
    ["Clean architecture", "Systems should be maintainable, extensible, and easy to reason about."],
    ["Sharp product thinking", "Good software is as much about workflow design as code."],
    ["Direct collaboration", "Decisions move faster when communication is clear and close."],
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-[-5%] left-[18%] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">Btown Labs</div>
            <div className="text-sm text-zinc-400">Software systems, automation, and product engineering</div>
          </div>
          <nav className="hidden gap-8 text-sm text-zinc-300 md:flex">
            <a href="#services" className="transition hover:text-white">Services</a>
            <a href="#process" className="transition hover:text-white">Process</a>
            <a href="#fit" className="transition hover:text-white">Fit</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              Custom software for businesses with real operational complexity
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              We turn operational friction into software that creates leverage.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Btown Labs designs and builds internal systems, workflow automation, and client-facing software for teams that need more than off-the-shelf tools can provide.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-400">
              The goal is not to add more software. It is to build the right software: systems that simplify execution, improve visibility, and help the business move faster.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-medium text-zinc-950 transition hover:scale-[1.01]"
              >
                Start a Conversation
              </a>
              <a
                href="#services"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
              >
                See What We Build
              </a>
            </div>
            <div className="mt-10 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              {outcomes.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="rounded-[1.5rem] border border-white/10 bg-zinc-900 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Why Btown Labs</div>
                    <div className="mt-2 text-2xl font-semibold">Built for high-value operational problems</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Focused
                  </div>
                </div>
                <div className="space-y-4">
                  {principles.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm text-zinc-500">{label}</div>
                      <div className="mt-1 text-base text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
          <div className="mb-10 max-w-2xl">
            <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">Services</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Software built around outcomes, not buzzwords.</h2>
            <p className="mt-4 text-zinc-400">
              Btown Labs helps businesses replace friction with systems that are faster, cleaner, and better aligned with how the work actually gets done.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <div className="text-xl font-semibold">{service.title}</div>
                <p className="mt-3 leading-7 text-zinc-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-8">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/[0.06] to-white/[0.03] p-8 lg:p-10">
            <div className="max-w-4xl">
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">Positioning</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                We build software for teams operating in the real world, where complexity, handoffs, and friction actually matter.
              </h2>
              <p className="mt-5 max-w-3xl leading-8 text-zinc-400">
                That can mean field operations, service delivery, internal workflows, reporting systems, approvals, customer portals, or the infrastructure behind them. The common thread is simple: the software needs to fit the business, not force the business to fit the software.
              </p>
            </div>
          </div>
        </section>

        <section id="process" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
          <div className="mb-10 max-w-2xl">
            <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">Process</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A disciplined path from problem to system.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {process.map((item) => (
              <div key={item.step} className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-6">
                <div className="text-sm tracking-[0.35em] text-zinc-500">{item.step}</div>
                <div className="mt-4 text-xl font-semibold">{item.title}</div>
                <p className="mt-3 text-zinc-400 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="fit" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">Who We Work With</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Best fit for teams that know the problem is bigger than a quick patch.</h2>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {fit.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-zinc-300">
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-6 leading-8 text-zinc-400">
                If the work depends on too many manual steps, too much tribal knowledge, or tools that were never designed for your workflow, there is usually an opportunity to build something materially better.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:p-12">
            <div className="max-w-3xl">
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">What You Can Expect</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Clear thinking, strong execution, and software that earns its place.</h2>
              <p className="mt-4 text-zinc-400 leading-8">
                Btown Labs is built around a simple standard: thoughtful systems, clean delivery, and decisions that keep the business case at the center. No unnecessary complexity. No vague consulting theater. Just well-designed software that helps the operation run better.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-8 lg:pb-32">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:p-12">
            <div className="max-w-3xl">
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">Contact</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Have a workflow, system, or product that needs to be built properly?</h2>
              <p className="mt-4 text-zinc-400 leading-8">
                Let’s talk through the problem, the current friction, and what a better system could look like. Btown Labs works best where the right software can create real operational leverage.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="mailto:hello@btownlabs.com" className="rounded-2xl bg-cyan-300 px-6 py-3 text-center text-sm font-medium text-zinc-950">
                  hello@btownlabs.com
                </a>
                <a href="https://btownlabs.com" className="rounded-2xl border border-white/10 px-6 py-3 text-center text-sm font-medium text-white">
                  btownlabs.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BtownLabsLandingPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
  );
}