import React from "react";

export default function PrivacyFoodLedgerKidney() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>My Food Ledger Kidney Privacy Policy</h1>
      <p style={styles.updated}>Last updated: April 2026</p>

      <p style={styles.p}>
        My Food Ledger Kidney is a food tracking app designed to help users log
        meals and monitor nutrition.
      </p>

      <Section title="Data we collect">
        None. All information you enter — foods, meals, saved meals, weight
        entries, and goals — is stored only on your device.
      </Section>

      <Section title="Data that leaves your device">
        When you scan a barcode, the app sends the barcode number to a
        third-party food database (such as Open Food Facts) to retrieve product
        information. No personal information is transmitted.
      </Section>

      <Section title="Third-party services">
        Uses Open Food Facts only for barcode lookup. No personal data is shared.
      </Section>

      <Section title="Notifications">
        Uses local device functionality only. No external transmission.
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