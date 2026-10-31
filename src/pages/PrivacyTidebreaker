
import React from "react";

export default function PrivacyBendword() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Bendword Privacy Policy</h1>

      <p style={styles.updated}>Last updated: October 2026</p>

      <p style={styles.p}>
        Bendword is a daily word transformation puzzle game developed by
        Btown Labs, LLC. We respect your privacy and are committed to
        protecting your information.
      </p>

      <Section title="Data we collect">
        Bendword does not collect personal information. Game progress,
        scores, streaks, statistics, and preferences are stored locally
        on your device.
      </Section>

      <Section title="Data that leaves your device">
        Bendword does not transmit gameplay data or personal information
        to Btown Labs or third-party servers.
      </Section>

      <Section title="Third-party services">
        Bendword does not use third-party analytics, advertising networks,
        tracking technologies, or external data collection services.
      </Section>

      <Section title="Data sharing">
        Bendword does not sell, share, or disclose personal information
        to third parties.
      </Section>

      <Section title="Data retention and deletion">
        Game progress and preferences are stored locally on your device.
        You can remove locally stored application data by deleting
        Bendword, subject to any backups maintained by your device.
      </Section>

      <Section title="Children">
        Bendword does not knowingly collect personal information
        from children or adults.
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
