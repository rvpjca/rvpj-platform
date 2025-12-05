import type { Metadata } from "next";

import { AuthCard } from "@/components/forms/auth/auth-card";
import { RegisterForm } from "@/components/forms/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Request access to the staff and client collaboration portal.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Accounts are approved by the admin/partner team before activation."
    >
      <RegisterForm />
    </AuthCard>
  );
}

