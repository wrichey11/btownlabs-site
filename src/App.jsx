import { Routes, Route } from "react-router-dom";
import PrivacyPolicy from "./PrivacyPolicy";

function BtownLabsLandingPage() {
  const services = [
    {
      title: "Custom Software",
      desc: "Web apps, internal tools, platforms, and line-of-business systems designed around how your team actually works.",
    },
    {
      title: "Product Engineering",
      desc: "From MVPs to production-ready releases, Btown Labs helps turn ideas into polished, scalable software products.",
    },
    {
      title: "Automation & AI",
      desc: "Workflow automation, integrations, and practical AI features that reduce busywork and unlock new capabilities.",
    },
  ];

  const pillars = [
    "Fast, pragmatic execution",
    "Clean architecture that can grow",
    "Direct collaboration with decision-makers",
    "Elegant UX without unnecessary complexity",
  ];

  const process = [
    {
      step: "01",
      title: "Discover",
      desc: "Clarify the problem, define the outcome, and identify the highest-value path forward.",
    },
    {
      step: "02",
      title: "Design",
      desc: "Shape the user experience, technical approach, and delivery plan before writing unnecessary code.",
    },
    {
      step: "03",
      title: "Build",
      desc: "Develop quickly, communicate clearly, and keep momentum through tight execution cycles.",
    },
    {
      step: "04",
      title: "Launch & Improve",
      desc: "Ship confidently, gather feedback, and keep refining where it matters most.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-5%] top-[15%] h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-[20%] h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">Btown Labs</div>
            <div className="text-sm text-zinc-400">Software development & technology consulting</div>
          </div>
          <nav className="hidden gap-8 text-sm text-zinc-300 md:flex">
            <a href="#services" className="transition hover:text-white">Services</a>
            <a href="#process" className="transition hover:text-white">Process</a>
            <a href="#about" className="transition hover:text-white">About</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              Building sharp digital products with speed and precision
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Modern software for teams that need real solutions.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Btown Labs designs and builds custom software, product experiences, and intelligent workflows for businesses that want technology to create leverage.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-medium text-zinc-950 transition hover:scale-[1.01]"
              >
                Start a Project
              </a>
              <a
                href="#services"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
              >
                Explore Services
              </a>
            </div>
            <div className="mt-10 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              {pillars.map((item) => (
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
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Capability Snapshot</div>
                    <div className="mt-2 text-2xl font-semibold">What Btown Labs delivers</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Available
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    ["Web Platforms", "Customer-facing apps and internal systems"],
                    ["Mobile-Ready UX", "Responsive experiences built for speed"],
                    ["Integrations", "APIs, automation, and connected workflows"],
                    ["Advisory", "Technical direction and delivery strategy"],
                  ].map(([label, value]) => (
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
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Built for clarity, speed, and impact.</h2>
            <p className="mt-4 text-zinc-400">
              Whether you need a product from scratch, a smarter internal system, or help turning technical ideas into working software, Btown Labs focuses on high-value execution.
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

        <section id="process" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
          <div className="mb-10 max-w-2xl">
            <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">Process</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A disciplined path from idea to launch.</h2>
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

        <section id="about" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">About</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Small enough to move fast. Experienced enough to build it right.</h2>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8">
              <p className="text-lg leading-8 text-zinc-300">
                Btown Labs is a modern software development company focused on solving real business problems with thoughtful engineering, practical strategy, and strong product instincts.
              </p>
              <p className="mt-5 leading-8 text-zinc-400">
                The brand is built around sharp thinking, clean execution, and solutions that create leverage. The goal is simple: build technology that helps clients move faster, operate better, and look more polished while doing it.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-8 lg:pb-32">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:p-12">
            <div className="max-w-3xl">
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-300">Contact</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Have an idea, product, or system that needs to get built?</h2>
              <p className="mt-4 text-zinc-400 leading-8">
                Let’s talk about what you’re building and where Btown Labs can help. Replace this section with your email address, scheduling link, or intake form when you’re ready.
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