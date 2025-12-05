import Link from "next/link";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "GST circulars FY24 roundup | Knowledge Bank",
  description:
    "Snapshot of key GST circulars for FY 2023-24 covering ITC, e-invoicing, and registration norms, with action points for finance teams.",
};

export default function GstCircularsFy24Page() {
  return (
    <article className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Knowledge Bank · Bulletin</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">GST circulars FY24 – what changed?</h1>
          <p className="text-base text-muted-foreground md:w-2/3">
            GST Council notifications and CBIC circulars issued through FY 2023-24 sharpened the compliance focus on
            input tax credit (ITC) hygiene, e-invoicing coverage, and registration validation. Here is a cheat sheet for
            CFOs and controllers.
          </p>
          <Button asChild variant="outline">
            <Link href="/downloads">Download GST compliance calendar</Link>
          </Button>
        </div>
      </section>

      <section className="container space-y-10 py-12">
        <div className="space-y-4 text-muted-foreground">
          <h2 className="text-2xl font-semibold text-slate-900">Highlights</h2>
          <ul className="space-y-2 text-base leading-relaxed">
            <li>• Mandatory e-invoicing threshold reduced to ₹5 crore from 1 August 2023.</li>
            <li>• ITC restriction tightened via Rule 36(4); reconciliation must rely on GSTR-2B only.</li>
            <li>• Aadhaar authentication made compulsory for new registrations and certain amendments.</li>
            <li>• Clarifications on place of supply for online gaming and secondment arrangements.</li>
            <li>• Amnesty window for pending GSTR-4, GSTR-9, and CMP-08 filings with reduced late fees.</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">Immediate actions</h3>
          <ol className="mt-4 space-y-2">
            <li>1. Update ERP logic for e-invoicing turnover checks and QR code generation.</li>
            <li>2. Reconcile purchase registers with GSTR-2B monthly; document vendor follow-ups.</li>
            <li>3. Validate registration data for corporate branches and warehouses via Aadhaar KYC.</li>
            <li>4. Review contracts for cross-charge and place-of-supply implications.</li>
          </ol>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Need a walkthrough?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Our indirect tax team conducts rapid GST health checks and sets up automation for ITC tracking, e-invoicing,
            and reconciliations. Engage us for a workshop or ongoing managed compliance.
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/contact">Book a GST session</Link>
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



