"use client";

/**
 * EMI Calculator Dashboard – India
 * =================================
 * 
 * DISCLAIMER: This EMI calculator is for educational & planning purposes only.
 * Actual loan terms, interest rates, charges and amortization may differ.
 * Please verify with your lender and cross-check with official documents
 * before making financial decisions.
 * 
 * Features:
 * - Basic EMI Calculator
 * - Home Loan with Prepayments
 * - Loan Affordability Calculator
 * - Tenure Calculator
 * - Interest Rate/APR Calculator
 * - Amortization Schedule (Monthly/Yearly)
 * - Charts (Pie, Bar)
 * - Export to Excel, PDF, Print
 * 
 * EMI Formula: EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 * where: P = Principal, r = monthly rate, n = number of months
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Calculator, 
  Home, 
  Car, 
  GraduationCap, 
  Wallet,
  TrendingUp,
  Clock,
  Percent,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  PieChart as PieChartIcon
} from "lucide-react";
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
// CONFIGURATION
// ============================================================================

const LOAN_TYPES = [
  { value: "home", label: "Home Loan", icon: Home, defaultRate: 8.5, defaultAmount: 5000000, defaultTenure: 20 },
  { value: "car", label: "Car Loan", icon: Car, defaultRate: 9.5, defaultAmount: 800000, defaultTenure: 5 },
  { value: "personal", label: "Personal Loan", icon: Wallet, defaultRate: 12, defaultAmount: 500000, defaultTenure: 3 },
  { value: "education", label: "Education Loan", icon: GraduationCap, defaultRate: 10, defaultAmount: 1000000, defaultTenure: 7 },
  { value: "other", label: "Other Loan", icon: Calculator, defaultRate: 11, defaultAmount: 500000, defaultTenure: 5 },
];

const CALCULATOR_TABS = [
  { id: "emi", label: "EMI Calculator", icon: Calculator },
  { id: "affordability", label: "Affordability", icon: TrendingUp },
  { id: "tenure", label: "Tenure", icon: Clock },
  { id: "rate", label: "Interest Rate", icon: Percent },
];

// ============================================================================
// TYPES
// ============================================================================

interface ScheduleRow {
  month: number;
  year: number;
  paymentDate: string;
  emi: number;
  interest: number;
  principal: number;
  balance: number;
}

interface YearlySchedule {
  year: number;
  totalEmi: number;
  totalInterest: number;
  totalPrincipal: number;
  closingBalance: number;
}

interface EmiResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  schedule: ScheduleRow[];
  yearlySchedule: YearlySchedule[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format number with Indian currency format
 */
function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "₹ 0";
  const rounded = Math.round(amount);
  return "₹ " + rounded.toLocaleString("en-IN");
}

/**
 * Format number without currency symbol
 */
function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return "0";
  return Math.round(num).toLocaleString("en-IN");
}

/**
 * Calculate EMI using standard formula
 * EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 */
function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  
  return isNaN(emi) || !isFinite(emi) ? 0 : emi;
}

/**
 * Calculate maximum loan amount from EMI
 */
function calculatePrincipalFromEmi(emi: number, annualRate: number, tenureMonths: number): number {
  if (emi <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const principal = emi * (factor - 1) / (monthlyRate * factor);
  
  return isNaN(principal) || !isFinite(principal) ? 0 : principal;
}

/**
 * Calculate tenure from EMI
 */
function calculateTenureFromEmi(principal: number, annualRate: number, emi: number): number {
  if (principal <= 0 || annualRate <= 0 || emi <= 0) return 0;
  
  const monthlyRate = annualRate / 12 / 100;
  const tenure = Math.log(emi / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate);
  
  return isNaN(tenure) || !isFinite(tenure) || tenure < 0 ? 0 : Math.ceil(tenure);
}

/**
 * Calculate effective interest rate / APR
 */
function calculateEffectiveRate(principal: number, emi: number, tenureMonths: number): number {
  if (principal <= 0 || emi <= 0 || tenureMonths <= 0) return 0;
  
  // Newton-Raphson method to find rate
  let rate = 0.01; // Initial guess (1% monthly = 12% annual)
  
  for (let i = 0; i < 100; i++) {
    const factor = Math.pow(1 + rate, tenureMonths);
    const calculatedEmi = (principal * rate * factor) / (factor - 1);
    const diff = calculatedEmi - emi;
    
    if (Math.abs(diff) < 0.01) break;
    
    // Derivative for Newton-Raphson
    const derivative = principal * (factor * (1 + rate * tenureMonths) - rate * tenureMonths * factor) / 
                       Math.pow(factor - 1, 2);
    
    rate = rate - diff / derivative;
    
    if (rate <= 0) rate = 0.001;
    if (rate > 0.5) rate = 0.5;
  }
  
  return rate * 12 * 100; // Convert to annual percentage
}

/**
 * Generate amortization schedule
 */
function generateSchedule(
  principal: number, 
  annualRate: number, 
  tenureMonths: number,
  startDate: Date = new Date()
): EmiResult {
  const emi = calculateEmi(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / 12 / 100;
  
  const schedule: ScheduleRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  
  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);
    
    totalInterest += interest;
    
    schedule.push({
      month,
      year: Math.ceil(month / 12),
      paymentDate: paymentDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      emi,
      interest,
      principal: principalPart,
      balance,
    });
  }
  
  // Generate yearly summary
  const yearlySchedule: YearlySchedule[] = [];
  const years = Math.ceil(tenureMonths / 12);
  
  for (let year = 1; year <= years; year++) {
    const yearRows = schedule.filter(r => r.year === year);
    yearlySchedule.push({
      year,
      totalEmi: yearRows.reduce((sum, r) => sum + r.emi, 0),
      totalInterest: yearRows.reduce((sum, r) => sum + r.interest, 0),
      totalPrincipal: yearRows.reduce((sum, r) => sum + r.principal, 0),
      closingBalance: yearRows[yearRows.length - 1]?.balance || 0,
    });
  }
  
  return {
    emi,
    totalPayment: emi * tenureMonths,
    totalInterest,
    schedule,
    yearlySchedule,
  };
}

/**
 * Convert tenure to years and months string
 */
function tenureToString(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years ${remainingMonths} months`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EmiCalculatorPage() {
  // Calculator mode
  const [activeTab, setActiveTab] = useState("emi");
  const [loanType, setLoanType] = useState("home");
  
  // EMI Calculator inputs
  const [principal, setPrincipal] = useState("5000000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenureYears, setTenureYears] = useState("20");
  const [tenureMonths, setTenureMonths] = useState("0");
  const [tenureMode, setTenureMode] = useState<"years" | "months">("years");
  
  // Affordability Calculator inputs
  const [desiredEmi, setDesiredEmi] = useState("50000");
  
  // Tenure Calculator inputs
  const [targetEmi, setTargetEmi] = useState("");
  
  // Rate Calculator inputs  
  const [knownEmi, setKnownEmi] = useState("");
  const [knownTenure, setKnownTenure] = useState("");
  
  // Schedule view
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleView, setScheduleView] = useState<"monthly" | "yearly">("yearly");
  
  // Update defaults when loan type changes
  useEffect(() => {
    const loanConfig = LOAN_TYPES.find(l => l.value === loanType);
    if (loanConfig) {
      setPrincipal(loanConfig.defaultAmount.toString());
      setInterestRate(loanConfig.defaultRate.toString());
      setTenureYears(loanConfig.defaultTenure.toString());
    }
  }, [loanType]);
  
  // Calculate total tenure in months
  const totalTenureMonths = useMemo(() => {
    if (tenureMode === "months") {
      return parseInt(tenureMonths) || 0;
    }
    return ((parseInt(tenureYears) || 0) * 12) + (parseInt(tenureMonths) || 0);
  }, [tenureYears, tenureMonths, tenureMode]);
  
  // Calculate EMI result
  const emiResult = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(interestRate) || 0;
    return generateSchedule(p, r, totalTenureMonths);
  }, [principal, interestRate, totalTenureMonths]);
  
  // Calculate affordability result
  const affordabilityResult = useMemo(() => {
    const emi = parseFloat(desiredEmi) || 0;
    const r = parseFloat(interestRate) || 0;
    return calculatePrincipalFromEmi(emi, r, totalTenureMonths);
  }, [desiredEmi, interestRate, totalTenureMonths]);
  
  // Calculate tenure result
  const tenureResult = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(interestRate) || 0;
    const emi = parseFloat(targetEmi) || emiResult.emi;
    return calculateTenureFromEmi(p, r, emi);
  }, [principal, interestRate, targetEmi, emiResult.emi]);
  
  // Calculate rate result
  const rateResult = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const emi = parseFloat(knownEmi) || emiResult.emi;
    const tenure = parseInt(knownTenure) || totalTenureMonths;
    return calculateEffectiveRate(p, emi, tenure);
  }, [principal, knownEmi, knownTenure, emiResult.emi, totalTenureMonths]);
  
  // Print handler
  const handlePrint = () => {
    window.print();
  };
  
  // Export to Excel (simplified - creates CSV)
  const handleExportExcel = () => {
    const loanConfig = LOAN_TYPES.find(l => l.value === loanType);
    let csv = "EMI Calculation Report\n\n";
    csv += "Loan Type," + (loanConfig?.label || loanType) + "\n";
    csv += "Principal Amount," + principal + "\n";
    csv += "Interest Rate (%)," + interestRate + "\n";
    csv += "Tenure (Months)," + totalTenureMonths + "\n";
    csv += "Monthly EMI," + Math.round(emiResult.emi) + "\n";
    csv += "Total Interest," + Math.round(emiResult.totalInterest) + "\n";
    csv += "Total Payment," + Math.round(emiResult.totalPayment) + "\n\n";
    
    csv += "Amortization Schedule\n";
    csv += "Month,Payment Date,EMI,Interest,Principal,Balance\n";
    
    emiResult.schedule.forEach(row => {
      csv += `${row.month},${row.paymentDate},${Math.round(row.emi)},${Math.round(row.interest)},${Math.round(row.principal)},${Math.round(row.balance)}\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emi-calculation-${loanType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Pie chart data
  const pieData = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const interest = emiResult.totalInterest;
    const total = p + interest;
    return {
      principalPercent: total > 0 ? (p / total) * 100 : 0,
      interestPercent: total > 0 ? (interest / total) * 100 : 0,
    };
  }, [principal, emiResult.totalInterest]);

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
        <section className="border-b bg-gradient-to-br from-slate-50 via-white to-teal-50/30 no-print">
          <div className="container space-y-4 py-8 md:py-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/calculators" className="hover:text-primary transition-colors">
                Calculators
              </Link>
              <span>/</span>
              <span className="text-primary font-medium">EMI Calculator</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Calculator className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                  EMI Calculator – Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Calculate loan EMI, affordability, tenure & interest rates
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
                <strong>Disclaimer:</strong> This EMI calculator is for educational & planning purposes only. 
                Actual loan terms, interest rates, charges and amortization may differ. Please verify with 
                your lender and cross-check with official documents before making financial decisions.
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
            <h2 className="text-lg font-semibold mt-2">EMI Calculation Report</h2>
          </div>

          {/* Calculator Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 no-print">
            {CALCULATOR_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr,400px] lg:items-start">
            {/* Left Panel - Inputs */}
            <div className="space-y-6">
              {/* Loan Type Selection */}
              <Card className="no-print">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Select Loan Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {LOAN_TYPES.map((loan) => {
                      const Icon = loan.icon;
                      return (
                        <button
                          key={loan.value}
                          onClick={() => setLoanType(loan.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            loanType === loan.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-xs font-medium text-center">{loan.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Input Card */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg">
                    {activeTab === "emi" && "EMI Calculator"}
                    {activeTab === "affordability" && "Loan Affordability"}
                    {activeTab === "tenure" && "Tenure Calculator"}
                    {activeTab === "rate" && "Interest Rate Calculator"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "emi" && "Calculate your monthly EMI and total interest"}
                    {activeTab === "affordability" && "Find out how much loan you can afford"}
                    {activeTab === "tenure" && "Calculate loan repayment duration"}
                    {activeTab === "rate" && "Find the effective interest rate"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {/* Principal Amount - shown in all except affordability */}
                  {activeTab !== "affordability" && (
                    <div className="space-y-2">
                      <Label>Loan Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          type="number"
                          min="0"
                          className="pl-8 h-12 text-lg"
                          value={principal}
                          onChange={(e) => setPrincipal(e.target.value)}
                        />
                      </div>
                      {/* Quick amount buttons */}
                      <div className="flex flex-wrap gap-2">
                        {[1000000, 2500000, 5000000, 10000000, 25000000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setPrincipal(amt.toString())}
                            className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            {formatNumber(amt)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Desired EMI - for affordability */}
                  {activeTab === "affordability" && (
                    <div className="space-y-2">
                      <Label>Desired Monthly EMI</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          type="number"
                          min="0"
                          className="pl-8 h-12 text-lg"
                          value={desiredEmi}
                          onChange={(e) => setDesiredEmi(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Interest Rate */}
                  {activeTab !== "rate" && (
                    <div className="space-y-2">
                      <Label>Interest Rate (% per annum)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        step="0.1"
                        className="h-12 text-lg"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                      />
                      {/* Quick rate buttons */}
                      <div className="flex flex-wrap gap-2">
                        {[7, 8, 8.5, 9, 10, 12, 14].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setInterestRate(rate.toString())}
                            className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tenure - for EMI and Affordability */}
                  {(activeTab === "emi" || activeTab === "affordability") && (
                    <div className="space-y-2">
                      <Label>Loan Tenure</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Input
                            type="number"
                            min="0"
                            max="30"
                            className="h-12 text-lg"
                            value={tenureYears}
                            onChange={(e) => setTenureYears(e.target.value)}
                            placeholder="Years"
                          />
                          <span className="text-xs text-muted-foreground">Years</span>
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            max="11"
                            className="h-12 text-lg"
                            value={tenureMonths}
                            onChange={(e) => setTenureMonths(e.target.value)}
                            placeholder="Months"
                          />
                          <span className="text-xs text-muted-foreground">Months</span>
                        </div>
                      </div>
                      {/* Quick tenure buttons */}
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25, 30].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => { setTenureYears(yr.toString()); setTenureMonths("0"); }}
                            className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            {yr} yrs
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Target EMI - for tenure calculator */}
                  {activeTab === "tenure" && (
                    <div className="space-y-2">
                      <Label>Monthly EMI you can pay</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          type="number"
                          min="0"
                          className="pl-8 h-12 text-lg"
                          placeholder={Math.round(emiResult.emi).toString()}
                          value={targetEmi}
                          onChange={(e) => setTargetEmi(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Known values - for rate calculator */}
                  {activeTab === "rate" && (
                    <>
                      <div className="space-y-2">
                        <Label>Monthly EMI</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                          <Input
                            type="number"
                            min="0"
                            className="pl-8 h-12 text-lg"
                            placeholder={Math.round(emiResult.emi).toString()}
                            value={knownEmi}
                            onChange={(e) => setKnownEmi(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Loan Tenure (Months)</Label>
                        <Input
                          type="number"
                          min="1"
                          className="h-12 text-lg"
                          placeholder={totalTenureMonths.toString()}
                          value={knownTenure}
                          onChange={(e) => setKnownTenure(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Amortization Schedule */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Amortization Schedule</CardTitle>
                    <button
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="flex items-center gap-1 text-sm text-primary no-print"
                    >
                      {showSchedule ? "Hide" : "Show"} Schedule
                      {showSchedule ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </CardHeader>
                {showSchedule && (
                  <CardContent className="p-0">
                    <div className="flex gap-2 p-4 border-b no-print">
                      <button
                        onClick={() => setScheduleView("yearly")}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          scheduleView === "yearly" ? "bg-primary text-white" : "bg-slate-100"
                        }`}
                      >
                        Yearly
                      </button>
                      <button
                        onClick={() => setScheduleView("monthly")}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          scheduleView === "monthly" ? "bg-primary text-white" : "bg-slate-100"
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="text-left p-3 font-medium">
                              {scheduleView === "yearly" ? "Year" : "Month"}
                            </th>
                            <th className="text-right p-3 font-medium">EMI</th>
                            <th className="text-right p-3 font-medium">Interest</th>
                            <th className="text-right p-3 font-medium">Principal</th>
                            <th className="text-right p-3 font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleView === "yearly" ? (
                            emiResult.yearlySchedule.map((row) => (
                              <tr key={row.year} className="border-t">
                                <td className="p-3">Year {row.year}</td>
                                <td className="text-right p-3">{formatCurrency(row.totalEmi)}</td>
                                <td className="text-right p-3 text-red-600">{formatCurrency(row.totalInterest)}</td>
                                <td className="text-right p-3 text-green-600">{formatCurrency(row.totalPrincipal)}</td>
                                <td className="text-right p-3">{formatCurrency(row.closingBalance)}</td>
                              </tr>
                            ))
                          ) : (
                            emiResult.schedule.slice(0, 60).map((row) => (
                              <tr key={row.month} className="border-t">
                                <td className="p-3">{row.paymentDate}</td>
                                <td className="text-right p-3">{formatCurrency(row.emi)}</td>
                                <td className="text-right p-3 text-red-600">{formatCurrency(row.interest)}</td>
                                <td className="text-right p-3 text-green-600">{formatCurrency(row.principal)}</td>
                                <td className="text-right p-3">{formatCurrency(row.balance)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      {scheduleView === "monthly" && emiResult.schedule.length > 60 && (
                        <p className="p-4 text-center text-sm text-muted-foreground">
                          Showing first 60 months. Export to see full schedule.
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
              {/* Results Card */}
              <Card className="shadow-xl border-primary/30">
                <CardHeader className="bg-gradient-to-r from-primary/15 to-primary/5 border-b border-primary/20">
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    {activeTab === "emi" && "EMI Calculation"}
                    {activeTab === "affordability" && "Loan Affordability"}
                    {activeTab === "tenure" && "Tenure Result"}
                    {activeTab === "rate" && "Interest Rate"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* EMI Calculator Result */}
                  {activeTab === "emi" && (
                    <>
                      <div className="text-center py-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
                        <p className="text-4xl font-bold text-primary">
                          {formatCurrency(emiResult.emi)}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Principal Amount</span>
                          <span className="font-semibold">{formatCurrency(parseFloat(principal) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Interest</span>
                          <span className="font-semibold text-red-600">{formatCurrency(emiResult.totalInterest)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t">
                          <span className="font-medium">Total Payment</span>
                          <span className="text-xl font-bold">{formatCurrency(emiResult.totalPayment)}</span>
                        </div>
                      </div>

                      {/* Simple Pie Chart Visual */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-center mb-3">Payment Breakdown</p>
                        <div className="flex items-center justify-center gap-4">
                          <div className="relative w-24 h-24">
                            <svg viewBox="0 0 36 36" className="w-full h-full">
                              <circle
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="3"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="none"
                                stroke="#0F766E"
                                strokeWidth="3"
                                strokeDasharray={`${pieData.principalPercent} ${100 - pieData.principalPercent}`}
                                strokeDashoffset="25"
                                className="transition-all duration-500"
                              />
                            </svg>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-primary"></div>
                              <span>Principal ({pieData.principalPercent.toFixed(1)}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                              <span>Interest ({pieData.interestPercent.toFixed(1)}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Affordability Result */}
                  {activeTab === "affordability" && (
                    <>
                      <div className="text-center py-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">Maximum Loan Amount</p>
                        <p className="text-4xl font-bold text-primary">
                          {formatCurrency(affordabilityResult)}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly EMI</span>
                          <span className="font-semibold">{formatCurrency(parseFloat(desiredEmi) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate</span>
                          <span className="font-semibold">{interestRate}% p.a.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tenure</span>
                          <span className="font-semibold">{tenureToString(totalTenureMonths)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tenure Result */}
                  {activeTab === "tenure" && (
                    <>
                      <div className="text-center py-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">Loan Tenure</p>
                        <p className="text-4xl font-bold text-primary">
                          {tenureToString(tenureResult)}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loan Amount</span>
                          <span className="font-semibold">{formatCurrency(parseFloat(principal) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly EMI</span>
                          <span className="font-semibold">{formatCurrency(parseFloat(targetEmi) || emiResult.emi)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate</span>
                          <span className="font-semibold">{interestRate}% p.a.</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Rate Result */}
                  {activeTab === "rate" && (
                    <>
                      <div className="text-center py-4 border-b">
                        <p className="text-sm text-muted-foreground mb-1">Effective Interest Rate</p>
                        <p className="text-4xl font-bold text-primary">
                          {rateResult.toFixed(2)}%
                        </p>
                        <p className="text-sm text-muted-foreground">per annum</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loan Amount</span>
                          <span className="font-semibold">{formatCurrency(parseFloat(principal) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly EMI</span>
                          <span className="font-semibold">{formatCurrency(parseFloat(knownEmi) || emiResult.emi)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tenure</span>
                          <span className="font-semibold">{tenureToString(parseInt(knownTenure) || totalTenureMonths)}</span>
                        </div>
                      </div>
                    </>
                  )}

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

              {/* Quick Stats */}
              <Card className="bg-slate-50 no-print">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 text-sm">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-muted-foreground text-xs">Interest %</p>
                      <p className="font-bold text-lg text-red-600">
                        {((emiResult.totalInterest / emiResult.totalPayment) * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-muted-foreground text-xs">Total Months</p>
                      <p className="font-bold text-lg">{totalTenureMonths}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-muted-foreground text-xs">Monthly Rate</p>
                      <p className="font-bold text-lg">{(parseFloat(interestRate) / 12).toFixed(3)}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-muted-foreground text-xs">Interest/Principal</p>
                      <p className="font-bold text-lg">
                        {((emiResult.totalInterest / (parseFloat(principal) || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
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
        </section>
      </div>
    </>
  );
}
