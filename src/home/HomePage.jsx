import { useEffect, useRef } from "react";
import "./home.css";

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

const process = [
  { step: "01", title: "Discover", color: "#05C8B5", desc: "Clarify the problem, define the outcome, and identify the highest-value path forward." },
  { step: "02", title: "Design", color: "#187DDF", desc: "Shape the user experience, technical approach, and delivery plan before writing unnecessary code." },
  { step: "03", title: "Build", color: "#175BA3", desc: "Develop quickly, communicate clearly, and keep momentum through tight execution cycles." },
  { step: "04", title: "Launch & Improve", color: "#037B78", desc: "Ship confidently, gather feedback, and keep refining where it matters most." },
];

const headline = ["Modern", "software", "for", "teams", "that", "need", "real", "solutions."];
const accentWords = new Set(["real", "solutions."]);

const navLinks = [
  ["/kidneyos", "KidneyOS"],
  ["/bendword", "Bendword"],
  ["#services", "Services"],
  ["#process", "Process"],
  ["#about", "About"],
  ["#contact", "Contact"],
];

/** Adds .is-in to every .bt-reveal element inside the container as it scrolls into view. */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const els = root.querySelectorAll(".bt-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function Logo() {
  return (
    <img
      src="/btownlabs-logo.svg"
      alt="Btown Labs"
      className="h-9 w-auto sm:h-10"
      width="200"
      height="40"
    />
  );
}

function Eyebrow({ children }) {
  return (
    <div className="text-[13px] uppercase tracking-[0.3em]" style={{ color: "var(--bt-accent)" }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef} className="bt-home min-h-screen">
      {/* ---------- Intro hero ---------- */}
      <section className="bt-hero" aria-label="Intro">
        <div className="bt-hero__sink absolute inset-0" aria-hidden="true">
          <div className="bt-hero__zoom">
            <div className="bt-hero__photo" />
            <div className="bt-hero__tint" />
          </div>
        </div>
        <div className="bt-hero__shooting" aria-hidden="true" />
        <div className="bt-hero__shade" aria-hidden="true" />

        <header className="bt-hero__header relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <a href="/" aria-label="Btown Labs — home" className="flex shrink-0">
            <Logo />
          </a>
          <nav aria-label="Main" className="hidden flex-wrap gap-x-6 gap-y-2 text-sm md:flex">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} className="text-slate-300 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </header>

        <div className="bt-hero__copy absolute inset-x-0 z-10 mx-auto max-w-7xl px-6" style={{ top: "clamp(110px, 16vh, 180px)" }}>
          <div className="bt-eyebrow text-[13px] uppercase tracking-[0.42em] text-slate-200">
            Btown Labs · Boulder, Colorado
          </div>
          <h1
            className="mt-5 max-w-3xl font-semibold leading-[1.04] tracking-[-0.035em]"
            style={{ fontSize: "clamp(40px, 5.2vw, 72px)", textShadow: "0 4px 40px rgba(0,0,0,0.6)" }}
          >
            {headline.map((word, i) => (
              <span
                key={word}
                className="bt-word"
                style={{ "--i": i, color: accentWords.has(word) ? "var(--bt-accent)" : undefined }}
              >
                {word}
                {i < headline.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="bt-hero__sub mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Custom software, product experiences, and intelligent workflows, built for businesses that
            want technology to create leverage.
          </p>
          <div className="bt-hero__ctas mt-8 flex flex-wrap gap-3.5">
            <a
              href="#contact"
              className="rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-[#04101a] transition hover:brightness-110"
              style={{ background: "var(--bt-accent)" }}
            >
              Start a Project
            </a>
            <a
              href="#services"
              className="rounded-2xl border border-white/20 bg-black/40 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-white/10"
            >
              Explore Services
            </a>
          </div>
        </div>

        <a
          href="#services"
          aria-label="Scroll to explore"
          className="bt-hero__scroll absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 text-xs uppercase tracking-[0.3em] text-slate-400"
        >
          <span>Scroll</span>
          <span className="relative h-10 w-px bg-slate-400/30">
            <span className="bt-hero__dot absolute -left-0.5 top-0 h-[5px] w-[5px] rounded-full bg-slate-100" />
          </span>
        </a>
      </section>

      {/* ---------- Content ---------- */}
      <main style={{ background: "linear-gradient(180deg, #03060b 0%, #08121c 220px)" }}>
        <section id="services" className="mx-auto max-w-7xl px-6 pb-12 pt-28">
          <div className="bt-reveal">
            <Eyebrow>Services</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-[44px] sm:leading-tight">
              Built for clarity, speed, and impact.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Whether you need a product from scratch, a smarter internal system, or help turning technical
              ideas into working software, Btown Labs focuses on high-value execution.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {services.map((s, i) => (
              <div
                key={s.title}
                className="bt-reveal rounded-3xl border border-white/10 bg-[#0d1b29] p-7"
                style={{ "--d": i }}
              >
                <div className="text-xl font-semibold">{s.title}</div>
                <p className="mt-3 leading-7 text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Our apps" className="mx-auto grid max-w-7xl gap-5 px-6 pb-12 pt-6 md:grid-cols-2">
          <a
            href="/kidneyos"
            className="bt-reveal flex flex-col gap-1.5 rounded-3xl border border-[#05D4BB]/25 p-7 transition hover:border-[#05D4BB]/50"
            style={{ background: "linear-gradient(160deg, rgba(5,200,181,0.12), rgba(5,200,181,0.02))" }}
          >
            <span className="text-[13px] text-slate-400">Kidney-care tracking app</span>
            <span className="text-[22px] font-semibold text-white">Explore KidneyOS →</span>
          </a>
          <a
            href="/bendword"
            className="bt-reveal flex flex-col gap-1.5 rounded-3xl border border-[#187DDF]/30 p-7 transition hover:border-[#187DDF]/60"
            style={{ "--d": 1, background: "linear-gradient(160deg, rgba(24,125,223,0.14), rgba(24,125,223,0.02))" }}
          >
            <span className="text-[13px] text-slate-400">Daily word puzzle</span>
            <span className="text-[22px] font-semibold text-white">Try Bendword →</span>
          </a>
        </section>

        <section id="process" className="mx-auto max-w-7xl px-6 py-12">
          <div className="bt-reveal">
            <Eyebrow>Process</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[44px] sm:leading-tight">
              A disciplined path from idea to launch.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {process.map((p, i) => (
              <div
                key={p.step}
                className="bt-reveal rounded-3xl bg-[#0d1b29] p-7"
                style={{ "--d": i, borderTop: `3px solid ${p.color}` }}
              >
                <div className="text-[13px] tracking-[0.3em] text-slate-500">{p.step}</div>
                <div className="mt-3.5 text-xl font-semibold">{p.title}</div>
                <p className="mt-2.5 leading-7 text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-7xl gap-5 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            className="bt-reveal rounded-[28px] border border-white/10 p-9"
            style={{ background: "linear-gradient(160deg, #0f2a40, #0b1825)" }}
          >
            <Eyebrow>About</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
              Small enough to move fast. Experienced enough to build it right.
            </h2>
          </div>
          <div className="bt-reveal rounded-[28px] border border-white/10 bg-[#0d1b29] p-9" style={{ "--d": 1 }}>
            <p className="text-lg leading-8 text-slate-200">
              Btown Labs is a modern software development company focused on solving real business problems
              with thoughtful engineering, practical strategy, and strong product instincts.
            </p>
            <p className="mt-5 leading-8 text-slate-400">
              The goal is simple: build technology that helps clients move faster, operate better, and look
              more polished while doing it.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pt-12">
          <div
            id="contact"
            className="bt-reveal relative overflow-hidden rounded-[32px] border border-white/10"
            style={{ background: "linear-gradient(180deg, #0a1628 0%, #13233d 100%)" }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 1440 220"
              preserveAspectRatio="none"
              className="absolute bottom-0 left-0 block h-[150px] w-full"
            >
              <path
                d="M0 220 L0 150 C200 130 380 90 560 70 C660 60 760 90 900 120 C1100 160 1300 160 1440 166 L1440 220Z M640 220 L680 120 L712 70 L734 66 L760 130 L800 220Z M780 220 L812 140 L840 104 L856 104 L876 150 L904 220Z"
                fill="rgba(5,200,181,0.08)"
              />
            </svg>
            <div className="relative max-w-3xl px-8 pb-28 pt-14 lg:px-12">
              <Eyebrow>Contact</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Have an idea, product, or system that needs to get built?
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                Let’s talk about what you’re building and where Btown Labs can help.
              </p>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <a
                  href="mailto:hello@btownlabs.com"
                  className="rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-[#04101a]"
                  style={{ background: "var(--bt-accent)" }}
                >
                  hello@btownlabs.com
                </a>
                <a
                  href="https://btownlabs.com"
                  className="rounded-2xl border border-white/20 px-6 py-3.5 text-[15px] font-medium text-white"
                >
                  btownlabs.com
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-6 pb-12 pt-10 text-[13px] text-slate-500">
          <div>© {new Date().getFullYear()} Btown Labs · Boulder, Colorado</div>
          <a href="/privacy" className="hover:text-slate-300">
            Privacy
          </a>
        </footer>
      </main>
    </div>
  );
}
