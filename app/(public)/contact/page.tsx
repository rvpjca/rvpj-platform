import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";

const offices = [
  {
    city: "Junagadh (Head Office)",
    address: "224, Platinum Arcade, Jayshree Cinema Road, Near Kalwa Chowk, Junagadh - 362001.",
    phone: "+91 99982 12345",
  },
  {
    city: "Rajkot",
    address: "213, Runway Heights, Ayodhya Chowk, 150 Feet Ring Road, Rajkot - 360005.",
    phone: "+91 98242 67890",
  },
  {
    city: "Porbandar",
    address: "104, City Plaza, Opp. Tazavala Bunglows, M G Road, Porbandar - 360575.",
    phone: "+91 97233 11122",
  },
];

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with R V P J & Co. across Junagadh, Rajkot, and Porbandar offices.",
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contact us</p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Let's discuss your audit, tax, or advisory requirement.
            </h1>
            <p className="text-base text-muted-foreground">
              Email us, call our partner desk, or drop a note using the contact form. We typically respond within
              one business day.
            </p>
            <div className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Mail className="text-primary" size={20} />
                <Link href="mailto:hello@rvpj.in" className="text-lg font-semibold text-primary hover:underline">
                  hello@rvpj.in
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-primary" size={20} />
                <Link href="tel:+919978781078" className="text-lg font-semibold text-primary hover:underline">
                  +91 99787 81078
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="text-primary" size={20} />
                <span className="text-sm text-muted-foreground">Offices across Junagadh, Rajkot, and Porbandar</span>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/careers">Looking to join us? Visit Careers</Link>
            </Button>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Our offices</p>
          <h2 className="text-2xl font-semibold text-slate-900">Meet us in person</h2>
          <p className="text-muted-foreground">Choose the office closest to you for walkthroughs and presentations.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {offices.map((office) => (
            <Card key={office.city} className="border-muted bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{office.city}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-primary" />
                  <p>{office.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-primary" />
                  <Link href={`tel:${office.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                    {office.phone}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}



