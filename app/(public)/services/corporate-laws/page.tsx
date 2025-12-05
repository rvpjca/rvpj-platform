import { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Corporate Laws & Secretarial",
  description: "Company law, FEMA, and secretarial support by R V P J & Co.",
};

export default function CorporateLawsPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Corporate Compliance</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Governance, ROC filings, FEMA advisory, and board-level support.
          </h1>
          <p className="text-lg text-muted-foreground">
            We act as compliance partners through entity setup, routine filings, board documentation, and event-driven
            transactions so that promoters can focus on growth with confidence.
          </p>
        </div>
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Secretarial services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Incorporation, conversions, and shift of registered office</li>
              <li>• Board/AGM support, minutes, and registers</li>
              <li>• Annual filings and event-based ROC submissions</li>
              <li>• LLP compliances and partnership restructuring</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FEMA & transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• ODI/FDI reporting and compliance health checks</li>
              <li>• Share transfers, ESOPs, and fundraise documentation</li>
              <li>• Due diligence for mergers, buyouts, and slump sales</li>
              <li>• Compliance playbooks for PE/VC-backed entities</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}



