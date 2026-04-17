import React from "react";

export default function PrivacyPolicy() {
  return (
    <main
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        lineHeight: 1.6,
        color: "#111",
        backgroundColor: "#fff",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          marginBottom: "10px",
        }}
      >
        Btown Labs Privacy Policy
      </h1>

      <p
        style={{
          color: "#666",
          fontSize: "14px",
          margin: "12px 0",
        }}
      >
        Last updated: April 2026
      </p>

      <p style={{ margin: "12px 0" }}>
        Btown Labs builds simple, privacy-focused apps for iPhone. Your privacy
        is important to us. This policy explains what data our apps handle and
        how.
      </p>

      <hr style={{ margin: "40px 0", border: "0", borderTop: "1px solid #eee" }} />

      <SectionTitle>PillLedger</SectionTitle>

      <p style={{ margin: "12px 0" }}>
        PillLedger is a personal medication reminder app built for iPhone.
      </p>

      <SubTitle>Data we collect</SubTitle>
      <p style={{ margin: "12px 0" }}>
        None. PillLedger does not collect, transmit, sell, or share any
        personal data. All information you enter — medication names, dosages,
        schedules, and dose logs — is stored only on your device using iOS's
        built-in secure local storage (UserDefaults).
      </p>

      <SubTitle>Data that leaves your device</SubTitle>
      <p style={{ margin: "12px 0" }}>
        None. PillLedger has no server, no account system, no analytics SDK,
        and no advertising. No data ever leaves your iPhone.
      </p>

      <SubTitle>Notifications</SubTitle>
      <p style={{ margin: "12px 0" }}>
        PillLedger uses iOS local notifications to remind you when it's time to
        take a medication. These reminders are scheduled entirely on your
        device. No notification content is sent to any external server.
      </p>

      <SubTitle>Third-party services</SubTitle>
      <p style={{ margin: "12px 0" }}>
        PillLedger does not integrate with any third-party services, analytics
        platforms, or advertising networks.
      </p>

      <SubTitle>Children</SubTitle>
      <p style={{ margin: "12px 0" }}>
        PillLedger is not directed at children under the age of 13 and does not
        knowingly collect information from children.
      </p>

      <hr style={{ margin: "40px 0", border: "0", borderTop: "1px solid #eee" }} />

      <SectionTitle>My Food Ledger Kidney</SectionTitle>

      <p style={{ margin: "12px 0" }}>
        My Food Ledger Kidney is a food tracking app designed to help users log
        meals and monitor nutrition.
      </p>

      <SubTitle>Data we collect</SubTitle>
      <p style={{ margin: "12px 0" }}>
        None. My Food Ledger Kidney does not collect, transmit, sell, or share
        personal data. All information you enter — foods, meals, saved meals,
        weight entries, and goals — is stored only on your device.
      </p>

      <SubTitle>Data that leaves your device</SubTitle>
      <p style={{ margin: "12px 0" }}>
        When you scan a barcode, the app sends the barcode number to a
        third-party food database (such as Open Food Facts) to retrieve product
        information. No personal information is transmitted as part of this
        request.
      </p>

      <p style={{ margin: "12px 0" }}>
        Other than barcode lookup, My Food Ledger Kidney has no server, no
        account system, no analytics SDK, and no advertising.
      </p>

      <SubTitle>Notifications</SubTitle>
      <p style={{ margin: "12px 0" }}>
        My Food Ledger Kidney may use local device functionality but does not
        send data externally for notifications.
      </p>

      <SubTitle>Third-party services</SubTitle>
      <p style={{ margin: "12px 0" }}>
        My Food Ledger Kidney uses a third-party food database (Open Food
        Facts) only to look up product information by barcode. No personal data
        is shared with this service.
      </p>

      <SubTitle>Children</SubTitle>
      <p style={{ margin: "12px 0" }}>
        My Food Ledger Kidney is not directed at children under the age of 13
        and does not knowingly collect information from children.
      </p>

      <hr style={{ margin: "40px 0", border: "0", borderTop: "1px solid #eee" }} />

      <SectionTitle>Changes to this policy</SectionTitle>
      <p style={{ margin: "12px 0" }}>
        If we make material changes to this policy, we will update the "Last
        updated" date above and release a new version of the app. Continued use
        of the app after changes constitutes acceptance of the updated policy.
      </p>

      <SectionTitle>Contact</SectionTitle>
      <p style={{ margin: "12px 0" }}>
        Questions about this privacy policy? Email us at{" "}
        <strong>hello@btownlabs.com</strong>.
      </p>
    </main>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontSize: "24px",
        marginTop: "40px",
        borderBottom: "1px solid #eee",
        paddingBottom: "6px",
      }}
    >
      {children}
    </h2>
  );
}

function SubTitle({ children }) {
  return (
    <h3
      style={{
        fontSize: "20px",
        marginTop: "30px",
      }}
    >
      {children}
    </h3>
  );
}

