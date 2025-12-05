import { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Management Consultancy",
  description: "Process improvement, MIS design, and virtual CFO advisory for growth-focused promoters.",
};

export default function ManagementConsultancyPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Management Consultancy</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Bringing clarity to numbers, processes, and board-level decisions.
          </h1>
          <p className="text-lg text-muted-foreground">
            Our consultants embed with CXOs to streamline processes, design actionable MIS, and drive profitability
            through productivity, pricing, and working capital interventions.
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
              <li>• Diagnostics on supply chain, production, and finance processes</li>
              <li>• SOP and internal control redesign mapped to ERP checkpoints</li>
              <li>• Board-ready MIS frameworks with KPI and cash flow views</li>
              <li>• Costing, pricing, and margin improvement programs</li>
              <li>• Virtual CFO support for budgeting and investor reporting</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Joint workshops with business heads to prioritize initiatives</li>
              <li>• Data room capturing before-after KPIs and SOP approvals</li>
              <li>• Weekly PMO dashboards for promoter visibility</li>
              <li>• Change management playbooks for adoption and training</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}



