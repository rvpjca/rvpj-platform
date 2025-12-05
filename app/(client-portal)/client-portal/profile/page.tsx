import { redirect } from "next/navigation";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/client-portal/login");
  }

  const profileFields = [
    { label: "Full Name", value: user.name || "Not provided", icon: User },
    { label: "Email Address", value: user.email, icon: Mail },
    { label: "Phone Number", value: user.phone || "Not provided", icon: Phone },
    { label: "Account Status", value: user.status, icon: Shield },
    { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }), icon: Calendar },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View your account information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>{user.name || "Client"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.label} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{field.label}</p>
                    <p className="font-medium">{field.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need to update your profile information?
            </p>
            <p className="text-sm mt-1">
              Contact us at{" "}
              <a href="mailto:info@rvpj.in" className="text-primary hover:underline">
                info@rvpj.in
              </a>{" "}
              or call{" "}
              <a href="tel:+919978781078" className="text-primary hover:underline">
                +91 99787 81078
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



