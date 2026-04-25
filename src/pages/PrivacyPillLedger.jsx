import React from "react";

export default function PrivacyPillLedger() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>PillLedger Privacy Policy</h1>
      <p style={styles.updated}>Last updated: April 2026</p>

      <p style={styles.p}>
        PillLedger is a personal medication reminder app built for iPhone.
      </p>

      <Section title="Data we collect">
        None. PillLedger does not collect, transmit, sell, or share any personal
        data. All information you enter is stored only on your device.
      </Section>

      <Section title="Data that leaves your device">
        None. PillLedger has no server, no analytics, and no advertising.
      </Section>

      <Section title="Notifications">
        Uses iOS local notifications only. No data is transmitted externally.
      </Section>

      <Section title="Third-party services">
        None.
      </Section>

      <Section title="Children">
        Not directed at children under 13.
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
        Email <strong>hello@btownlabs.com</strong>
      </p>
    </>
  );
}

const styles = {
  main: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
  },
  h1: { fontSize: "32px" },
  h2: { fontSize: "22px", marginTop: 30 },
  p: { margin: "12px 0" },
  updated: { color: "#666", fontSize: 14 },
};