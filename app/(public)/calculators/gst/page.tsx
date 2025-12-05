"use client";

/**
 * GST Calculator - India (New GST Rates)
 * ======================================
 * 
 * DISCLAIMER: This calculator is for educational/planning purposes only.
 * Results should be validated against official GST portal (gst.gov.in).
 * 
 * Features:
 * - GST Exclusive (Add GST to base price)
 * - GST Inclusive (Extract GST from MRP)
 * - Standard GST rates as per GST Council
 * - CGST/SGST/IGST breakdown
 * - Inter-state and Intra-state supply options
 * 
 * New GST Rate Structure:
 * - 0%: Essential items, fresh food, milk, healthcare
 * - 3%: Gold, silver, platinum, jewelry & precious metals
 * - 5%: Packaged food, apparel, footwear, coal, sugar
 * - 12%: Mobiles, medicines, computers, frozen items
 * - 18%: Most services, electronics, steel, cement
 * - 28%: Luxury goods, automobiles, tobacco, aerated drinks
 */

import { useState, useEffect, useCallback } from "react";
import { Calculator, ArrowRight, ArrowLeft, Info, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse input to number, handling empty/invalid values
 */
function parseNumber(value: string): number {
  const parsed = parseFloat(value.replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number with Indian number system (lakhs, crores)
 */
function formatIndianNumber(num: number, decimals: number = 2): string {
  if (num === 0) return "0.00";
  
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  
  // Indian number system: last 3 digits, then groups of 2
  const lastThree = intPart.slice(-3);
  const remaining = intPart.slice(0, -3);
  
  let formatted = lastThree;
  if (remaining.length > 0) {
    formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  
  return formatted + (decPart ? '.' + decPart : '');
}

/**
 * Calculate GST components
 * @param baseAmount - Base amount before GST
 * @param gstRate - GST rate percentage
 * @param isInterState - Whether it's inter-state (IGST) or intra-state (CGST+SGST)
 */
function calculateGSTFromBase(
  baseAmount: number,
  gstRate: number,
  isInterState: boolean
): GSTResult {
  const gstAmount = (baseAmount * gstRate) / 100;
  const totalAmount = baseAmount + gstAmount;
  
  if (isInterState) {
    return {
      baseAmount,
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      totalGst: gstAmount,
      totalAmount,
      gstRate,
    };
  } else {
    const halfGst = gstAmount / 2;
    return {
      baseAmount,
      cgst: halfGst,
      sgst: halfGst,
      igst: 0,
      totalGst: gstAmount,
      totalAmount,
      gstRate,
    };
  }
}

/**
 * Extract GST from MRP (GST inclusive amount)
 * @param mrpAmount - MRP/Total amount including GST
 * @param gstRate - GST rate percentage
 * @param isInterState - Whether it's inter-state (IGST) or intra-state (CGST+SGST)
 */
function extractGSTFromMRP(
  mrpAmount: number,
  gstRate: number,
  isInterState: boolean
): GSTResult {
  const baseAmount = mrpAmount / (1 + gstRate / 100);
  const gstAmount = mrpAmount - baseAmount;
  
  if (isInterState) {
    return {
      baseAmount,
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      totalGst: gstAmount,
      totalAmount: mrpAmount,
      gstRate,
    };
  } else {
    const halfGst = gstAmount / 2;
    return {
      baseAmount,
      cgst: halfGst,
      sgst: halfGst,
      igst: 0,
      totalGst: gstAmount,
      totalAmount: mrpAmount,
      gstRate,
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface GSTResult {
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  totalAmount: number;
  gstRate: number;
}

// ============================================================================
// GST RATE OPTIONS
// ============================================================================

const GST_RATES = [
  { value: "0", label: "0% (Nil)", description: "Essential items, fresh food, milk, healthcare" },
  { value: "3", label: "3%", description: "Gold, silver, platinum, jewelry & precious metals" },
  { value: "5", label: "5%", description: "Packaged food, apparel, footwear, coal, sugar" },
  { value: "12", label: "12%", description: "Mobiles, medicines, computers, frozen items" },
  { value: "18", label: "18%", description: "Most services, electronics, steel, cement" },
  { value: "28", label: "28%", description: "Luxury goods, automobiles, tobacco, aerated drinks" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GSTCalculatorPage() {
  // State
  const [amount, setAmount] = useState<string>("");
  const [gstRate, setGstRate] = useState<string>("18");
  const [calculationType, setCalculationType] = useState<"exclusive" | "inclusive">("exclusive");
  const [supplyType, setSupplyType] = useState<"intra" | "inter">("intra");
  const [result, setResult] = useState<GSTResult | null>(null);
  const [error, setError] = useState<string>("");

  // Debounced calculation
  const calculateGST = useCallback(() => {
    const parsedAmount = parseNumber(amount);
    const parsedRate = parseFloat(gstRate);

    // Validation
    if (amount === "") {
      setResult(null);
      setError("");
      return;
    }

    if (parsedAmount < 0) {
      setError("Amount cannot be negative");
      setResult(null);
      return;
    }

    if (parsedAmount === 0) {
      setError("");
      setResult(null);
      return;
    }

    setError("");
    const isInterState = supplyType === "inter";

    if (calculationType === "exclusive") {
      // Add GST to base amount
      setResult(calculateGSTFromBase(parsedAmount, parsedRate, isInterState));
    } else {
      // Extract GST from MRP
      setResult(extractGSTFromMRP(parsedAmount, parsedRate, isInterState));
    }
  }, [amount, gstRate, calculationType, supplyType]);

  // Auto-calculate on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateGST();
    }, 300);

    return () => clearTimeout(timer);
  }, [calculateGST]);

  // Reset form
  const handleReset = () => {
    setAmount("");
    setGstRate("18");
    setCalculationType("exclusive");
    setSupplyType("intra");
    setResult(null);
    setError("");
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        <div className="container space-y-4 py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/calculators" className="hover:text-primary transition-colors">
              Calculators
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">GST Calculator</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                GST Calculator – India
              </h1>
              <p className="text-muted-foreground mt-1">
                Calculate GST amount, base price & invoice value instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Calculator Section */}
      <section className="container py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          
          {/* Calculator Form */}
          <div className="space-y-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                  GST Calculation
                </CardTitle>
                <CardDescription>
                  Enter amount and select GST rate to calculate tax
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Calculation Type Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Calculation Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCalculationType("exclusive")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        calculationType === "exclusive"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-sm font-medium">Add GST</span>
                    </button>
                    <button
                      onClick={() => setCalculationType("inclusive")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        calculationType === "inclusive"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm font-medium">Remove GST</span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {calculationType === "exclusive"
                      ? "Enter base amount to add GST and get total invoice value"
                      : "Enter MRP/total amount to extract GST and get base price"}
                  </p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    {calculationType === "exclusive" ? "Base Amount" : "MRP / Total Amount"} (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder={calculationType === "exclusive" ? "Enter base amount" : "Enter MRP"}
                      className={`pl-8 text-lg h-12 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>

                {/* GST Rate Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">GST Rate</Label>
                  <Select value={gstRate} onValueChange={setGstRate}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select GST rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {GST_RATES.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value}>
                          <span className="font-medium">{rate.label}</span>
                          <span className="text-muted-foreground ml-2 text-sm">
                            ({rate.description})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Supply Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Type of Supply</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSupplyType("intra")}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        supplyType === "intra"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-sm font-medium">Intra-State</span>
                      <p className="text-xs text-muted-foreground mt-1">CGST + SGST</p>
                    </button>
                    <button
                      onClick={() => setSupplyType("inter")}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        supplyType === "inter"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-sm font-medium">Inter-State</span>
                      <p className="text-xs text-muted-foreground mt-1">IGST</p>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={calculateGST} className="flex-1 h-12 text-base">
                    Calculate GST
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="h-12">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* GST Rate Info */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-medium">GST Rate Structure (as per GST Council):</p>
                    <ul className="space-y-1 text-blue-800">
                      <li><strong>0%:</strong> Essential items – milk, vegetables, grains</li>
                      <li><strong>5%:</strong> Packaged foods, footwear under ₹1,000</li>
                      <li><strong>12%:</strong> Computers, mobile phones, processed food</li>
                      <li><strong>18%:</strong> Most services, electronics, steel, cement</li>
                      <li><strong>28%:</strong> Luxury items, automobiles, tobacco, aerated drinks</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {result ? (
              <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-white to-teal-50/30 sticky top-24">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="text-lg text-primary">GST Calculation Result</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  
                  {/* Main Result */}
                  <div className="text-center py-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">
                      {calculationType === "exclusive" ? "Total Invoice Value" : "Base Price (Excl. GST)"}
                    </p>
                    <p className="text-4xl font-bold text-primary">
                      ₹ {formatIndianNumber(calculationType === "exclusive" ? result.totalAmount : result.baseAmount)}
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Base Amount:</span>
                      <span className="font-semibold">₹ {formatIndianNumber(result.baseAmount)}</span>
                    </div>
                    
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">GST Breakdown @ {result.gstRate}%:</p>
                      
                      {supplyType === "intra" ? (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">CGST @ {(result.gstRate / 2).toFixed(2)}%:</span>
                            <span className="font-medium">₹ {formatIndianNumber(result.cgst)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">SGST/UTGST @ {(result.gstRate / 2).toFixed(2)}%:</span>
                            <span className="font-medium">₹ {formatIndianNumber(result.sgst)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">IGST @ {result.gstRate}%:</span>
                          <span className="font-medium">₹ {formatIndianNumber(result.igst)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center bg-primary/10 -mx-6 px-6 py-3 mt-4">
                      <span className="font-medium">Total GST:</span>
                      <span className="text-xl font-bold text-primary">
                        ₹ {formatIndianNumber(result.totalGst)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="font-medium">Total Amount (Incl. GST):</span>
                      <span className="text-lg font-bold">₹ {formatIndianNumber(result.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Formula Used */}
                  <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded-lg mt-4">
                    <p className="font-medium mb-1">Formula Used:</p>
                    {calculationType === "exclusive" ? (
                      <p>GST = Base Amount × (GST Rate / 100)</p>
                    ) : (
                      <p>Base Amount = MRP / (1 + GST Rate / 100)</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-md border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter amount and GST rate to see calculation results
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Reference */}
            <Card className="bg-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-700">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">CGST</p>
                    <p className="text-muted-foreground">Central GST</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">SGST</p>
                    <p className="text-muted-foreground">State GST</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">UTGST</p>
                    <p className="text-muted-foreground">Union Territory GST</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">IGST</p>
                    <p className="text-muted-foreground">Integrated GST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="mt-12 border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Disclaimer:</p>
                <p>
                  This GST calculator is provided for informational and educational purposes only. 
                  The results are approximate and should not be considered as professional tax advice. 
                  GST rates may vary based on specific goods/services classification under HSN/SAC codes. 
                  For accurate GST computation and compliance, please consult with R V P J & Co. or visit 
                  the official GST portal at <a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-medium">gst.gov.in</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Calculators */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Other Calculators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Income Tax Calculator", href: "/calculators/income-tax" },
              { name: "EMI Calculator", href: "/calculators/emi" },
              { name: "SIP Calculator", href: "/calculators/sip" },
              { name: "TDS Calculator", href: "/calculators/tds" },
            ].map((calc) => (
              <Link
                key={calc.name}
                href={calc.href}
                className="p-4 rounded-lg border bg-white hover:border-primary hover:shadow-md transition-all text-center"
              >
                <span className="font-medium text-slate-700">{calc.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
