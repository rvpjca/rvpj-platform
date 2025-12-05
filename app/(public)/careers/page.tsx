import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CareerApplicationForm } from "@/components/forms/career-application-form";

const benefits = [
  {
    icon: GraduationCap,
    title: "Continuous learning",
    description: "Weekly knowledge sessions, mock assessments, and partner-led reviews.",
  },
  {
    icon: Briefcase,
    title: "Diverse assignments",
    description: "Audits, tax, compliance, process improvement, and consulting engagements.",
  },
  {
    icon: Trophy,
    title: "Growth mindset",
    description: "Fast-track opportunities for performers with mentorship from partners.",
  },
];

export const metadata = {
  title: "Careers",
  description: "Join R V P J & Co. — submit your CV and explore opportunities in audit, tax, and advisory.",
};

export default function CareersPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-b from-slate-50 to-white">
        <div className="container grid gap-8 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Careers at R V P J & Co.</p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Build your CA journey with real impact and partner-led mentorship.
            </h1>
            <p className="text-base text-muted-foreground">
              We hire articles, associates, and experienced professionals who want to learn, solve complex
              problems, and support businesses across Gujarat. Share your CV—we review every application carefully.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="#apply" className="flex items-center gap-2">
                  Apply now <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Talk to HR</Link>
              </Button>
            </div>
          </div>

          <Card className="border-primary/10 bg-white shadow-md">
            <CardHeader>
              <CardTitle>What we look for</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Curiosity to learn and apply audit/tax fundamentals</p>
              <p>• Ability to communicate with clients confidently</p>
              <p>• Integrity and respect for deadlines</p>
              <p>• Comfort with cloud tools, workpapers, and documentation</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-14" id="apply">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Submit your CV</p>
          <h2 className="text-2xl font-semibold text-slate-900">Apply for current or upcoming openings</h2>
          <p className="text-muted-foreground">Attach your resume and we will connect when a matching opportunity arises.</p>
        </div>
        <CareerApplicationForm />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Having trouble? Email your resume directly to{" "}
          <Link href="mailto:careers@rvpj.in" className="text-primary underline">
            careers@rvpj.in
          </Link>
        </p>
      </section>

      <section className="border-t bg-slate-50 py-14">
        <div className="container space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why work with us</p>
            <h2 className="text-2xl font-semibold text-slate-900">Life at R V P J & Co.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-muted bg-white shadow-sm">
                <CardHeader className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <benefit.icon size={20} />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{benefit.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}



