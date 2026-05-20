import React from "react";

export default function PrivacyWhatILiked() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>What I Liked Privacy Policy</h1>

      <p style={styles.updated}>Last updated: May 2026</p>

      <p style={styles.p}>
        What I Liked is a restaurant memory and food logging app that helps
        users remember dishes, restaurants, and dining experiences.
      </p>

      <Section title="Data we collect">
        All restaurant entries, notes, ratings, photos, and saved food items
        are stored locally on your device.
      </Section>

      <Section title="Camera and Photos">
        If you choose to use menu scanning or food photography features, the app
        may access your camera or photo library only with your permission.
      </Section>

      <Section title="Data that leaves your device">
        Menu scanning or barcode lookup features may send image or product data
        to third-party services solely for food recognition or product lookup.
        No personal identity information is transmitted.
      </Section>

      <Section title="Third-party services">
        The app may use third-party food databases or OCR services to improve
        food and menu recognition functionality.
      </Section>

      <Section title="Children">
        What I Liked is not directed at children under the age of 13 and does
        not knowingly collect information from children.
      </Section>

      <Section title="Medical Disclaimer">
        This app does not provide medical advice, dietary treatment, or
        healthcare recommendations.
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