import Link from "next/link";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "RBI issues NBFC governance framework | Knowledge Bank",
  description:
    "Key directives from the RBI circular on NBFC governance covering board composition, CRAR monitoring, and risk frameworks.",
};

export default function RbiNbfcGovernancePage() {
  return (
    <article className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-14">
          <p className="text-sm psik	font-semibold uppercase tracking-wide text-primary">Knowledge Bank · Bulletin</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            RBI issues governance framework for NBFC-ML and NBFC-UL
          </h1>
          <p className="text-base text-muted-foreground md:w-2/3">
            The Reserve Bank of India has tightened governance requirements for upper and middle layer NBFCs, with a
            sharp focus on board oversight, risk appetite, capital adequacy and control functions.
          </p>
          <Button asChild>
            <Link href="/downloads">Download NBFC governance checklist</Link>
          </Button>
        </div>
      </section>

      <section className="container space-y-10 py-12">
        <div className="space-y-4 text-muted-foreground">
          <h2 className="text-2xl font-semibold text-slate-900">Key directives</h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>• Minimum 50% independent directors on the board of NBFC-UL; 1/3rd for NBFC-ML.</li>
            <li>• Mandatory board-level committees for risk management, audit, and remuneration.</li>
            <li>• Risk Appetite Framework (RAF) and Internal Capital Adequacy Assessment Process (ICAAP) to be updated
              annually.</li>
            <li>• Chief Compliance Officer, Chief Risk Officer, and Chief Audit Executive to be independent of business
              lines.</li>
            <li>• Enhanced disclosures on concentration risk, stressed assets, and governance structures.</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">Action plan for NBFCs</h3>
          <ol className="mt-4 space-y-2">
            <li>1. Conduct a board composition gap study and initiate director appointments.</li>
            <li>2. Refresh charters for the risk, audit, and remuneration committees.</li>
            <li>3. Update the RAF/ICAAP pack with stress testing and early-warning indicators.</li>
            <li>4. Validate independence criteria for CCO/CRO/CAE and align reporting lines.</li>
            <li>5. Revamp quarterly disclosures to include new governance metrics.</li>
          </ol>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Need board-room support?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            R V P J & Co. helps NBFCs set up governance frameworks, test risk models, and prepare for RBI supervisory
            reviews. Engage us for programme management, policy drafting, or independent assurance.
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/contact">Talk to our NBFC desk</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/knowledge-bank">Back to knowledge bank</Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}



