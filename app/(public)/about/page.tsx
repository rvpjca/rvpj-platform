import { CheckCircle, Users, Award, Briefcase, Quote } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const partnerProfiles = [
  {
    name: "CA Renish R. Vithalani (FCA, DISA, M.Com)",
    role: "Founder Partner",
    focus: "Renish brings over 15 years of diverse experience in Accounting, Direct & Indirect Taxation, Auditing, Financial Advisory, Bank Consultancy, and Corporate Services. He has worked extensively with corporate and non-corporate clients, including serving as Dy. Manager – Taxation with a leading cement manufacturing company. He also provides consultancy to Cooperative Banks covering compliance with RBI, FIU, Income Tax, Service Tax, credit monitoring, loan appraisal, and internal policy drafting.",
    experience: "15+ years",
  },
  {
    name: "CA Paras Jogi (FCA, B.Com)",
    role: "Managing Partner",
    focus: "Paras specializes in Direct & Indirect Taxation, Internal & Statutory Audits, ERP/SAP Implementation, and Business Advisory Services. With rich experience in stock audits for major corporates like LG Electronics, Fiat Automobiles, Eureka Forbes, and Sun Pharma, he brings unmatched audit expertise.",
    experience: "13+ years",
  },
  {
    name: "CA Miraj Makhecha (FCA, BCA, CS)",
    role: "Partner",
    focus: "Miraj has extensive exposure to System Audits, Special Audits, Government Audits, Statutory Audits, and corporate filings. He also handles consultancy for export-oriented manufacturing units and compliance under Income Tax, GST, Company Law, and ROC.",
    experience: "10+ years",
  },
];

const milestones = [
  {
    title: "2010",
    detail:
      "Founded in Junagadh with a focus on statutory audits, Accounting, Direct & Indirect Taxation, Auditing, Financial Advisory, Bank Consultancy, and Corporate Services.",
  },
  {
    title: "2013",
    detail: "Rajkot branch launched to expand all our consulting services to Rajkot and nearby areas.",
  },
  {
    title: "2015",
    detail: "Porbandar office opened to expand all our consulting services to Porbandar and nearby areas.",
  },
  {
    title: "2021",
    detail: "Digital transformation initiative for client and staff portals.",
  },
];

const values = [
  "Integrity in every engagement",
  "Responsiveness & clarity",
  "Partner-led quality reviews",
  "Continuous learning & knowledge sharing",
  "Technology-first compliance monitoring",
  "Core Team: 3 Chartered Accountants",
  "Core Team: 4 Semi-qualified staff",
  "Core Team: 9 Articles & Audit Executives",
  "Core Team: 2 Accountants",
  "Core Team: 2 Office Coordinators",
];

export const metadata = {
  title: "About Us",
  description:
    "Learn about R V P J & Co. Chartered Accountants, our mission, leadership, and values.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container grid gap-6 py-14 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 animate-in fade-in slide-in-from-left-10 duration-700">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              About R V P J & Co.
            </p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Chartered Accountants trusted by promoters, boards, and growing teams in Gujarat.
            </h1>
            <p className="text-base text-muted-foreground">
              R V P J & Co. is a professionally managed Chartered Accountancy firm registered with the Institute of Chartered Accountants of India (ICAI). With offices in Junagadh (Head Office), Rajkot, and Porbandar, we serve a diverse clientele across Manufacturing, Banking, Real Estate, Service Sector, Charitable Trusts, and MSMEs.
            </p>
          </div>

          <Card className="border-primary/20 bg-white/90 shadow-md backdrop-blur animate-in fade-in slide-in-from-right-10 duration-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Award size={18} />
                Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Experience</p>
                <p className="font-semibold text-slate-900">15+ years of partner leadership</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Clients & sectors
                </p>
                <p className="text-muted-foreground">
                  Manufacturing, agri & food, ports, logistics, pharma, fintech, NGOs
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Services</p>
                <p className="text-muted-foreground">
                  Audit & assurance, direct & indirect tax, corporate laws, project finance, consulting
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="container grid gap-8 md:grid-cols-2">
          <Card className="h-full shadow-sm animate-in fade-in slide-in-from-left-8 duration-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Quote size={18} />
                Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To provide a one-stop platform for comprehensive financial, tax, and advisory services—contributing to client growth and national development.
              </p>
              <div>
                <p className="font-semibold text-primary mb-2">Core Strengths</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Multi-location presence</li>
                  <li>Experienced leadership team</li>
                  <li>Strong team of qualified & semi-qualified professionals</li>
                  <li>Domain expertise across taxation, audits, finance & consultancy</li>
                  <li>Proven track record with major corporates & public sector institutions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full shadow-sm animate-in fade-in slide-in-from-right-8 duration-600 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users size={18} />
                Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                To become the preferred advisor for mid-sized enterprises and ambitious promoters in Western
                India by blending domain expertise, technology-enabled delivery, and a people-first culture.
              </p>
              <p>
                Our goal is to nurture future-ready chartered accountants, article assistants, and finance
                professionals through structured learning and mentorship.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b bg-slate-50 py-16">
        <div className="container space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Leadership Team
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">Partners spearheading delivery</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {partnerProfiles.map((partner, index) => (
              <Card
                key={partner.name}
                className="h-full border-muted shadow-sm animate-in fade-in slide-in-from-bottom-6"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">{partner.name}</CardTitle>
                  <p className="text-sm text-primary">{partner.role}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{partner.focus}</p>
                  <p className="font-medium text-foreground">Experience: {partner.experience}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="shadow-sm animate-in fade-in slide-in-from-left-8 duration-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Briefcase size={18} />
                Culture & Talent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Our team of CAs, company secretaries, and analysts balances fieldwork with continuous learning.
                Each engagement is run through digital workpapers, review trails, and secure document exchange.
              </p>
              <ul className="space-y-2">
                {values.map((value) => (
                  <li key={value} className="flex items-center gap-2 text-foreground">
                    <CheckCircle size={16} className="text-primary" />
                    {value}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm animate-in fade-in slide-in-from-right-8 duration-600 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users size={18} />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((item) => (
                <div key={item.title} className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

