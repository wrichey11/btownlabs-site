import React from "react";

export default function PrivacyMyGrocery() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>My Grocery - EZscan Privacy Policy</h1>
      <p style={styles.updated}>Last updated: April 2026</p>

      <p style={styles.p}>
        My Grocery - EZscan is a food tracking app that allows users to log meals
        and scan barcodes.
      </p>

      <Section title="Data we collect">
        None. All user data is stored locally on your device.
      </Section>

      <Section title="Data that leaves your device">
        Barcode scans send product codes to third-party databases such as Open
        Food Facts to retrieve food information. No personal data is sent.
      </Section>

      <Section title="Third-party services">
        My Grocery - EZscan uses Open Food Facts for barcode lookup only.
      </Section>

      <Section title="Notifications">
        My Grocery - EZscan uses local device features only. No external data is
        transmitted for notifications.
      </Section>

      <Section title="Children">
        My Grocery - EZscan is not directed at children under the age of 13 and
        does not knowingly collect information from children.
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