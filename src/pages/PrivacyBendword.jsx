
import React from "react";

export default function PrivacyBendword() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Bendword Privacy Policy</h1>

      <p style={styles.updated}>Last updated: November 2026</p>

      <p style={styles.p}>
        Bendword is a daily word transformation puzzle game developed by
        Btown Labs, LLC, available as an iPhone and iPad app and on the web
        at btownlabs.com/bendword. We respect your privacy and are committed
        to protecting your information.
      </p>

      <Section title="Data we collect">
        Bendword does not collect personal information. There are no accounts,
        and we never collect your name, email address, contacts, location,
        advertising identifier, or any other identifier for you or your device.
        Game progress, streaks, statistics, and preferences are stored locally
        on your device (in the app) or in your browser (on the web).
      </Section>

      <Section title="Anonymous usage statistics">
        To understand how many people play and which puzzles work well,
        Bendword sends a small anonymous message to Btown Labs when you open
        the game for the first time each day, start a puzzle, solve a puzzle,
        or share a result. Each message contains only: the event, the puzzle
        number, whether you played on the web or the app, the app version,
        simple game counts (solve time, hints, reveals, wrong guesses, and
        streak), how many days you have played, how many days since you first
        played, and for the daily open, the website or link that brought you
        to Bendword. Cloudflare, which hosts our website, adds the country the
        request came from. We do not store IP addresses, and the messages
        contain no identifier, so they cannot be linked to you or to each
        other. In the app, you can turn this off in Settings under
        “Share Anonymous Usage Stats.”
      </Section>

      <Section title="Third-party services">
        Bendword does not use third-party analytics, advertising networks, or
        tracking technologies. Our website and the anonymous statistics above
        are hosted by Cloudflare, which processes requests on our behalf. The
        website does not use cookies.
      </Section>

      <Section title="Data sharing">
        Bendword does not sell, share, or disclose personal information
        to third parties.
      </Section>

      <Section title="Data retention and deletion">
        Game progress and preferences are stored locally on your device.
        You can remove them by deleting the app, subject to any backups
        maintained by your device, or by clearing website data for
        btownlabs.com in your browser. Anonymous usage statistics cannot be
        linked to you, so they cannot be retrieved or deleted for a specific
        person.
      </Section>

      <Section title="Children">
        Bendword does not collect personal information from anyone,
        including children.
      </Section>

      <Section title="Changes to this policy">
        We may update this privacy policy if Bendword's functionality
        or data practices change. Any updates will be published
        on this page.
      </Section>

      <Footer />
    </main>
  );
}

function Section({ title, children }) {
  return (
    <>
      <h2 style={styles.h2}>{title}</h2>
      <p style={styles.p}>{children}</p>
    </>
  );
}

function Footer() {
  return (
    <>
      <h2 style={styles.h2}>Contact</h2>

      <p style={styles.p}>
        Questions about this privacy policy? Email us at{" "}
        <strong>hello@btownlabs.com</strong>.
      </p>
    </>
  );
}

const styles = {
  main: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    lineHeight: 1.6,
    color: "#111",
    backgroundColor: "#fff",
  },

  h1: {
    fontSize: "32px",
    marginBottom: "10px",
  },

  h2: {
    fontSize: "22px",
    marginTop: "30px",
    borderBottom: "1px solid #eee",
    paddingBottom: "6px",
  },

  p: {
    margin: "12px 0",
  },

  updated: {
    color: "#666",
    fontSize: "14px",
    margin: "12px 0",
  },
};
