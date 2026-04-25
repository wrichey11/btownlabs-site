import React from "react";

export default function PrivacyIndex() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Btown Labs Privacy Policies</h1>

      <p style={styles.updated}>Last updated: April 2026</p>

      <p style={styles.p}>
        Btown Labs builds simple, privacy-focused apps. Each app has its own
        privacy policy describing how it handles data.
      </p>

      <div style={{ marginTop: 30 }}>
        <AppLink
          name="PillLedger"
          description="Medication reminder app"
          link="/privacy/pillledger"
        />

        <AppLink
          name="My Grocery - EZscan"
          description="Food tracking and barcode scanning app"
          link="/privacy/mygrocery"
        />
      </div>

      <hr style={styles.hr} />

      <h2 style={styles.h2}>Contact</h2>
      <p style={styles.p}>
        Questions? Email <strong>hello@btownlabs.com</strong>
      </p>
    </main>
  );
}

function AppLink({ name, description, link }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <a href={link} style={styles.link}>
        {name}
      </a>
      <p style={{ margin: 0, color: "#666" }}>{description}</p>
    </div>
  );
}

const styles = {
  main: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    lineHeight: 1.6,
  },
  h1: { fontSize: "32px" },
  h2: { fontSize: "24px", marginTop: 30 },
  p: { margin: "12px 0" },
  updated: { color: "#666", fontSize: 14 },
  link: { fontSize: 18, fontWeight: "600", textDecoration: "none" },
  hr: { margin: "40px 0", borderTop: "1px solid #eee" },
};