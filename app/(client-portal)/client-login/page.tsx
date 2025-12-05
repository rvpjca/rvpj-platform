"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Building2, CreditCard, Calendar, ArrowLeft, User, Mail, Phone, CheckCircle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerClient } from "../client-portal/auth-actions";

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Login with PAN and Birth Date
  const [loginData, setLoginData] = useState({
    panNumber: "",
    birthDate: "",
  });
  
  // Register with all details
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    panNumber: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const result = await signIn("client-login", {
        panNumber: loginData.panNumber.toUpperCase(),
        birthDate: loginData.birthDate,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Invalid PAN number or birth date");
      } else {
        router.push("/client-portal");
        router.refresh();
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    if (registerData.password !== registerData.confirmPassword) {
      setFormError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerClient({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone || undefined,
        panNumber: registerData.panNumber,
        birthDate: registerData.birthDate,
        password: registerData.password,
      });

      if (result.error) {
        setFormError(result.error);
      } else {
        setSuccessMessage("Account created! Login with your PAN and birth date.");
        setActiveTab("login");
        setLoginData({ 
          panNumber: registerData.panNumber.toUpperCase(), 
          birthDate: registerData.birthDate 
        });
        setRegisterData({ 
          name: "", email: "", phone: "", panNumber: "", 
          birthDate: "", password: "", confirmPassword: "" 
        });
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format PAN input (uppercase, max 10 chars)
  const handlePanChange = (value: string, isLogin: boolean) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    if (isLogin) {
      setLoginData({ ...loginData, panNumber: formatted });
    } else {
      setRegisterData({ ...registerData, panNumber: formatted });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft size={16} />
          Back to Website
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Client Portal</CardTitle>
            <CardDescription>
              Access your documents and connect with R V P J & Co.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex mb-6 border-b">
              <button
                onClick={() => { setActiveTab("login"); setFormError(null); }}
                className={`flex-1 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                  activeTab === "login"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab("register"); setFormError(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                  activeTab === "register"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>

            {error === "not_client" && (
              <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                This portal is only for clients. Staff members please use the admin panel.
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}
            
            {formError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            {activeTab === "login" ? (
              /* LOGIN FORM - PAN + Birth Date */
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-pan">PAN Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-pan"
                      type="text"
                      placeholder="ABCDE1234F"
                      value={loginData.panNumber}
                      onChange={(e) => handlePanChange(e.target.value, true)}
                      className="pl-10 uppercase"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter your 10-digit PAN number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-dob">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-dob"
                      type="date"
                      value={loginData.birthDate}
                      onChange={(e) => setLoginData({ ...loginData, birthDate: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In to Portal"
                  )}
                </Button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="As per PAN card"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="register-pan">PAN Number *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-pan"
                        type="text"
                        placeholder="ABCDE1234F"
                        value={registerData.panNumber}
                        onChange={(e) => handlePanChange(e.target.value, false)}
                        className="pl-10 uppercase"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-dob">Birth Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-dob"
                        type="date"
                        value={registerData.birthDate}
                        onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="9876543210"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Min 6 chars"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Confirm"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Password is for account recovery only. You&apos;ll login using PAN + Birth Date.
                </p>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-4 pt-4 border-t text-center">
              <Link 
                href="/login"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Staff/Admin Login →
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} R V P J & Co. Chartered Accountants
        </p>
      </div>
    </div>
  );
}



