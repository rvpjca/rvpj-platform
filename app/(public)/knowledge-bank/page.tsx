import Link from "next/link";
import { ArrowUpRight, FileText, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const bulletins = [
  {
    title: "CBDT Circulars – August 2024",
    description: "Summary of recent direct tax circulars impacting SMEs and promoter holdings.",
    link: "/files/cbdt-circulars-aug-2024.pdf",
  },
  {
    title: "GST Update – ITC reconciliation playbook",
    description: "Approach for matching GSTR-2B with books before filing returns.",
    link: "/files/gst-itc-playbook.pdf",
  },
  {
    title: "RBI/FEMA watch",
    description: "Quarterly note on overseas investments, ECB, and ODI reporting.",
    link: "/files/rbi-fema-watch.pdf",
  },
];

const utilities = [
  {
    name: "FY 2024-25 Tax Calculator",
    description: "Compare old and new regime slabs with surcharge/cess.",
    link: "/calculators",
  },
  {
    name: "TDS/TCS Rates",
    description: "Download the latest TDS/TCS rate chart for quick reference.",
    link: "/files/tds-rate-chart.pdf",
  },
  {
    name: "ROC Compliance Calendar",
    description: "Important MCA filings and due dates for companies and LLPs.",
    link: "/files/roc-compliance-calendar.pdf",
  },
];

export const metadata = {
  title: "Knowledge Bank",
  description: "Bulletins, compliance notes, and utilities curated by R V P J & Co.",
};

export default function KnowledgeBankPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-5 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Knowledge Bank</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Compliance notes, bulletins, and ready-reference utilities.
          </h1>
          <p className="text-base text-muted-foreground md:w-2/3">
            Use this page to access the latest regulatory updates, checklists, and calculators curated by our audit and
            tax teams. The upcoming CMS will allow admins to push new content from the backend.
          </p>
          <Button asChild>
            <Link href="/contact">Request a custom note</Link>
          </Button>
        </div>
      </section>

      <section className="container py-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Bulletins</p>
            <h2 className="text-2xl font-semibold text-slate-900">Latest updates</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/downloads">View downloads</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {bulletins.map((item) => (
            <Card key={item.title} className="border-muted bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Library size={18} className="text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{item.description}</p>
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link href={item.link} target="_blank" rel="noreferrer">
                    Download note
                    <ArrowUpRight size={14} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-slate-50 py-14">
        <div className="container space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Utilities</p>
            <h2 className="text-2xl font-semibold text-slate-900">Tools & calendars</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {utilities.map((utility) => (
              <Card key={utility.name} className="border-muted bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText size={18} className="text-primary" />
                    {utility.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{utility.description}</p>
                  <Button asChild className="gap-2">
                    <Link href={utility.link}>
                      Open utility
                      <ArrowUpRight size={14} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}



