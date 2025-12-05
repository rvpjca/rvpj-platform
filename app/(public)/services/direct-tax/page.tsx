import { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Direct Tax Consultancy",
  description: "Income tax planning, compliance, and litigation support by R V P J & Co.",
};

export default function DirectTaxPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Direct Tax</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Strategic tax planning and representation for promoters, corporates, and trusts.
          </h1>
          <p className="text-lg text-muted-foreground">
            We provide end-to-end direct tax support—opinions, assessments, litigation, and transaction structuring—while
            keeping promoters informed about implications on cash flows and governance.
          </p>
        </div>
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Advisory & compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Tax opinions, health checks, and TDS reviews</li>
              <li>• Transfer pricing coordination with specialists</li>
              <li>• Certification support for bids, subsidies, and banks</li>
              <li>• Estate, trust, and family office advisory</li>
              <li>• Filing of Income Tax Returns and TDS Returns</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessments & litigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Drafting submissions and attending hearings</li>
              <li>• Appeal memo preparation and tribunal coordination</li>
              <li>• Faceless assessment and penalty representation</li>
              <li>• Resolution of legacy issues and compounding</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


