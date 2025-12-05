import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white/80 py-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-primary">
            R V P J & Co.
          </Link>
          <p className="text-sm text-muted-foreground">Secure Staff Access</p>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

