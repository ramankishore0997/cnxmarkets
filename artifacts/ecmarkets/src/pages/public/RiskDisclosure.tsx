import { PublicLayout } from '@/components/layout/PublicLayout';

export function RiskDisclosure() {
  return (
    <PublicLayout>
      <div className="bg-[#FFFFFF] min-h-screen py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm text-[#1F77B4] font-semibold uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Risk Disclosure Statement</h1>
            <p className="text-[#6B7280]">Last updated: March 2026</p>
          </div>

          <div className="mb-10 p-6 rounded-2xl border border-[#DC2626]/30 bg-[#DC2626]/5">
            <p className="text-[#DC2626] font-semibold text-sm leading-relaxed">
              <strong>Important Warning:</strong> Trading in financial markets involves substantial risk of loss and is not suitable for all investors. You should carefully consider your investment objectives, level of experience, and risk appetite before investing. The possibility exists that you could sustain a loss of some or all of your invested capital. Only trade with funds you can afford to lose.
            </p>
          </div>

          <div className="space-y-10 text-[#6B7280] leading-relaxed">

            <Section title="1. General Risk Warning">
              Algorithmic trading and financial market investments carry a high level of risk. The value of your investments can go up as well as down, and you may receive back less than you originally invested. Past performance of any trading strategy, algorithm, or fund is not indicative of future results. ECMarket Pro does not guarantee any particular level of return.
            </Section>

            <Section title="2. Market Risk">
              Financial markets are subject to rapid and unpredictable price movements driven by economic events, geopolitical developments, regulatory changes, and market sentiment. These movements may result in significant losses, even with automated risk management systems in place. No algorithm or system can eliminate market risk entirely.
            </Section>

            <Section title="3. Algorithmic Trading Risk">
              While algorithmic strategies are designed to execute trades with precision, they are subject to:
              <ul className="list-disc list-inside mt-3 space-y-1 ml-4">
                <li>Technical failures such as software errors, connectivity issues, or data feed disruptions</li>
                <li>Slippage — the difference between expected and actual execution prices</li>
                <li>Model risk — the risk that an algorithm performs poorly in unforeseen market conditions</li>
                <li>Execution risk arising from latency or exchange downtime</li>
              </ul>
            </Section>

            <Section title="4. Liquidity Risk">
              In certain market conditions, it may not be possible to execute trades at the desired price or volume. This is particularly relevant during periods of extreme market volatility, low trading volume, or significant news events. Illiquidity can amplify losses significantly.
            </Section>

            <Section title="5. Currency and Inflation Risk">
              For clients trading instruments denominated in currencies other than the Indian Rupee (INR), exchange rate fluctuations may affect the value of your returns. Inflation may also erode the real value of any returns generated over time.
            </Section>

            <Section title="6. Regulatory Risk">
              The regulatory environment for financial markets and algorithmic trading is continuously evolving. Changes in laws, regulations, or exchange rules may affect the operation of trading strategies, the availability of certain instruments, or the Platform's ability to operate in specific jurisdictions.
            </Section>

            <Section title="7. Leverage Risk">
              Certain trading instruments available on the Platform may involve the use of leverage. Leverage amplifies both potential profits and potential losses. A small adverse movement in the market may result in a loss that significantly exceeds your initial investment. Clients are advised to fully understand leverage before trading leveraged instruments.
            </Section>

            <Section title="8. Counterparty Risk">
              Transactions executed on the Platform are subject to counterparty risk — the risk that the other party to a transaction may default or be unable to fulfil their obligations. While ECMarket Pro takes measures to mitigate this risk, it cannot be entirely eliminated.
            </Section>

            <Section title="9. Client Fund Segregation">
              ECMarket Pro maintains client funds in segregated accounts, separate from operational funds. However, in the event of insolvency, regulatory action, or other extraordinary circumstances, there is no absolute guarantee that segregated funds will be fully protected. Clients are encouraged to regularly review their account balances and withdrawal history.
            </Section>

            <Section title="10. No Guaranteed Returns">
              Any references to expected returns, daily growth targets, or historical strategy performance are provided for illustrative purposes only and do not constitute a guarantee or promise of future results. Investment returns are inherently variable and uncertain. ECMarket Pro strongly advises clients not to invest funds they cannot afford to lose.
            </Section>

            <Section title="11. Seek Independent Advice">
              Before making any investment decision, you should seek independent financial, legal, and tax advice appropriate to your individual circumstances. ECMarket Pro does not provide personalised investment advice and the content on this Platform should not be construed as such.
            </Section>

            <Section title="12. Contact and Complaints">
              If you have any concerns or questions regarding risk or your account, please contact our support team at{' '}
              <a href="mailto:support@cnxmarkets.com" className="text-[#1F77B4] hover:underline">
                support@cnxmarkets.com
              </a>
              . We are committed to transparent communication and client protection.
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
