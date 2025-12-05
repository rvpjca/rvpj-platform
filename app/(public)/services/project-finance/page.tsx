import { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Project Finance",
  description:
    "Financial modelling, lender coordination, and subsidy advisory for infrastructure and industrial projects.",
};

export default function ProjectFinancePage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Project Finance</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Structuring capital, subsidies, and compliance for capex-heavy projects.
          </h1>
          <p className="text-lg text-muted-foreground">
            We help promoters, NBFC-backed ventures, and infrastructure SPVs move from feasibility to financial closure
            by aligning lenders, subsidies, and regulatory deliverables on one track.
          </p>
        </div>
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What we cover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Financial model build-outs with sensitivity testing</li>
              <li>• CMA data, projections, and lender pitch decks</li>
              <li>• Term sheet reviews, covenant mapping, and drawdown schedules</li>
              <li>• Subsidy eligibility analysis and documentation packs</li>
              <li>• Post-sanction compliance, utilization tracking, and reporting</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Dedicated SPOC coordinating with banks, NBFCs, and agencies</li>
              <li>• Data room with versioned financial models and approvals</li>
              <li>• Compliance checklist mapped to sanction conditions</li>
              <li>• Weekly trackers on disbursement status and milestones</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}



