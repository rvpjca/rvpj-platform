"use client";

import { useState, useEffect, useTransition } from "react";
import { Save, Globe, Phone, Mail, MapPin, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSiteSettings, saveSiteSettings } from "../actions";

const defaultSettings = {
  siteName: "R V P J & Co.",
  siteTagline: "Chartered Accountants",
  siteDescription: "Professional accounting and consultancy services in Gujarat",
  contactEmail: "info@rvpj.in",
  contactPhone: "+91 99787 81078",
  whatsappNumber: "+91 99787 81078",
  address: "224, Platinum Arcade, Jayshree Cinema Road, Near Kalwa Chowk, Junagadh - 362001",
  googleMapsUrl: "",
  facebookUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
};

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await getSiteSettings();
    if (result.settings) {
      const s = result.settings;
      setSettings({
        siteName: s.siteName || defaultSettings.siteName,
        siteTagline: s.siteTagline || defaultSettings.siteTagline,
        siteDescription: s.siteDescription || defaultSettings.siteDescription,
        contactEmail: s.contactEmail || defaultSettings.contactEmail,
        contactPhone: s.contactPhone || defaultSettings.contactPhone,
        whatsappNumber: s.whatsappNumber || defaultSettings.whatsappNumber,
        address: s.address || defaultSettings.address,
        googleMapsUrl: s.googleMapsUrl || defaultSettings.googleMapsUrl,
        facebookUrl: s.facebookUrl || defaultSettings.facebookUrl,
        linkedinUrl: s.linkedinUrl || defaultSettings.linkedinUrl,
        twitterUrl: s.twitterUrl || defaultSettings.twitterUrl,
      });
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("idle");
    startTransition(async () => {
      const result = await saveSiteSettings(settings);
      if (result.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
          <p className="text-muted-foreground">Configure your website settings</p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {saveStatus === "success" && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-green-700">
          Site settings saved successfully!
        </div>
      )}

      {saveStatus === "error" && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
          Failed to save site settings. Please try again.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} />
              General Information
            </CardTitle>
            <CardDescription>Basic site information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="siteTagline">Tagline</Label>
              <Input
                id="siteTagline"
                value={settings.siteTagline}
                onChange={(e) => handleChange("siteTagline", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description (SEO)</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleChange("siteDescription", e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone size={20} />
              Contact Information
            </CardTitle>
            <CardDescription>How customers can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                className="mt-1"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Address
            </CardTitle>
            <CardDescription>Office location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Primary Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="googleMapsUrl">Google Maps Embed URL</Label>
              <Input
                id="googleMapsUrl"
                value={settings.googleMapsUrl}
                onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                className="mt-1"
                placeholder="https://www.google.com/maps/embed?..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Connect your social profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={settings.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                className="mt-1"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={settings.linkedinUrl}
                onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                className="mt-1"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
            <div>
              <Label htmlFor="twitterUrl">Twitter/X URL</Label>
              <Input
                id="twitterUrl"
                value={settings.twitterUrl}
                onChange={(e) => handleChange("twitterUrl", e.target.value)}
                className="mt-1"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
