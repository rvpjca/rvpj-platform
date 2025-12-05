import Link from "next/link";
import { ArrowRight, Building2, Files, Notebook, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingDialog } from "@/components/forms/booking-dialog";

const services = [
  {
    title: "Audit & Assurance",
    description: "Risk-based statutory, tax, internal, and special purpose audits.",
    href: "/services/audit-assurance",
  },
  {
    title: "Direct Tax",
    description: "Strategic tax planning, assessments, litigation support, and compliance.",
    href: "/services/direct-tax",
  },
  {
    title: "Indirect Tax / GST",
    description: "GST registrations, advisory, health checks, and audit representation.",
    href: "/services/indirect-tax",
  },
  {
    title: "Corporate Laws",
    description: "Company secretarial support, FEMA matters, and transaction advisory.",
    href: "/services/corporate-laws",
  },
  {
    title: "Project Finance",
    description: "Financial modelling, lender coordination, and subsidy advisory.",
    href: "/services/project-finance",
  },
  {
    title: "Management Consultancy",
    description: "Process improvement, MIS design, and virtual CFO services.",
    href: "/services/management-consultancy",
  },
];

const updates = [
  {
    title: "CBDT extends due date for Form 3CD reporting",
    tag: "Direct Tax",
    link: "/knowledge-bank/bulletins/cbdt-extends-due-date",
  },
  {
    title: "Important GST circulars for FY 2024-25",
    tag: "GST",
    link: "/knowledge-bank/bulletins/gst-circulars-fy24",
  },
  {
    title: "RBI Master Direction on NBFC governance",
    tag: "Regulatory",
    link: "/knowledge-bank/bulletins/rbi-nbfc-governance",
  },
];

const quickLinks = [
  { label: "Knowledge Bank", href: "/knowledge-bank" },
  { label: "Financial Calculators", href: "/calculators" },
  { label: "Downloads & Forms", href: "/downloads" },
  { label: "Careers @ RVPJ", href: "/careers" },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container grid gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Chartered Accountants • Since 2010
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl lg:text-5xl">
              Trusted advisors for Audit, Tax, and Corporate Governance across India.
            </h1>
            <p className="text-lg text-muted-foreground">
              R V P J & Co., Chartered Accountants, is a multi-disciplinary professional services firm with head office at Junagadh and branch offices at Rajkot and Porbandar. For more than a decade, we have been empowering businesses, entrepreneurs, corporates, NPOs, and financial institutions with accurate accounting insights, robust audit mechanisms, and forward-looking advisory solutions.
            </p>

            <div className="flex flex-wrap gap-3">
              <BookingDialog />
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">View all services</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="p-0">
                  <CardTitle className="text-3xl font-bold text-primary">30+</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-muted-foreground">
                  Years of combined partner experience
                </CardContent>
              </Card>
              <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="p-0">
                  <CardTitle className="text-3xl font-bold text-primary">3</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-muted-foreground">
                  Offices across Junagadh, Rajkot, and Porbandar
                </CardContent>
              </Card>
              <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="p-0">
                  <CardTitle className="text-3xl font-bold text-primary">12+</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-muted-foreground">
                  Service lines covering Audit, Tax, Advisory, and Finance
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-primary/10 bg-white/80 shadow-lg shadow-primary/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 size={20} className="text-primary" />
                Office Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Junagadh HQ</p>
                <p className="font-medium text-foreground">
                  224, Platinum Arcade, Jayshree Cinema Road, Near Kalwa Chowk, Junagadh - 362001.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Rajkot</p>
                <p className="font-medium text-foreground">
                  213, Runway Heights, Ayodhya Chowk, 150 Feet Ring Road, Rajkot - 360005.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Porbandar</p>
                <p className="font-medium text-foreground">
                  104, City Plaza, Opp. Tazavala Bunglows, M G Road, Porbandar - 360575.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">Need guidance?</p>
                <p className="text-muted-foreground">Connect with our partner desk.</p>
                <Button className="mt-3 w-full gap-1" asChild variant="secondary">
                  <Link href="tel:+919998212345">
                    <PhoneCall size={16} />
                    +91 9978781078
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Core Capabilities
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">What we deliver</h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/services" className="flex items-center gap-2 text-sm">
                Explore services <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="h-full border-muted shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>{service.description}</p>
                  <Button
                    asChild
                    variant="outline"
                    className="inline-flex items-center gap-2"
                  >
                    <Link
                      href={`https://wa.me/919978781078?text=${encodeURIComponent(
                        `Hello R V P J & Co., I would like to enquire about ${service.title}.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enquire now <ArrowRight size={14} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  What&apos;s New
                </p>
                <CardTitle>Knowledge Bank Highlights</CardTitle>
              </div>
              <Notebook className="text-primary" size={20} />
            </CardHeader>
            <CardContent className="space-y-5">
              {updates.map((item) => (
                <div key={item.title} className="rounded-lg border bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.tag}
                  </p>
                  <Link href={item.link} className="text-base font-semibold text-foreground">
                    {item.title}
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <p className="text-sm text-muted-foreground">
                Frequently accessed tools for clients, teams, and partners.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {link.label}
                  <ArrowRight size={14} />
                </Link>
              ))}
              <div className="mt-6 rounded-lg border bg-white/60 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Files size={16} className="text-primary" /> Looking for checklists?
                </p>
                <p className="mt-1 text-muted-foreground">
                  Head to Downloads for income-tax, GST, and ROC ready references.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

