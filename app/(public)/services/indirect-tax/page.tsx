import { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Indirect Tax / GST",
  description: "GST advisory, audits, and automation by R V P J & Co.",
};

export default function IndirectTaxPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Indirect Tax</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            GST compliance, health checks, refunds, and strategic advisory.
          </h1>
          <p className="text-lg text-muted-foreground">
            We help manufacturing, trading, logistics, and service-oriented clients stay ahead of evolving GST regulations while
            unlocking cash flow through optimized credit and timely refunds.
          </p>
        </div>
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compliance & automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Registration, classification, and documentation support</li>
              <li>• Return filing dashboards and e-invoice integrations</li>
              <li>• ITC reconciliation, vendor follow-ups, and SOPs</li>
              <li>• GST training for finance and procurement teams</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit & litigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• GST health checks and departmental audit support</li>
              <li>• Refunds for exports, inverted duty, and SEZ projects</li>
              <li>• Drafting replies to SCNs, appeals, and representation</li>
              <li>• Specialized solutions for EPCG, job work, and logistics</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}



