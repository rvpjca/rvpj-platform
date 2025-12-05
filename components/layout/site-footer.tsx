import Link from "next/link";

import { publicNavLinks } from "@/lib/constants/navigation";

const offices = [
  {
    city: "Junagadh (Head Office)",
    address:
      "224, Platinum Arcade, Jayshree Cinema Road, Near Kalwa Chowk, Junagadh - 362001.",
    phone: "+91 9978781078",
  },
  {
    city: "Rajkot",
    address: "213, Runway Heights, Ayodhya Chowk, 150 Feet Ring Road, Rajkot - 360005.",
    phone: "+91 9978781078",
  },
  {
    city: "Porbandar",
    address: "104, City Plaza, Opp. Tazavala Bunglows, M G Road, Porbandar - 360575.",
    phone: "+91 9978781078",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-primary">R V P J & Co.</p>
          <p className="mt-3 text-sm text-muted-foreground">
            R V P J & Co. is a professionally managed Chartered Accountancy firm registered with the Institute of Chartered Accountants of India (ICAI). With offices in Junagadh (Head Office), Rajkot, and Porbandar, we serve a diverse clientele across Manufacturing, Banking, Real Estate, Service Sector, Charitable Trusts, and MSMEs. We are a team of young, dynamic, and committed professionals who uphold strong ethical values and maintain uncompromising quality in all our services.
          </p>
          <div className="mt-4">
            <p className="text-sm font-semibold text-foreground">Our Philosophy</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Quality services without compromise</li>
              <li>• Long-term client relationships</li>
              <li>• Transparent communication</li>
              <li>• Commitment to timelines</li>
              <li>• Continuous learning & technology-driven execution</li>
            </ul>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Quick Links
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {publicNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground transition hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/client-login"
                className="text-primary font-medium transition hover:underline"
              >
                Client Portal →
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Offices
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {offices.map((office) => (
              <div key={office.city} className="rounded-lg border bg-white p-4 text-sm">
                <p className="font-semibold text-foreground">{office.city}</p>
                <p className="mt-1 text-muted-foreground">{office.address}</p>
                <p className="mt-2 font-medium text-primary">{office.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t bg-white">
        <div className="container flex flex-col items-center justify-between gap-3 py-4 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} R V P J & Co. All rights reserved.</p>
          <p>Crafted with compliance & security in mind.</p>
        </div>
      </div>
    </footer>
  );
}

