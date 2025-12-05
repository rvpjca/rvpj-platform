import type { Metadata } from "next";

import { AuthCard } from "@/components/forms/auth/auth-card";
import { LoginForm } from "@/components/forms/auth/login-form";

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Secure access for R V P J & Co. team members.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Use your firm-managed credentials to access the admin portal."
    >
      <LoginForm />
    </AuthCard>
  );
}

