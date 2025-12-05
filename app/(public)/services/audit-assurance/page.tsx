import { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Audit & Assurance",
  description:
    "Risk-based statutory, tax, internal, and due diligence audits delivered by R V P J & Co.",
};

export default function AuditAssurancePage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Audit & Assurance</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Partner-led audits powered by digital workpapers and sector insights.
          </h1>
          <p className="text-lg text-muted-foreground">
            We combine pragmatic risk assessments, walkthroughs, and analytics to ensure that financial statements,
            internal controls, and regulatory submissions stand up to scrutiny from investors, lenders, and regulators.
          </p>
        </div>
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What we cover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Statutory, tax, and consolidation audits</li>
              <li>• Internal audits, IFC, and SOP reviews</li>
              <li>• Bank, subsidy, and special purpose certifications</li>
              <li>• Pre-investment and due diligence support</li>
              <li>• Stock audits</li>
            </ul>
            <p>
              Our audit processes are designed to enhance operational efficiency, identify risks, strengthen controls, and support stakeholders in decision-making.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Centralized data room for sampling & queries</li>
              <li>• Weekly MIS on open points and timelines</li>
              <li>• Review notes mapped to working paper references</li>
              <li>• Forward-looking recommendations for promoters</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


