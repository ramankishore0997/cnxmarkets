import { PublicLayout } from '@/components/layout/PublicLayout';

export function Terms() {
  return (
    <PublicLayout>
      <div className="bg-[#FFFFFF] min-h-screen py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm text-[#1F77B4] font-semibold uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Terms of Service</h1>
            <p className="text-[#6B7280]">Last updated: March 2026</p>
          </div>

          <div className="space-y-10 text-[#6B7280] leading-relaxed">

            <Section title="1. Acceptance of Terms">
              By accessing or using ECMarket Pro (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform. These Terms constitute a legally binding agreement between you and ECMarket Pro.
            </Section>

            <Section title="2. Eligibility">
              You must be at least 18 years of age and legally capable of entering into binding contracts under applicable law to use the Platform. By creating an account, you represent and warrant that you meet these eligibility requirements and that all information you provide is accurate and complete.
            </Section>

            <Section title="3. Account Registration and KYC">
              To access trading features, you must complete our Know Your Customer (KYC) verification process. You agree to provide accurate, current, and complete documentation as requested. ECMarket Pro reserves the right to suspend or terminate accounts where verification requirements are not met or where fraudulent information is detected.
            </Section>

            <Section title="4. Trading Services">
              ECMarket Pro provides algorithmic trading services on your behalf based on strategies you select. Past performance of any strategy does not guarantee future results. All trading involves risk, and you may lose some or all of your invested capital. You acknowledge that:
              <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
                <li>Algorithmic strategies operate automatically without manual intervention</li>
                <li>Market conditions can result in losses despite automated risk controls</li>
                <li>Daily growth targets are estimates and are not guaranteed</li>
                <li>ECMarket Pro does not provide personalised financial advice</li>
              </ul>
            </Section>

            <Section title="5. Deposits and Withdrawals">
              Deposits are processed through verified payment channels. Withdrawal requests are processed within 24 business hours to your registered bank account, subject to completed KYC and compliance checks. ECMarket Pro reserves the right to delay or refuse withdrawals if there is suspicion of fraudulent activity, money laundering, or breach of these Terms.
            </Section>

            <Section title="6. Fees and Charges">
              ECMarket Pro may charge performance fees, management fees, or transaction fees as disclosed on the Platform. All applicable fees will be clearly communicated prior to activation of any trading strategy. Fees are subject to change with prior notice.
            </Section>

            <Section title="7. Prohibited Activities">
              You agree not to:
              <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
                <li>Use the Platform for any unlawful purpose or in violation of applicable regulations</li>
                <li>Attempt to gain unauthorised access to any part of the Platform</li>
                <li>Provide false or misleading information during registration or KYC</li>
                <li>Engage in money laundering, fraud, or other financial crimes</li>
                <li>Reverse-engineer, copy, or distribute any part of the Platform</li>
              </ul>
            </Section>

            <Section title="8. Intellectual Property">
              All content, algorithms, software, designs, and trademarks on the Platform are the exclusive property of ECMarket Pro and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.
            </Section>

            <Section title="9. Limitation of Liability">
              To the maximum extent permitted by law, ECMarket Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, arising out of or in connection with your use of the Platform. Our total liability to you shall not exceed the amount of fees paid by you to ECMarket Pro in the three months preceding the claim.
            </Section>

            <Section title="10. Termination">
              ECMarket Pro reserves the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any reason we deem necessary to protect the integrity of the Platform or comply with legal obligations. Upon termination, your funds (if any) will be processed for withdrawal subject to applicable checks.
            </Section>

            <Section title="11. Governing Law">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra, India.
            </Section>

            <Section title="12. Changes to Terms">
              ECMarket Pro may update these Terms from time to time. We will notify registered users of material changes via email or platform notification. Continued use of the Platform after such notification constitutes acceptance of the updated Terms.
            </Section>

            <Section title="13. Contact Us">
              For questions regarding these Terms, please contact us at{' '}
              <a href="mailto:support@cnxmarkets.com" className="text-[#1F77B4] hover:underline">
                support@cnxmarkets.com
              </a>
              .
            </Section>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#E5E7EB] pt-8">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="text-[#6B7280] leading-relaxed">{children}</div>
    </div>
  );
}
