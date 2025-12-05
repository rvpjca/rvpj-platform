import Link from "next/link";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "CBDT extends due date for select filings | Knowledge Bank",
  description:
    "Summary of CBDT circular extending due dates for tax audit reports and return filings, along with action items for businesses.",
};

export default function CbdtExtendsDueDatePage() {
  return (
    <article className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Knowledge Bank · Bulletin</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            CBDT extends due date for select audits and return filings
          </h1>
          <p className="text-base text-muted-foreground md:w-2/3">
            The Central Board of Direct Taxes (CBDT) has issued a circular extending the due dates for tax audit reports
            (Form 3CA/3CB-3CD) and income-tax return filings for specified categories, easing immediate compliance
            pressure on businesses and professionals.
          </p>
          <Button asChild>
            <Link href="/downloads">Download the latest compliance calendar</Link>
          </Button>
        </div>
      </section>

      <section className="container space-y-10 py-12">
        <div className="space-y-4 text-muted-foreground">
          <h2 className="text-2xl font-semibold text-slate-900">Key highlights from the circular</h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>• Tax audit report (Form 3CD) due date extended to 31 October 2024.</li>
            <li>
              • Income-tax return filings for assessees subject to audit now due on or before 30 November 2024 (AY
              2024-25).
            </li>
            <li>• Partner returns aligned with the firm’s extended timeline.</li>
            <li>• No change for non-audit assessees; due date remains 31 July 2024.</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">Action items for your team</h3>
          <ol className="mt-4 space-y-2">
            <li>1. Refresh audit workplan and sampling to leverage the additional time.</li>
            <li>2. Coordinate with tax teams to update Form 3CD annexures and reconciliations.</li>
            <li>3. Communicate revised timelines to promoters, bankers, and overseas associates.</li>
            <li>4. Keep proof of hardship (if applicable) for documentation with the return.</li>
          </ol>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Need assistance?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            R V P J & Co. can help you realign project plans, tax computations, and board reporting to reflect this
            extension. Reach out to your engagement partner or use our contact form.
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/contact">Contact our team</Link>
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



