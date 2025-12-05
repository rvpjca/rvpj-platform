import Link from "next/link";
import { FileDown, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const downloadItems = [
  {
    title: "Audit engagement checklist",
    description: "Information and documents required before starting an audit engagement.",
    fileName: "audit-engagement-checklist.pdf",
  },
  {
    title: "Direct tax client onboarding",
    description: "Checklist for income tax returns, assessments, and notices.",
    fileName: "direct-tax-onboarding.pdf",
  },
  {
    title: "GST compliance calendar",
    description: "Key GST due dates and compliance reminders for FY 2024-25.",
    fileName: "gst-compliance-calendar.pdf",
  },
];

export const metadata = {
  title: "Downloads & Checklists",
  description: "Access audit, tax, and compliance checklists shared by R V P J & Co.",
};

export default function DownloadsPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-5 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Downloads</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Checklists & Reference Guides</h1>
          <p className="text-base text-muted-foreground md:w-2/3">
            Use these checklists to prepare your audit files, tax submissions, and compliance documents. More resources
            will be added as the admin portal comes online.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/contact">Need a custom checklist? Contact us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/services">Explore services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {downloadItems.map((item) => (
            <Card key={item.fileName} className="border-muted bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{item.description}</p>
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link href={`/files/${item.fileName}`} target="_blank" rel="noreferrer">
                    <FileDown size={16} />
                    Download
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-primary" />
            <p className="font-semibold text-foreground">Disclosure</p>
          </div>
          <p className="mt-2">
            These checklists are templates and may need to be customized based on your engagement and regulatory
            requirements. The upcoming admin console will let you download firm-specific resources generated via the CMS.
          </p>
        </div>
      </section>
    </div>
  );
}



