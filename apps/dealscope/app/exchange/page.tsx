import Link from "next/link";
export default function Exchange() {
  return <main className="wrap"><nav><Link href="/">← DealScope</Link></nav>
    <div className="eyebrow">Controlled Commercial Exchange</div>
    <h1>Buyer workspaces are access controlled.</h1>
    <p className="lead">The Exchange is a DealScope service. Each verified buyer accesses only explicitly disclosed opportunities within its authorised workspace. No outside counterparty has automatic access to another customer's confidential transactions.</p>
    <div className="panel"><h2>Activation gate</h2><p>Identity verification, paid entitlements, tenant isolation, disclosure consent, audit trails and settlement controls must be tested before this area accepts live transactions.</p><strong className="neutral">Not accepting live transactions</strong></div><p><Link href="/legal">Legal information</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/payments">Payments and refunds</Link></p>
  </main>;
}
