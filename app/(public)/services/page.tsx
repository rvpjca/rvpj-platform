import { ArrowRight, Briefcase, ClipboardList, FileSignature, LineChart, PiggyBank, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const serviceCategories = [
  {
    icon: ShieldCheck,
    title: "Audit & Assurance",
    summary:
      "Comprehensive statutory, tax, internal, and due diligence audits with technology-enabled workpapers and partner-led reviews.",
    bullets: [
      "Statutory & tax audits",
      "Internal audits & IFC reviews",
      "Bank, subsidy & special audits",
      "SOP design & risk assessments",
    ],
  },
  {
    icon: ClipboardList,
    title: "Direct Tax Consultancy",
    summary:
      "Holistic income tax planning, assessments, litigation support, and transaction advisory for promoters and corporates.",
    bullets: [
      "Tax planning & opinions",
      "Assessment representation",
      "TDS health checks & certification",
      "International taxation guidance",
    ],
  },
  {
    icon: FileSignature,
    title: "Indirect Tax / GST",
    summary:
      "End-to-end GST registration, compliance, audits, and strategic advisory for manufacturing, trade, and service sectors.",
    bullets: [
      "GST health checks & reconciliations",
      "Refunds & custom solutions for EPCG/SEZ",
      "Litigation & appellate support",
      "E-invoicing & automation",
    ],
  },
  {
    icon: Briefcase,
    title: "Corporate Laws & Secretarial",
    summary:
      "Company law, FEMA, LLP, and secretarial support to keep entities compliant throughout their lifecycle.",
    bullets: [
      "Entity incorporation & structuring",
      "ROC filings & board advisory",
      "FEMA & ODI/FDI compliances",
      "Due diligence for M&A, buyouts",
    ],
  },
  {
    icon: LineChart,
    title: "Project Finance & Valuation",
    summary:
      "Financial modelling, CMA data, lender coordination, and equity/investor readiness for new and expansion projects.",
    bullets: [
      "CMA reports & DPR preparation",
      "Working capital & term loan syndication",
      "Subsidy advisory (state & central)",
      "Valuation & investment memos",
    ],
  },
  {
    icon: PiggyBank,
    title: "Management Consultancy",
    summary:
      "Virtual CFO services, MIS design, process automation, and business performance analytics for promoters and boards.",
    bullets: [
      "Budgeting & KPI dashboards",
      "Shared service center setup",
      "Internal controls modernization",
      "Talent structuring & HR compliance support",
    ],
  },
];

export const metadata = {
  title: "Services",
  description: "Overview of audit, tax, corporate law, finance, and advisory services by R V P J & Co.",
};

export default function ServicesPage() {
  return (
    <div className="space-y-16 bg-white">
      <section className="border-b bg-gradient-to-b from-slate-50 to-white">
        <div className="container grid gap-6 py-16 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5 animate-in fade-in slide-in-from-left-6">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Our services</p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Full-spectrum audit, tax, corporate compliance, and advisory support for growing businesses.
            </h1>
            <p className="text-base text-muted-foreground">
              Each engagement is driven by a partner and supported by domain specialists, analysts, and article assistants
              who collaborate through digital workpapers, compliance trackers, and secure document exchange.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href="/contact">
                  Discuss your requirement <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/downloads">Download checklists</Link>
              </Button>
            </div>
          </div>

          <Card className="border-primary/20 bg-white/90 shadow-lg shadow-primary/5 backdrop-blur animate-in fade-in slide-in-from-right-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Briefcase size={18} />
                Why teams prefer us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Partner-level attention on every file, supported by structured review trails, ensures recommendations you
                can trust when facing regulators, lenders, and investors.
              </p>
              <p>
                We integrate compliance calendars, digital trackers, and secure data rooms so promoters, CFOs, and
                articles can collaborate without friction.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container space-y-8 py-10">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Capabilities</p>
          <h2 className="text-2xl font-semibold text-slate-900">What we deliver</h2>
          <p className="text-muted-foreground">
            From routine compliances to high-stakes advisory, every module is backed by playbooks, review checklists, and
            cross-functional expertise.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {serviceCategories.map((service) => (
            <Card key={service.title} className="h-full border-muted shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <service.icon size={20} />
                </div>
                <div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">{service.summary}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-slate-50 py-14">
        <div className="container grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Engagement model</p>
            <h3 className="text-2xl font-semibold text-slate-900">How we work with promoters & CFOs</h3>
            <p className="text-muted-foreground">
              We follow a structured onboarding process—kickoff, data room setup, workplan finalization, weekly touchpoints,
              and partner sign-off. Sensitive artefacts remain encrypted, and timelines are tracked through shared dashboards.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Dedicated engagement manager for quick escalations</li>
              <li>✓ Secure cloud data room for workpapers & approvals</li>
              <li>✓ Periodic MIS and variance commentary for leadership</li>
              <li>✓ Benchmarked fee structures with transparent change controls</li>
            </ul>
          </div>
          <Card className="border-primary/10 bg-white shadow-md">
            <CardHeader>
              <CardTitle>Book a consultation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share your requirement and we will propose a fit-for-purpose engagement model within 2 business days.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full gap-2">
                <Link href="/contact">
                  Share requirement <ArrowRight size={16} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}



