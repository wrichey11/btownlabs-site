import React from "react";

export default function PrivacyStitchSquare() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>
        Stitch &amp; Square: Quilt Puzzle Privacy Policy
      </h1>

      <p style={styles.updated}>
        Last updated: November 26, 2026
      </p>

      <p style={styles.p}>
        Stitch &amp; Square: Quilt Puzzle ("Stitch &amp; Square") is a
        quilting puzzle game developed by Btown Labs, LLC. We respect
        your privacy and believe in transparency regarding how
        information is handled.
      </p>

      <Section title="Gameplay Data">
        Stitch &amp; Square stores your quilts, scores, run history,
        daily and weekly challenge progress, streaks, Sewing Room
        decorations, and game settings locally on your device to support
        gameplay. No account is required to play, and Btown Labs does
        not collect this gameplay data.
      </Section>

      <Section title="Game Center">
        If you choose to sign in to Apple Game Center, your scores and
        achievements are sent to Apple to power leaderboards and
        achievements. Game Center is optional, and the game is fully
        playable while signed out. Apple handles Game Center data
        according to its own privacy policy.
      </Section>

      <Section title="In-App Purchases">
        Stitch &amp; Square offers a one-time Remove Ads purchase.
        Payments are processed entirely by Apple through the App Store.
        Btown Labs does not receive or store your payment information.
      </Section>

      <Section title="Advertising - Google AdMob">
        Stitch &amp; Square displays advertisements through Google
        AdMob, a third-party advertising service provided by Google,
        including ads between runs and optional reward videos. The
        Google Mobile Ads SDK may collect and process information such
        as IP addresses, approximate location derived from IP address,
        device identifiers, advertising interactions, application usage
        information, crash logs, and performance data. This information
        may be used to deliver advertisements, measure their
        effectiveness, and prevent advertising fraud.
      </Section>

      <Section title="Personalized Advertising and Your Choices">
        Depending on your device settings, consent, and applicable law,
        advertising may be personalized or non-personalized. Where
        required, Stitch &amp; Square shows a consent form before ads
        load, and it asks for your permission through Apple's App
        Tracking Transparency prompt before allowing advertising-related
        tracking. Where available, you can change your ad privacy
        choices at any time in Settings &rarr; Privacy Choices within
        the game, and you can manage tracking permission in your
        device's Settings.
      </Section>

      <Section title="Third-Party Data Practices">
        Google processes advertising-related information according to
        its own privacy policies and applicable requirements.
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
        Btown Labs does not sell your information and does not collect
        locally stored gameplay data. Google AdMob may collect and
        process information for advertising, measurement, and related
        purposes as described above.
      </Section>

      <Section title="Data Retention and Deletion">
        Locally stored game data can generally be removed by deleting
        Stitch &amp; Square, subject to device backups. Information
        processed by Google or Apple may be retained according to their
        own data retention policies.
      </Section>

      <Section title="Children's Privacy">
        Stitch &amp; Square does not knowingly request personal
        information directly from children. Advertising data practices
        are subject to applicable children's privacy requirements.
      </Section>

      <Section title="Changes to This Policy">
        We may update this privacy policy to reflect changes to Stitch
        &amp; Square or its advertising practices. Updates will be
        published here.
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
