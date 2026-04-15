export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-[#1c1c1e] px-6 py-16">
      <div className="max-w-[680px] mx-auto">
        <h1 className="text-[2rem] font-semibold mb-1">PillLedger Privacy Policy</h1>
        <p className="text-[0.9rem] text-[#8e8e93] mb-9">Last updated: April 2026</p>

        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c] mb-6">
          PillLedger is a personal medication reminder app built for iPhone. Your privacy is important to us.
          This policy explains what data PillLedger handles and how.
        </p>

        <h2 className="text-[1.15rem] font-semibold mt-9 mb-3 text-[#1a73e8]">Data we collect</h2>
        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c] mb-6">
          <strong>None.</strong> PillLedger does not collect, transmit, sell, or share any personal data.
          All information you enter — medication names, dosages, schedules, and dose logs — is stored only on
          your device using iOS&apos;s built-in secure local storage (UserDefaults).
        </p>

        <h2 className="text-[1.15rem] font-semibold mt-9 mb-3 text-[#1a73e8]">Data that leaves your device</h2>
        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c] mb-6">
          None. PillLedger has no server, no account system, no analytics SDK, and no advertising.
          No data ever leaves your iPhone.
        </p>

        <h2 className="text-[1.15rem] font-semibold mt-9 mb-3 text-[#1a73e8]">Notifications</h2>
        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c] mb-6">
          PillLedger uses iOS local notifications to remind you when it&apos;s time to take a medication.
          These reminders are scheduled entirely on your device. No notification content is sent to any external server.
        </p>

        <h2 className="text-[1.15rem] font-semibold mt-9 mb-3 text-[#1a73e8]">Third-party services</h2>
        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c] mb-6">
          PillLedger does not integrate with any third-party services, analytics platforms, or advertising networks.
        </p>

        <h2 className="text-[1.15rem] font-semibold mt-9 mb-3 text-[#1a73e8]">Children</h2>
        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c] mb-6">
          PillLedger is not directed at children under the age of 13 and does not knowingly collect information from children.
        </p>

        <h2 className="text-[1.15rem] font-semibold mt-9 mb-3 text-[#1a73e8]">Changes to this policy</h2>
        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c] mb-6">
          If we make material changes to this policy, we will update the &quot;Last updated&quot; date above and release
          a new version of the app. Continued use of the app after changes constitutes acceptance of the updated policy.
        </p>

        <h2 className="text-[1.15rem] font-semibold mt-9 mb-3 text-[#1a73e8]">Contact</h2>
        <p className="text-[1rem] leading-[1.7] text-[#3a3a3c]">
          Questions about this privacy policy? Email us at{" "}
          <a href="mailto:hello@btownlabs.com" className="text-[#1a73e8] underline">
            hello@btownlabs.com
          </a>.
        </p>
      </div>
    </div>
  );
}