import React, { useEffect } from 'react';
import './kidneyos.css';

const ROOT = '/kidneyos';
const APP_URL = 'https://apps.apple.com/us/app/kidneyos/id6767735794';
const SITE_URL = 'https://btownlabs.com';
const IMAGE_DIR = '/images/kidneyos';

const pages = {
  [ROOT]: {
    title: 'KidneyOS | Kidney Diet, Dialysis & Caregiver Tracker',
    description:
      'Keep kidney nutrition, medications, fluids, labs and dialysis ' +
      'information organized with KidneyOS, an iPhone and iPad app.',
  },
  [`${ROOT}/renal-diet-tracker`]: {
    title: 'Kidney Diet & Nutrient Tracker | KidneyOS',
    description:
      'Track sodium, potassium and phosphorus, save foods and recipes, ' +
      'and make kidney-conscious food logging simpler with KidneyOS.',
  },
  [`${ROOT}/dialysis-tracker`]: {
    title: 'Dialysis Session & Fluid Tracker | KidneyOS',
    description:
      'Track dialysis sessions, fluid intake, medication records and ' +
      'lab history in one place with KidneyOS.',
  },
  [`${ROOT}/caregivers`]: {
    title: 'Kidney Caregiver Tools | KidneyOS',
    description:
      'Organize kidney care records together with food, medications, ' +
      'labs and optional paid iCloud caregiver sharing.',
  },
};

const features = [
  {
    symbol: '◫',
    title: 'Kidney-focused food logging',
    description:
      'Track sodium, potassium and phosphorus alongside meals and favorite foods.',
    url: `${ROOT}/renal-diet-tracker`,
  },
  {
    symbol: '◌',
    title: 'Fluid tracking',
    description:
      'Log drinks and review progress toward a target established with your care team.',
    url: `${ROOT}/dialysis-tracker`,
  },
  {
    symbol: '✚',
    title: 'Medications and reminders',
    description: 'Keep medications together and schedule reminders for your routine.',
  },
  {
    symbol: '⌁',
    title: 'Lab trends',
    description: 'Record lab results and view patterns over time.',
  },
  {
    symbol: '▤',
    title: 'Dialysis sessions',
    description: 'Keep session history and other day-to-day records organized.',
    url: `${ROOT}/dialysis-tracker`,
  },
  {
    symbol: '♡',
    title: 'Caregiver sharing',
    description:
      'Optional paid features support coordinated logging with an invited caregiver.',
    url: `${ROOT}/caregivers`,
  },
];

// File names match the images in public/images/kidneyos/.
const screenshots = {
  dashboard: {
    src: `${IMAGE_DIR}/dashboard.png`,
    alt: 'KidneyOS dashboard with nutrient, fluid, and dialysis summaries',
  },
  food: {
    src: `${IMAGE_DIR}/food-log.png`,
    alt: 'KidneyOS food log with meal selection, search, and barcode scanning',
  },
  dialysis: {
    src: `${IMAGE_DIR}/dialysis.png`,
    alt: 'KidneyOS dialysis sessions and treatment history',
  },
  caregiver: {
    src: `${IMAGE_DIR}/caregiver.jpg`,
    alt: 'KidneyOS caregiver dashboard and quick actions',
  },
};

const detail = {
  [`${ROOT}/renal-diet-tracker`]: {
    kicker: 'Nutrition made more manageable',
    title: 'A simpler way to track your kidney diet.',
    intro:
      'Log meals, search foods, scan barcodes and keep an eye on the ' +
      'nutrients your care team has asked you to track.',
    bullets: [
      [
        'Sodium, potassium & phosphorus',
        'See kidney-focused nutrient information while keeping a record of meals.',
      ],
      [
        'Foods, recipes & favorites',
        'Build a food library and reuse the items you log often.',
      ],
      [
        'Search & barcode scanning',
        'Find foods from available data sources or create your own entries.',
      ],
    ],
    note:
      'Nutrient values may be missing or inaccurate in source databases; ' +
      'verify labels and follow the guidance of your renal dietitian.',
    screenshot: 'food',
  },
  [`${ROOT}/dialysis-tracker`]: {
    kicker: 'Your routine, organized',
    title: 'Keep the details of dialysis in one place.',
    intro:
      'From session records to fluids and medications, bring more of ' +
      'your everyday tracking together.',
    bullets: [
      [
        'Dialysis session records',
        'Maintain a useful history of your treatment sessions.',
      ],
      [
        'Fluid tracking',
        'Log drinks and other fluids against your clinician-prescribed target.',
      ],
      [
        'Medication and lab history',
        'Record medications and labs to support care conversations.',
      ],
    ],
    note:
      'Dialysis prescriptions and fluid limits must come from your ' +
      'healthcare team; app records do not replace clinical records.',
    screenshot: 'dialysis',
  },
  [`${ROOT}/caregivers`]: {
    kicker: 'Care is a team effort',
    title: 'A little more coordination. A lot less chasing details.',
    intro:
      'KidneyOS gives patients and invited caregivers tools to organize ' +
      'kidney-related information. Caregiver collaboration is available ' +
      'with KidneyOS Plus.',
    bullets: [
      [
        'Invite a caregiver',
        'Use supported iCloud sharing without sharing an Apple account password.',
      ],
      [
        'Organize logs together',
        'Collaborate on supported food, medication and lab records.',
      ],
      [
        'Review recent activity',
        'Use the caregiver dashboard to help track supported updates.',
      ],
    ],
    note:
      'Caregiver collaboration requires compatible Apple devices and ' +
      'iCloud setup. Confirm syncing before relying on it; do not use ' +
      'the app for urgent clinical communication.',
    screenshot: 'caregiver',
  },
};

function useMeta(path) {
  useEffect(() => {
    const meta = pages[path] || pages[ROOT];
    document.title = meta.title;

    const setMeta = (attribute, name, value) => {
      let node = document.head.querySelector(`meta[${attribute}="${name}"]`);

      if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attribute, name);
        document.head.appendChild(node);
      }

      node.content = value;
    };

    setMeta('name', 'description', meta.description);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', `${SITE_URL}${IMAGE_DIR}/icon.png`);
    setMeta('property', 'og:url', `${SITE_URL}${path}`);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path}`;

    let structured = document.getElementById('kidneyos-structured-data');
    if (!structured) {
      structured = document.createElement('script');
      structured.id = 'kidneyos-structured-data';
      structured.type = 'application/ld+json';
      document.head.appendChild(structured);
    }

    structured.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'KidneyOS',
      operatingSystem: 'iOS, iPadOS',
      applicationCategory: 'HealthApplication',
      url: `${SITE_URL}${ROOT}`,
      downloadUrl: APP_URL,
      author: { '@type': 'Organization', name: 'Btown Labs, LLC' },
      description: meta.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free to download; optional in-app purchases',
      },
    });

    return () => structured.remove();
  }, [path]);
}

function AppLink({ children = 'Download on the App Store', secondary = false }) {
  return (
    <a
      className={`ko-btn ${secondary ? 'ko-btn--light' : ''}`}
      href={APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get KidneyOS on the Apple App Store"
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function Shot({ image = 'dashboard', wide = false }) {
  const screenshot = screenshots[image];

  return (
    <div className={`ko-shot ${wide ? 'ko-shot--wide' : ''}`}>
      <img
        className="ko-shot__image"
        src={screenshot.src}
        alt={screenshot.alt}
        loading={image === 'dashboard' ? 'eager' : 'lazy'}
      />
    </div>
  );
}

function Header() {
  return (
    <header className="ko-header">
      <div className="ko-container ko-header__content">
        <a href={ROOT} className="ko-logo" aria-label="KidneyOS home">
          <img
            className="ko-mark"
            src={`${IMAGE_DIR}/icon.png`}
            alt=""
            width="40"
            height="40"
          />
          <span>
            Kidney<span className="ko-logo__os">OS</span>
          </span>
        </a>

        <nav className="ko-nav" aria-label="KidneyOS pages">
          <a href={`${ROOT}/renal-diet-tracker`}>Nutrition</a>
          <a href={`${ROOT}/dialysis-tracker`}>Dialysis</a>
          <a href={`${ROOT}/caregivers`}>Caregivers</a>
        </nav>

        <a
          className="ko-header__download"
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get the app ↗
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="ko-footer">
      <div className="ko-container">
        <div className="ko-footer__top">
          <div>
            <a className="ko-logo" href={ROOT}>
              <img
            className="ko-mark"
            src={`${IMAGE_DIR}/icon.png`}
            alt=""
            width="40"
            height="40"
          />
              <span>KidneyOS</span>
            </a>
            <p>Care, made easier to organize.</p>
          </div>

          <div className="ko-footer__links">
            <a href={`${ROOT}/renal-diet-tracker`}>Nutrition</a>
            <a href={`${ROOT}/dialysis-tracker`}>Dialysis</a>
            <a href={`${ROOT}/caregivers`}>Caregivers</a>
            <a href="mailto:hello@btownlabs.com?subject=KidneyOS%20Support">
              Support
            </a>
            <a href="/">Btown Labs</a>
          </div>
        </div>

        <p className="ko-disclaimer">
          <strong>Medical disclaimer:</strong> KidneyOS is an organizational
          and educational tool, not a medical device. It does not provide
          medical advice, diagnosis or treatment. Nutrient and fluid needs
          are individual. Always follow your care team’s guidance. Caregiver
          features and certain insights may require KidneyOS Plus. Nutrient
          data can be incomplete, especially for packaged foods.
        </p>

        <small>
          © {new Date().getFullYear()} Btown Labs, LLC. All rights reserved.
          {' · '}
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">
            App Store listing & privacy details ↗
          </a>
        </small>
      </div>
    </footer>
  );
}

function Kicker({ children }) {
  return (
    <div className="ko-kicker">
      <span className="ko-kicker__dot" />
      {children}
    </div>
  );
}

function CTA() {
  return (
    <section className="ko-cta">
      <div className="ko-container ko-cta__inner">
        <div>
          <Kicker>Get started today</Kicker>
          <h2>
            Make room for more life.
            <br />
            Spend less time organizing it.
          </h2>
          <p>KidneyOS is free to download for iPhone and iPad.</p>
        </div>
        <AppLink secondary />
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <section className="ko-hero">
        <div className="ko-container ko-hero__grid">
          <div className="ko-hero__copy">
            <Kicker>Meet KidneyOS · For iPhone & iPad</Kicker>
            <h1>
              Your kidney health.
              <br />
              <em>All in one place.</em>
            </h1>
            <p className="ko-lead">
              Food, fluids, medications, lab results and dialysis records—
              organized for the routines that matter to you and the people
              helping with your care.
            </p>
            <div className="ko-actions">
              <AppLink />
              <a className="ko-text-link" href="#features">
                Explore the features <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="ko-small-note">
              Free to download · Optional KidneyOS Plus features
            </p>
          </div>

          <div className="ko-hero__visual">
            <div className="ko-orbit ko-orbit--one" />
            <div className="ko-orbit ko-orbit--two" />
            <Shot image="dashboard" />

            <div className="ko-float ko-float--top">
              <span>✦</span>
              <div>
                <strong>Less scattered information</strong>
                <small>More of your records, together</small>
              </div>
            </div>

            <div className="ko-float ko-float--bottom">
              <span>♡</span>
              <div>
                <strong>Built for everyday care</strong>
                <small>Patients & caregivers</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ko-trust">
        <div className="ko-container ko-trust__inner">
          <span>One place for your daily routine</span>
          <strong>Nutrition</strong>
          <span>·</span>
          <strong>Labs</strong>
          <span>·</span>
          <strong>Medications</strong>
          <span>·</span>
          <strong>Dialysis</strong>
        </div>
      </section>

      <section id="features" className="ko-section">
        <div className="ko-container">
          <div className="ko-section__header">
            <Kicker>Thoughtful tools, one app</Kicker>
            <h2>Less juggling. More clarity.</h2>
            <p>
              Whether you’re keeping a food diary, managing a treatment
              schedule or helping someone you love, KidneyOS makes everyday
              recordkeeping easier.
            </p>
          </div>

          <div className="ko-feature-grid">
            {features.map((feature) => (
              <article className="ko-feature" key={feature.title}>
                <div className="ko-feature__icon" aria-hidden="true">
                  {feature.symbol}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                {feature.url && (
                  <a href={feature.url}>
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ko-section ko-section--tint">
        <div className="ko-container ko-split">
          <div>
            <Kicker>Designed for real life</Kicker>
            <h2>
              Care doesn’t happen in one place. Your information can.
            </h2>
            <p>
              KidneyOS brings everyday logs together so you can review
              patterns and discuss them with your care team.
            </p>
            <ul className="ko-checks">
              <li>Quickly log the foods you eat</li>
              <li>Keep fluid and medication records</li>
              <li>Record lab results and dialysis sessions</li>
              <li>Choose optional caregiver collaboration</li>
            </ul>
            <AppLink secondary />
          </div>
          <Shot image="food" wide />
        </div>
      </section>

      <section className="ko-section">
        <div className="ko-container ko-section__header ko-section__header--center">
          <Kicker>Made for the whole journey</Kicker>
          <h2>Find the tools that fit your routine</h2>
          <div className="ko-audience-grid">
            <a href={`${ROOT}/renal-diet-tracker`}>
              <span>01 / Nutrition</span>
              <h3>Living with CKD</h3>
              <p>Track the nutrients your clinician asks you to monitor.</p>
              <strong>Explore nutrition →</strong>
            </a>
            <a href={`${ROOT}/dialysis-tracker`}>
              <span>02 / Dialysis</span>
              <h3>Managing treatments</h3>
              <p>Stay organized with fluid logs and dialysis records.</p>
              <strong>Explore dialysis →</strong>
            </a>
            <a href={`${ROOT}/caregivers`}>
              <span>03 / Caregiving</span>
              <h3>Helping someone you love</h3>
              <p>
                Keep important details in sight and collaborate when invited.
              </p>
              <strong>Explore caregivers →</strong>
            </a>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}

function Detail({ path }) {
  const page = detail[path];

  return (
    <>
      <section className="ko-detail-hero">
        <div className="ko-container ko-detail-grid">
          <div>
            <a className="ko-back" href={ROOT}>
              ← Back to KidneyOS
            </a>
            <Kicker>{page.kicker}</Kicker>
            <h1>{page.title}</h1>
            <p className="ko-lead">{page.intro}</p>
            <div className="ko-actions">
              <AppLink />
              <a className="ko-text-link" href="#more">
                See how it works ↓
              </a>
            </div>
          </div>
          <Shot image={page.screenshot} />
        </div>
      </section>

      <section id="more" className="ko-section">
        <div className="ko-container">
          <div className="ko-section__header">
            <Kicker>How KidneyOS helps</Kicker>
            <h2>Made for real everyday routines</h2>
          </div>

          <div className="ko-feature-grid ko-feature-grid--three">
            {page.bullets.map(([name, description], index) => (
              <article className="ko-feature" key={name}>
                <div className="ko-feature__icon">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3>{name}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

          <div className="ko-note">
            <strong>Good to know</strong>
            <p>{page.note}</p>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}

export default function KidneyOS() {
  const path =
    typeof window === 'undefined'
      ? ROOT
      : window.location.pathname.replace(/\/$/, '') || '/';
  const recognized = Object.prototype.hasOwnProperty.call(pages, path);

  useMeta(recognized ? path : ROOT);

  if (!recognized) return null;

  return (
    <div className="kidneyos-site">
      <a href="#ko-main" className="ko-skip">
        Skip to content
      </a>
      <Header />
      <main id="ko-main">
        {path === ROOT ? <Home /> : <Detail path={path} />}
      </main>
      <Footer />
    </div>
  );
}

export function isKidneyOSPath(path = window.location.pathname) {
  return Object.prototype.hasOwnProperty.call(
    pages,
    path.replace(/\/$/, '') || '/'
  );
}
