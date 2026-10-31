
import React from "react";

export default function PrivacyTideBreaker() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>
        TideBreaker Privacy Policy
      </h1>

      <p style={styles.updated}>
        Last updated: October 31, 2026
      </p>

      <p style={styles.p}>
        TideBreaker is an arcade-style mobile game
        developed by Btown Labs, LLC. We respect
        your privacy and believe in transparency
        regarding how information is handled.
      </p>

      <Section title="Gameplay Data">
        TideBreaker may store game scores, progress,
        achievements, and preferences locally on your
        device to support gameplay functionality.
      </Section>

      <Section title="Advertising - Google AdMob">
        TideBreaker displays advertisements through
        Google AdMob, a third-party advertising service
        provided by Google. The Google Mobile Ads SDK
        may collect and process information such as
        IP addresses, device identifiers, advertising
        interactions, application usage information,
        crash logs, and performance data.
        This information may be used to deliver
        advertisements, measure their effectiveness,
        and prevent advertising fraud.
      </Section>

      <Section title="Personalized Advertising">
        Depending on your device settings, consent,
        and applicable law, advertising may be
        personalized or non-personalized. Where
        required, TideBreaker requests permission
        before allowing advertising-related tracking.
        You can manage certain privacy preferences
        through your device settings.
      </Section>

      <Section title="Third-Party Data Practices">
        Google processes advertising-related information
        according to its own privacy policies and
        applicable requirements.
      </Section>

      <p style={styles.p}>
        Learn more about Google's data practices:{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          How Google uses information from apps
          and sites that use its services
        </a>.
      </p>

      <Section title="Data Sharing">
        Btown Labs does not sell locally stored gameplay
        information. Google AdMob may collect and process
        information for advertising, measurement, and
        related purposes as described above.
      </Section>

      <Section title="Data Retention and Deletion">
        Locally stored game data can generally be
        removed by deleting TideBreaker, subject to
        device backups. Information processed by Google
        may be retained according to Google's own
        data retention policies.
      </Section>

      <Section title="Children's Privacy">
        TideBreaker does not knowingly request personal
        information directly from children. Advertising
        data practices are subject to applicable
        children's privacy requirements.
      </Section>

      <Section title="Changes to This Policy">
        We may update this privacy policy to reflect
        changes to TideBreaker or its advertising
        practices. Updates will be published here.
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
        Questions about this privacy policy?
        Email us at{" "}
        <a href="mailto:hello@btownlabs.com">
          hello@btownlabs.com
        </a>.
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
