"use client";

import { useState, useEffect, useTransition } from "react";
import { Save, RotateCcw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getThemeSettings, saveThemeSettings } from "../actions";

const defaultColors = {
  primary: "#0f172a",
  secondary: "#64748b",
  accent: "#3b82f6",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#f1f5f9",
};

const defaultTypography = {
  headingFont: "Inter",
  bodyFont: "Inter",
  baseFontSize: "16",
};

export default function ThemeSettingsPage() {
  const [colors, setColors] = useState(defaultColors);
  const [typography, setTypography] = useState(defaultTypography);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await getThemeSettings();
    if (result.settings) {
      const s = result.settings;
      setColors({
        primary: s.primary || defaultColors.primary,
        secondary: s.secondary || defaultColors.secondary,
        accent: s.accent || defaultColors.accent,
        background: s.background || defaultColors.background,
        foreground: s.foreground || defaultColors.foreground,
        muted: s.muted || defaultColors.muted,
      });
      setTypography({
        headingFont: s.headingFont || defaultTypography.headingFont,
        bodyFont: s.bodyFont || defaultTypography.bodyFont,
        baseFontSize: s.baseFontSize || defaultTypography.baseFontSize,
      });
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypographyChange = (key: string, value: string) => {
    setTypography((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("idle");
    startTransition(async () => {
      const allSettings = { ...colors, ...typography };
      const result = await saveThemeSettings(allSettings);
      if (result.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    });
  };

  const handleReset = () => {
    setColors(defaultColors);
    setTypography(defaultTypography);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Theme Settings</h1>
          <p className="text-muted-foreground">Customize your website appearance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button onClick={handleSave} className="gap-2" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-green-700">
          Theme settings saved successfully!
        </div>
      )}

      {saveStatus === "error" && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
          Failed to save theme settings. Please try again.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Define your brand colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <div
                  className="h-10 w-10 rounded-lg border shadow-sm"
                  style={{ backgroundColor: value }}
                />
                <div className="flex-1">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id={key}
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-12 p-1 h-9"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Configure fonts and text styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="headingFont">Heading Font</Label>
              <Input
                id="headingFont"
                value={typography.headingFont}
                onChange={(e) => handleTypographyChange("headingFont", e.target.value)}
                placeholder="e.g., Inter, Roboto, Open Sans"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bodyFont">Body Font</Label>
              <Input
                id="bodyFont"
                value={typography.bodyFont}
                onChange={(e) => handleTypographyChange("bodyFont", e.target.value)}
                placeholder="e.g., Inter, Roboto, Open Sans"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="baseFontSize">Base Font Size (px)</Label>
              <Input
                id="baseFontSize"
                type="number"
                min="12"
                max="24"
                value={typography.baseFontSize}
                onChange={(e) => handleTypographyChange("baseFontSize", e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your theme looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                fontFamily: typography.bodyFont,
                fontSize: `${typography.baseFontSize}px`,
              }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: colors.primary, fontFamily: typography.headingFont }}
              >
                Sample Heading
              </h2>
              <p className="mb-4" style={{ color: colors.secondary }}>
                This is sample body text showing how your typography and colors will look on the website.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-md text-white font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded-md text-white font-medium"
                  style={{ backgroundColor: colors.accent }}
                >
                  Accent Button
                </button>
              </div>
              <div
                className="mt-4 p-4 rounded-md"
                style={{ backgroundColor: colors.muted }}
              >
                <p className="text-sm">This is a muted background section</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
