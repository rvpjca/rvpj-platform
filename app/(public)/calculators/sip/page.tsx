"use client";

/**
 * SIP Calculator Dashboard – India
 * =================================
 * 
 * DISCLAIMER: This SIP calculator is for educational and planning purposes only.
 * Returns are based on assumed rates and may differ from actual mutual fund or
 * equity returns. Expense ratio, taxes, exit loads and other charges are not
 * considered. Please consult scheme documents and a qualified advisor before
 * making investment decisions.
 * 
 * Features:
 * - SIP Amount Mode (Calculate maturity from SIP)
 * - Goal-Based SIP Mode (Calculate required SIP for target)
 * - Multiple frequencies: Monthly, Weekly, Yearly
 * - Step-up SIP (annual increase)
 * - Inflation adjustment
 * - Year-wise projection table
 * - Charts (Pie chart for breakdown)
 * - Export to Excel/PDF/Print
 * 
 * SIP Formula: FV = P × ((1 + r)^n - 1) / r × (1 + r)
 * where: P = SIP amount, r = periodic rate, n = total instalments
 */

import { useState, useMemo, useCallback } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Calendar,
  Percent,
  ArrowUpRight,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  Wallet,
  PiggyBank,
  BarChart3
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ============================================================================
// TYPES
// ============================================================================

type SIPFrequency = "MONTHLY" | "WEEKLY" | "YEARLY";
type SIPMode = "AMOUNT" | "GOAL";

interface SIPInput {
  mode: SIPMode;
  frequency: SIPFrequency;
  sipAmount: number;
  targetAmount: number;
  years: number;
  annualReturn: number;
  stepUpPercent: number;
  inflationPercent: number;
}

interface ProjectionRow {
  year: number;
  openingBalance: number;
  sipInvested: number;
  interestEarned: number;
  closingBalance: number;
  cumulativeInvestment: number;
}

interface SIPResult {
  maturityAmount: number;
  totalInvestment: number;
  totalReturns: number;
  requiredSIP: number;
  totalInstalments: number;
  inflationAdjustedMaturity: number;
  maturityWithStepUp: number;
  projection: ProjectionRow[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format number with Indian currency format
 */
function formatINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "₹ 0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number without currency symbol
 */
function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return "0";
  return Math.round(num).toLocaleString("en-IN");
}

/**
 * Get instalments per year for each frequency
 */
function getInstalmentsPerYear(frequency: SIPFrequency): number {
  switch (frequency) {
    case "MONTHLY": return 12;
    case "WEEKLY": return 52;
    case "YEARLY": return 1;
    default: return 12;
  }
}

/**
 * Calculate periodic rate from annual rate
 * Monthly: r = (1 + R_annual)^(1/12) - 1
 */
function calcPeriodicRate(annualRate: number, frequency: SIPFrequency): number {
  const periods = getInstalmentsPerYear(frequency);
  return Math.pow(1 + annualRate / 100, 1 / periods) - 1;
}

/**
 * Calculate Future Value for SIP
 * FV = P × ((1 + r)^n - 1) / r × (1 + r)
 */
function calcFVForSIP(
  sipAmount: number,
  periodicRate: number,
  totalInstalments: number
): number {
  if (periodicRate === 0) return sipAmount * totalInstalments;
  const factor = Math.pow(1 + periodicRate, totalInstalments);
  return sipAmount * ((factor - 1) / periodicRate) * (1 + periodicRate);
}

/**
 * Calculate required SIP for goal amount
 * P = FV_target / [((1 + r)^n - 1) / r × (1 + r)]
 */
function calcRequiredSIPForGoal(
  targetAmount: number,
  periodicRate: number,
  totalInstalments: number
): number {
  if (periodicRate === 0) return targetAmount / totalInstalments;
  const factor = Math.pow(1 + periodicRate, totalInstalments);
  return targetAmount / (((factor - 1) / periodicRate) * (1 + periodicRate));
}

/**
 * Calculate SIP with step-up (year-wise increase)
 */
function calcFVWithStepUp(
  initialSIP: number,
  annualReturn: number,
  years: number,
  stepUpPercent: number,
  frequency: SIPFrequency
): number {
  const periodsPerYear = getInstalmentsPerYear(frequency);
  const periodicRate = calcPeriodicRate(annualReturn, frequency);
  
  let totalValue = 0;
  let currentSIP = initialSIP;
  
  for (let year = 1; year <= years; year++) {
    // Calculate FV for this year's SIP contributions
    const remainingPeriods = (years - year + 1) * periodsPerYear;
    const yearContribution = calcFVForSIP(currentSIP, periodicRate, periodsPerYear);
    
    // Grow the year's contribution to the end
    const growthFactor = Math.pow(1 + periodicRate, remainingPeriods - periodsPerYear);
    totalValue += yearContribution * growthFactor;
    
    // Increase SIP for next year
    currentSIP = currentSIP * (1 + stepUpPercent / 100);
  }
  
  return totalValue;
}

/**
 * Build projection table
 */
function buildProjectionTable(input: SIPInput, effectiveSIP: number): ProjectionRow[] {
  const projection: ProjectionRow[] = [];
  const periodsPerYear = getInstalmentsPerYear(input.frequency);
  const periodicRate = calcPeriodicRate(input.annualReturn, input.frequency);
  
  let balance = 0;
  let cumulativeInvestment = 0;
  let currentSIP = effectiveSIP;
  
  for (let year = 1; year <= input.years; year++) {
    const openingBalance = balance;
    const yearlyInvestment = currentSIP * periodsPerYear;
    cumulativeInvestment += yearlyInvestment;
    
    // Calculate closing balance with compound interest
    let yearEndBalance = openingBalance;
    for (let period = 0; period < periodsPerYear; period++) {
      yearEndBalance = (yearEndBalance + currentSIP) * (1 + periodicRate);
    }
    
    const interestEarned = yearEndBalance - openingBalance - yearlyInvestment;
    
    projection.push({
      year,
      openingBalance: Math.round(openingBalance),
      sipInvested: Math.round(yearlyInvestment),
      interestEarned: Math.round(interestEarned),
      closingBalance: Math.round(yearEndBalance),
      cumulativeInvestment: Math.round(cumulativeInvestment),
    });
    
    balance = yearEndBalance;
    
    // Apply step-up for next year
    if (input.stepUpPercent > 0) {
      currentSIP = currentSIP * (1 + input.stepUpPercent / 100);
    }
  }
  
  return projection;
}

/**
 * Main calculation function
 */
function calculateSIP(input: SIPInput): SIPResult {
  const periodsPerYear = getInstalmentsPerYear(input.frequency);
  const totalInstalments = input.years * periodsPerYear;
  const periodicRate = calcPeriodicRate(input.annualReturn, input.frequency);
  
  let effectiveSIP: number;
  let maturityAmount: number;
  let totalInvestment: number;
  
  if (input.mode === "GOAL") {
    // Goal-based: Calculate required SIP
    effectiveSIP = calcRequiredSIPForGoal(input.targetAmount, periodicRate, totalInstalments);
    maturityAmount = input.targetAmount;
    totalInvestment = effectiveSIP * totalInstalments;
  } else {
    // Amount-based: Calculate maturity
    effectiveSIP = input.sipAmount;
    maturityAmount = calcFVForSIP(input.sipAmount, periodicRate, totalInstalments);
    totalInvestment = input.sipAmount * totalInstalments;
  }
  
  const totalReturns = maturityAmount - totalInvestment;
  
  // Calculate with step-up
  let maturityWithStepUp = maturityAmount;
  if (input.stepUpPercent > 0) {
    maturityWithStepUp = calcFVWithStepUp(
      effectiveSIP,
      input.annualReturn,
      input.years,
      input.stepUpPercent,
      input.frequency
    );
  }
  
  // Calculate inflation-adjusted maturity
  let inflationAdjustedMaturity = maturityAmount;
  if (input.inflationPercent > 0) {
    inflationAdjustedMaturity = maturityAmount / Math.pow(1 + input.inflationPercent / 100, input.years);
  }
  
  // Build projection
  const projection = buildProjectionTable(input, effectiveSIP);
  
  return {
    maturityAmount: Math.round(maturityAmount),
    totalInvestment: Math.round(totalInvestment),
    totalReturns: Math.round(totalReturns),
    requiredSIP: Math.round(effectiveSIP),
    totalInstalments,
    inflationAdjustedMaturity: Math.round(inflationAdjustedMaturity),
    maturityWithStepUp: Math.round(maturityWithStepUp),
    projection,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SIPCalculatorPage() {
  // State
  const [mode, setMode] = useState<SIPMode>("AMOUNT");
  const [frequency, setFrequency] = useState<SIPFrequency>("MONTHLY");
  const [sipAmount, setSipAmount] = useState("10000");
  const [targetAmount, setTargetAmount] = useState("5000000");
  const [years, setYears] = useState("10");
  const [annualReturn, setAnnualReturn] = useState("12");
  const [stepUpPercent, setStepUpPercent] = useState("0");
  const [inflationPercent, setInflationPercent] = useState("0");
  const [showProjection, setShowProjection] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Calculate results
  const result = useMemo(() => {
    const input: SIPInput = {
      mode,
      frequency,
      sipAmount: parseFloat(sipAmount) || 0,
      targetAmount: parseFloat(targetAmount) || 0,
      years: parseInt(years) || 1,
      annualReturn: parseFloat(annualReturn) || 0,
      stepUpPercent: parseFloat(stepUpPercent) || 0,
      inflationPercent: parseFloat(inflationPercent) || 0,
    };
    return calculateSIP(input);
  }, [mode, frequency, sipAmount, targetAmount, years, annualReturn, stepUpPercent, inflationPercent]);
  
  // Derived values
  const totalInstalments = useMemo(() => {
    return (parseInt(years) || 0) * getInstalmentsPerYear(frequency);
  }, [years, frequency]);
  
  const frequencyLabel = useMemo(() => {
    switch (frequency) {
      case "MONTHLY": return "Monthly";
      case "WEEKLY": return "Weekly";
      case "YEARLY": return "Yearly";
    }
  }, [frequency]);
  
  // Pie chart data
  const pieData = useMemo(() => {
    const total = result.maturityAmount;
    if (total === 0) return { investmentPercent: 0, returnsPercent: 0 };
    return {
      investmentPercent: (result.totalInvestment / total) * 100,
      returnsPercent: (result.totalReturns / total) * 100,
    };
  }, [result]);
  
  // Print handler
  const handlePrint = () => {
    window.print();
  };
  
  // Export to Excel (CSV)
  const handleExportExcel = () => {
    let csv = "SIP Calculation Report\n\n";
    csv += "Mode," + (mode === "AMOUNT" ? "SIP Amount" : "Goal-Based") + "\n";
    csv += "Frequency," + frequencyLabel + "\n";
    csv += mode === "AMOUNT" ? 
      "SIP Amount (₹)," + sipAmount + "\n" : 
      "Target Amount (₹)," + targetAmount + "\n";
    csv += "Investment Period (Years)," + years + "\n";
    csv += "Expected Return (% p.a.)," + annualReturn + "\n";
    csv += "Step-up (% p.a.)," + stepUpPercent + "\n";
    csv += "Inflation (% p.a.)," + inflationPercent + "\n\n";
    
    csv += "Results\n";
    csv += "Total Investment," + result.totalInvestment + "\n";
    csv += "Maturity Amount," + result.maturityAmount + "\n";
    csv += "Total Returns," + result.totalReturns + "\n";
    csv += "Total Instalments," + result.totalInstalments + "\n\n";
    
    csv += "Year-wise Projection\n";
    csv += "Year,Opening Balance,SIP Invested,Interest Earned,Closing Balance\n";
    
    result.projection.forEach(row => {
      csv += `${row.year},${row.openingBalance},${row.sipInvested},${row.interestEarned},${row.closingBalance}\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sip-calculation-${frequency.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
          }
        }
      `}</style>

      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 no-print">
          <div className="container space-y-4 py-8 md:py-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/calculators" className="hover:text-primary transition-colors">
                Calculators
              </Link>
              <span>/</span>
              <span className="text-primary font-medium">SIP Calculator</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <TrendingUp className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                  SIP Calculator
                </h1>
                <p className="text-muted-foreground mt-1">
                  Mutual Fund & Equity SIP Returns Estimator
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="container py-4 no-print">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Disclaimer:</strong> This SIP calculator is for educational and planning purposes only. 
                Returns are based on assumed rates and may differ from actual mutual fund or equity returns. 
                Expense ratio, taxes, exit loads and other charges are not considered. Please consult scheme 
                documents and a qualified advisor before making investment decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-6 print-area">
          {/* Print Header */}
          <div className="print-header hidden mb-6 text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-primary">R V P J & Co.</h1>
            <p className="text-sm text-muted-foreground">CHARTERED ACCOUNTANTS</p>
            <h2 className="text-lg font-semibold mt-2">SIP Calculation Report</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr,400px] lg:items-start">
            {/* Left Panel - Inputs */}
            <div className="space-y-6">
              {/* Mode Selection */}
              <Card className="no-print">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Investment Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMode("AMOUNT")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        mode === "AMOUNT"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Wallet className="h-6 w-6" />
                      <span className="font-medium">SIP Amount</span>
                      <span className="text-xs text-muted-foreground text-center">
                        I know how much I can invest
                      </span>
                    </button>
                    <button
                      onClick={() => setMode("GOAL")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        mode === "GOAL"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Target className="h-6 w-6" />
                      <span className="font-medium">Goal-Based</span>
                      <span className="text-xs text-muted-foreground text-center">
                        I have a target amount in mind
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Input Card */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg">
                    {mode === "AMOUNT" ? "SIP Details" : "Goal Details"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "AMOUNT" 
                      ? "Enter your SIP amount to calculate maturity value"
                      : "Enter your target corpus to find required SIP"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {/* Frequency Selection */}
                  <div className="space-y-2">
                    <Label>SIP Frequency</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["MONTHLY", "WEEKLY", "YEARLY"] as SIPFrequency[]).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setFrequency(freq)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            frequency === freq
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {freq === "MONTHLY" ? "Monthly" : freq === "WEEKLY" ? "Weekly" : "Yearly"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SIP Amount or Target Amount */}
                  {mode === "AMOUNT" ? (
                    <div className="space-y-2">
                      <Label>{frequencyLabel} SIP Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          type="number"
                          min="500"
                          max="10000000"
                          className="pl-8 h-12 text-lg"
                          value={sipAmount}
                          onChange={(e) => setSipAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[5000, 10000, 25000, 50000, 100000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setSipAmount(amt.toString())}
                            className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            {formatNumber(amt)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Target Corpus / Goal Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          type="number"
                          min="100000"
                          max="1000000000"
                          className="pl-8 h-12 text-lg"
                          value={targetAmount}
                          onChange={(e) => setTargetAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[1000000, 2500000, 5000000, 10000000, 50000000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setTargetAmount(amt.toString())}
                            className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            {(amt / 100000).toFixed(0)}L
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investment Period */}
                  <div className="space-y-2">
                    <Label>Investment Period</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="1"
                        max="40"
                        className="h-12 text-lg w-24"
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                      />
                      <span className="text-muted-foreground">Years</span>
                      <span className="text-sm text-emerald-600 font-medium">
                        ({totalInstalments} instalments)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 15, 20, 25, 30].map((yr) => (
                        <button
                          key={yr}
                          onClick={() => setYears(yr.toString())}
                          className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          {yr} yrs
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expected Return */}
                  <div className="space-y-2">
                    <Label>Expected Annual Return (%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      step="0.5"
                      className="h-12 text-lg"
                      value={annualReturn}
                      onChange={(e) => setAnnualReturn(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      {[8, 10, 12, 14, 15, 18].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setAnnualReturn(rate.toString())}
                          className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Advanced Options (Step-up & Inflation)
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 pt-2 border-t">
                      {/* Step-up SIP */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          Step-up SIP (% increase per year)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          step="1"
                          className="h-10"
                          value={stepUpPercent}
                          onChange={(e) => setStepUpPercent(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Annual increase in SIP amount (e.g., 10% means SIP increases by 10% every year)
                        </p>
                      </div>

                      {/* Inflation */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-orange-600" />
                          Inflation Rate (% p.a.)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="15"
                          step="0.5"
                          className="h-10"
                          value={inflationPercent}
                          onChange={(e) => setInflationPercent(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Used to show inflation-adjusted (real) value of your corpus
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Projection Table */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Year-wise Projection</CardTitle>
                    <button
                      onClick={() => setShowProjection(!showProjection)}
                      className="flex items-center gap-1 text-sm text-emerald-600 no-print"
                    >
                      {showProjection ? "Hide" : "Show"} Table
                      {showProjection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </CardHeader>
                {showProjection && (
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="text-left p-3 font-medium">Year</th>
                            <th className="text-right p-3 font-medium">Opening</th>
                            <th className="text-right p-3 font-medium">Invested</th>
                            <th className="text-right p-3 font-medium">Interest</th>
                            <th className="text-right p-3 font-medium">Closing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.projection.map((row) => (
                            <tr key={row.year} className="border-t hover:bg-slate-50">
                              <td className="p-3 font-medium">Year {row.year}</td>
                              <td className="text-right p-3">{formatINR(row.openingBalance)}</td>
                              <td className="text-right p-3 text-blue-600">{formatINR(row.sipInvested)}</td>
                              <td className="text-right p-3 text-emerald-600">{formatINR(row.interestEarned)}</td>
                              <td className="text-right p-3 font-semibold">{formatINR(row.closingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-100 font-semibold">
                          <tr>
                            <td className="p-3">Total</td>
                            <td className="text-right p-3">-</td>
                            <td className="text-right p-3 text-blue-600">{formatINR(result.totalInvestment)}</td>
                            <td className="text-right p-3 text-emerald-600">{formatINR(result.totalReturns)}</td>
                            <td className="text-right p-3">{formatINR(result.maturityAmount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
              {/* Results Card */}
              <Card className="shadow-xl border-emerald-200">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {mode === "AMOUNT" ? "SIP Returns" : "Required SIP"}
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    {frequencyLabel} SIP • {years} Years • {annualReturn}% p.a.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Main Result */}
                  <div className="text-center py-4 border-b">
                    {mode === "AMOUNT" ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">Maturity Amount</p>
                        <p className="text-4xl font-bold text-emerald-600">
                          {formatINR(result.maturityAmount)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">Required {frequencyLabel} SIP</p>
                        <p className="text-4xl font-bold text-emerald-600">
                          {formatINR(result.requiredSIP)}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-600 mb-1">Total Investment</p>
                      <p className="text-lg font-bold text-blue-700">{formatINR(result.totalInvestment)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-emerald-600 mb-1">Total Returns</p>
                      <p className="text-lg font-bold text-emerald-700">{formatINR(result.totalReturns)}</p>
                    </div>
                  </div>

                  {/* Pie Chart Visual */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-center mb-3">Investment vs Returns</p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="relative w-28 h-28">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray={`${pieData.investmentPercent} ${100 - pieData.investmentPercent}`}
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray={`${pieData.returnsPercent} ${100 - pieData.returnsPercent}`}
                            strokeDashoffset={`-${pieData.investmentPercent}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold text-slate-600">
                            {pieData.returnsPercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>Invested ({pieData.investmentPercent.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span>Returns ({pieData.returnsPercent.toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(parseFloat(stepUpPercent) > 0 || parseFloat(inflationPercent) > 0) && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {parseFloat(stepUpPercent) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">With {stepUpPercent}% Step-up:</span>
                          <span className="font-semibold text-emerald-600">{formatINR(result.maturityWithStepUp)}</span>
                        </div>
                      )}
                      {parseFloat(inflationPercent) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Inflation-adjusted:</span>
                          <span className="font-semibold text-orange-600">{formatINR(result.inflationAdjustedMaturity)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extra Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Total Instalments</p>
                      <p className="font-bold text-lg">{result.totalInstalments}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Wealth Multiplier</p>
                      <p className="font-bold text-lg text-emerald-600">
                        {result.totalInvestment > 0 ? (result.maturityAmount / result.totalInvestment).toFixed(2) : 0}x
                      </p>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="pt-4 border-t mt-4 no-print">
                    <p className="text-sm font-medium mb-3">Export Options</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={handleExportExcel}>
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="bg-slate-50 no-print">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-emerald-600" />
                    SIP Tips
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>• Start early to benefit from compounding</li>
                    <li>• Consider step-up SIP to grow wealth faster</li>
                    <li>• Stay invested for long term (10+ years)</li>
                    <li>• Choose growth option for wealth creation</li>
                    <li>• Diversify across equity & debt funds</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Other Calculators */}
        <section className="container py-8 no-print">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Other Calculators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Income Tax Calculator", href: "/calculators/income-tax" },
              { name: "GST Calculator", href: "/calculators/gst" },
              { name: "EMI Calculator", href: "/calculators/emi" },
              { name: "TDS Calculator", href: "/calculators/tds" },
            ].map((calc) => (
              <Link
                key={calc.name}
                href={calc.href}
                className="p-4 rounded-lg border bg-white hover:border-emerald-300 hover:shadow-md transition-all text-center"
              >
                <span className="font-medium text-slate-700">{calc.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
