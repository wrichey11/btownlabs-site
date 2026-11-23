import React from "react";

export default function PrivacyTwelveSeams() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Twelve Seams Privacy Policy</h1>

      <p style={styles.updated}>Last updated: November 23, 2026</p>

      <p style={styles.p}>
        Twelve Seams is a tile-matching puzzle game developed by Btown Labs,
        LLC for iPhone and iPad. This policy explains how information is
        handled when you use the app.
      </p>

      <Section title="Information stored on your device">
        Twelve Seams does not require a Btown Labs account and does not ask
        you to provide your name, email address, contacts, precise location,
        or other personal details. Puzzle progress, daily results, streaks,
        stars, achievements, hints, statistics, preferences, and reminder
        settings are stored locally on your device. Limited game information
        may also be stored in an Apple app group so that the Twelve Seams
        widget can display your progress.
      </Section>

      <Section title="Advertising">
        The free version of Twelve Seams uses Google AdMob to display banner,
        interstitial, and optional rewarded advertisements. Google and its
        advertising partners may automatically process information such as
        your IP address, device or advertising identifiers, approximate
        location derived from your IP address, advertisements shown to you,
        interactions with advertisements, product interactions, and
        diagnostic or performance information. This information may be used
        to provide, personalize, measure, secure, and improve advertising
        services.
      </Section>

      <Section title="Advertising choices and consent">
        Where required, Twelve Seams uses Google's consent system to ask for
        your advertising privacy choices. The app may also ask for permission
        through Apple's App Tracking Transparency prompt before allowing
        tracking across apps or websites owned by other companies. You may
        decline that permission. In regions where Google requires a privacy
        options form, you can reopen it from the app's Settings screen.
        Twelve Seams also offers a one-time Remove Ads purchase that disables
        advertising in the app.
      </Section>

      <Section title="Game Center">
        Twelve Seams supports Apple Game Center leaderboards and achievements.
        If you are signed in to Game Center, the app may submit puzzle scores,
        total stars, Time Attack results, and earned achievements to Apple.
        Your Game Center nickname, avatar, scores, achievements, and related
        identifiers are handled by Apple under your Game Center settings.
        Btown Labs does not operate a separate account system or store your
        Game Center profile on its own servers.
      </Section>

      <Section title="Purchases">
        The optional Remove Ads purchase is processed by Apple through
        StoreKit and the App Store. Btown Labs does not receive or store your
        payment-card information. The app stores a local record of whether
        the purchase is active, while Apple remains the source of truth for
        the transaction and entitlement.
      </Section>

      <Section title="Notifications">
        If you grant notification permission, Twelve Seams can schedule local
        reminders for new daily puzzles and active streaks. These reminders
        are created and stored on your device. Btown Labs does not use a
        remote notification server to send them.
      </Section>

      <Section title="App analytics">
        Twelve Seams does not currently send its own gameplay analytics to
        Btown Labs. Gameplay events may be written to Apple's local system log
        for development and troubleshooting. Google AdMob and Apple services
        may independently process usage, advertising, diagnostic, purchase,
        and Game Center information as described in this policy and in their
        own privacy policies.
      </Section>

      <Section title="Third-party services">
        Twelve Seams uses services provided by Google and Apple. Their
        handling of information is governed by their respective policies:
      </Section>

      <ul style={styles.ul}>
        <li style={styles.li}>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Google Privacy Policy
          </a>
        </li>
        <li style={styles.li}>
          <a
            href="https://developers.google.com/admob/ios/privacy/data-disclosure"
            target="_blank"
            rel="noreferrer"
          >
            Google Mobile Ads SDK data disclosure
          </a>
        </li>
        <li style={styles.li}>
          <a
            href="https://www.apple.com/legal/privacy/data/en/game-center/"
            target="_blank"
            rel="noreferrer"
          >
            Apple Game Center &amp; Privacy
          </a>
        </li>
        <li style={styles.li}>
          <a
            href="https://www.apple.com/legal/privacy/data/en/app-store/"
            target="_blank"
            rel="noreferrer"
          >
            Apple App Store &amp; Privacy
          </a>
        </li>
      </ul>

      <Section title="Data sharing">
        Btown Labs does not sell your personal information. Information may
        be processed by Google and Apple when necessary to provide
        advertising, consent management, Game Center, App Store purchases,
        security, measurement, and related services. We may also disclose
        information if required by law or when reasonably necessary to
        protect our rights, users, or services.
      </Section>

      <Section title="Data retention and deletion">
        Game progress and preferences stored by Twelve Seams remain on your
        device until you reset them or delete the app, subject to any backups
        maintained by your device or Apple account. You can manage Game
        Center information through your Apple account and Game Center
        settings. Advertising information processed by Google is retained
        according to Google's policies and privacy controls. Because Btown
        Labs does not currently maintain a server-side player account or
        gameplay database, we generally do not have personal gameplay records
        to retrieve or delete.
      </Section>

      <Section title="Children">
        Twelve Seams is a general-audience puzzle game and is not directed to
        children under 13. Btown Labs does not knowingly collect personal
        information directly from children. Parents and guardians can use
        Apple's device, Game Center, purchase, advertising, and Screen Time
        controls to manage a child's experience.
      </Section>

      <Section title="Changes to this policy">
        We may update this privacy policy when Twelve Seams' features, service
        providers, or data practices change. Updates will be published on
        this page with a revised “Last updated” date.
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
        Questions or requests concerning this privacy policy can be sent to{" "}
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

  ul: {
    margin: "12px 0",
    paddingLeft: "24px",
  },

  li: {
    margin: "8px 0",
  },
};
