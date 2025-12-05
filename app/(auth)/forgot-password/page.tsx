import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthCard } from "@/components/forms/auth/auth-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request assistance for account recovery.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Need to reset your password?"
      description="For security reasons password resets are handled by the internal admin team."
    >
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Please email the system administrator from your registered address. Mention your full
          name, office location, and employee code (if applicable).
        </p>
        <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-muted-foreground">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Mail size={16} className="text-primary" />
            IT Support Desk
          </p>
          <p>support@rvpj.in</p>
          <p className="text-xs">You will receive a secure reset link once verified.</p>
        </div>
        <Button asChild className="w-full" variant="secondary">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </AuthCard>
  );
}

