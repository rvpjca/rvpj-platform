import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/app-providers";
import { TargetCursor } from "@/components/ui/target-cursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rvpj.in"),
  title: {
    default: "R V P J & Co. | Chartered Accountants",
    template: "%s | R V P J & Co.",
  },
  description:
    "R V P J & Co. is a professionally managed Chartered Accountancy firm registered with ICAI, operating from Junagadh (Head Office), Rajkot, and Porbandar. We serve manufacturing, banking, real estate, services, charitable trusts, and MSMEs with a young, dynamic team that upholds strong ethics and uncompromising quality. Our philosophy: quality services without compromise, long-term client relationships, transparent communication, commitment to timelines, and continuous learning with technology-driven execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-base antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <AppProviders>
          {children}
          <TargetCursor />
        </AppProviders>
      </body>
    </html>
  );
}
