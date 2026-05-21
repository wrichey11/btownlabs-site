import React from "react";

export default function PrivacyKidneyOS() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>KidneyOS Privacy Policy</h1>

      <p style={styles.updated}>Last updated: May 2026</p>

      <p style={styles.p}>
        KidneyOS is a kidney-focused nutrition and wellness support app designed
        to help users track food, nutrients, and kidney-related health habits.
      </p>

      <Section title="Data we collect">
        KidneyOS does not sell personal data. Information you enter, such as
        foods, meals, nutrition goals, notes, saved items, and preferences, is
        used only to provide app functionality.
      </Section>

      <Section title="Data stored on your device">
        KidneyOS is designed to store user-entered information locally on your
        device unless a feature clearly requires an external lookup or service.
      </Section>

      <Section title="Data that may leave your device">
        Features such as barcode lookup, food search, nutrition lookup, or image
        recognition may send limited food, barcode, image, or query data to
        third-party services to retrieve nutrition information or identify foods.
        These requests are used only to provide the requested app functionality.
      </Section>

      <Section title="Third-party services">
        KidneyOS may use third-party food databases, nutrition databases, OCR
        services, or image recognition services to support food lookup and
        nutrition analysis.
      </Section>

      <Section title="Camera and Photos">
        If you choose to use scanning or photo-based features, KidneyOS may
        request access to your camera or photo library. Access is used only for
        the feature you choose to use.
      </Section>

      <Section title="Health and medical disclaimer">
        KidneyOS does not provide medical advice, diagnosis, or treatment.
        Nutrition information and kidney-related guidance are informational only.
        Always consult a qualified healthcare professional for medical or dietary
        advice.
      </Section>

      <Section title="Children">
        KidneyOS is not directed at children under the age of 13 and does not
        knowingly collect information from children.
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