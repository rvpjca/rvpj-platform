"use client";

/**
 * Income Tax Calculator – India (FY 2025-26)
 * ==========================================
 * 
 * DISCLAIMER: This calculator is for educational and planning purposes only.
 * Please verify final tax computations with the latest provisions of the
 * Income-tax Act, Finance Acts, and the official Income Tax Department
 * calculator before filing returns or advising clients.
 * 
 * Features:
 * - Old Regime vs New Regime comparison
 * - Multiple income sources (Salary, House Property, Business, Capital Gains, Other)
 * - Chapter VI-A Deductions
 * - Special rate taxes (STCG, LTCG, Lottery)
 * - Surcharge and Cess computation
 * - Rebate u/s 87A
 * - Print-friendly output with firm header
 * 
 * Tax Slabs (FY 2025-26 / AY 2026-27):
 * NEW REGIME (Section 115BAC):
 *   Up to ₹4,00,000 - Nil
 *   ₹4,00,001 - ₹8,00,000 - 5%
 *   ₹8,00,001 - ₹12,00,000 - 10%
 *   ₹12,00,001 - ₹16,00,000 - 15%
 *   ₹16,00,001 - ₹20,00,000 - 20%
 *   ₹20,00,001 - ₹24,00,000 - 25%
 *   Above ₹24,00,000 - 30%
 * 
 * OLD REGIME (Individual < 60 years):
 *   Up to ₹2,50,000 - Nil
 *   ₹2,50,001 - ₹5,00,000 - 5%
 *   ₹5,00,001 - ₹10,00,000 - 20%
 *   Above ₹10,00,000 - 30%
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Calculator, Printer, RefreshCw, Info, ChevronDown, ChevronUp } from "lucide-react";
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
// TAX CONFIGURATION CONSTANTS (Easy to update for future FYs)
// ============================================================================

const FINANCIAL_YEARS = [
  "2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022",
  "2020-2021", "2019-2020", "2018-2019", "2017-2018", "2016-2017",
  "2015-2016", "2014-2015", "2013-2014", "2012-2013", "2011-2012",
  "2010-2011", "2009-2010", "2008-2009", "2007-2008"
];

const TAXPAYER_STATUS = [
  { value: "individual", label: "Individual" },
  { value: "huf", label: "HUF" },
  { value: "firm", label: "Firm" },
  { value: "company", label: "Company" },
];

// NEW REGIME SLABS (FY 2025-26) - Section 115BAC
const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Infinity, rate: 30 },
];

// OLD REGIME SLABS - Individual (Below 60)
const OLD_REGIME_SLABS_NORMAL = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// OLD REGIME SLABS - Senior Citizen (60-80)
const OLD_REGIME_SLABS_SENIOR = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// OLD REGIME SLABS - Very Senior Citizen (80+)
const OLD_REGIME_SLABS_VERY_SENIOR = [
  { min: 0, max: 500000, rate: 0 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// REBATE U/S 87A
const REBATE_87A = {
  old: { threshold: 500000, maxRebate: 12500 },
  new: { threshold: 1200000, maxRebate: 60000 },
};

// SURCHARGE SLABS (FY 2025-26)
const SURCHARGE_SLABS = [
  { min: 0, max: 5000000, rate: 0 },
  { min: 5000000, max: 10000000, rate: 10 },
  { min: 10000000, max: 20000000, rate: 15 },
  { min: 20000000, max: 50000000, rate: 25 },
  { min: 50000000, max: Infinity, rate: 37 },
];

// For 115BAC (New Regime) - Max surcharge capped at 25%
const SURCHARGE_CAP_NEW_REGIME = 25;

// CESS
const CESS_RATE = 4;

// Standard Deduction
const STANDARD_DEDUCTION = 75000;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseNumber(value: string): number {
  const parsed = parseFloat(value.replace(/,/g, ''));
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function formatIndianCurrency(num: number): string {
  if (num === 0) return "₹ 0";
  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const str = absNum.toString();
  
  let lastThree = str.substring(str.length - 3);
  const remaining = str.substring(0, str.length - 3);
  
  if (remaining !== '') {
    lastThree = ',' + lastThree;
  }
  
  const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return (isNegative ? '-' : '') + '₹ ' + formatted;
}

function computeSlabTax(income: number, slabs: typeof NEW_REGIME_SLABS): number {
  if (income <= 0) return 0;
  
  let tax = 0;
  for (const slab of slabs) {
    if (income > slab.min) {
      const taxableInSlab = Math.min(income, slab.max) - slab.min;
      tax += taxableInSlab * (slab.rate / 100);
    }
  }
  return tax;
}

function computeRebate87A(
  totalIncome: number,
  slabTax: number,
  regime: 'old' | 'new'
): number {
  const config = REBATE_87A[regime];
  if (totalIncome <= config.threshold) {
    return Math.min(slabTax, config.maxRebate);
  }
  return 0;
}

function computeSurcharge(
  totalIncome: number,
  basicTax: number,
  isNewRegime: boolean
): number {
  let surchargeRate = 0;
  
  for (const slab of SURCHARGE_SLABS) {
    if (totalIncome > slab.min && totalIncome <= slab.max) {
      surchargeRate = slab.rate;
      break;
    }
    if (totalIncome > slab.max) {
      surchargeRate = slab.rate;
    }
  }
  
  // Cap surcharge at 25% for new regime
  if (isNewRegime && surchargeRate > SURCHARGE_CAP_NEW_REGIME) {
    surchargeRate = SURCHARGE_CAP_NEW_REGIME;
  }
  
  return basicTax * (surchargeRate / 100);
}

function computeCess(taxPlusSurcharge: number): number {
  return taxPlusSurcharge * (CESS_RATE / 100);
}

// ============================================================================
// TYPES
// ============================================================================

interface IncomeInputs {
  salary: string;
  houseProperty: string;
  businessIncome: string;
  stcgStt15: string;
  stcgStt20: string;
  stcgOthers: string;
  ltcg10: string;
  ltcg125: string;
  ltcg20: string;
  otherIncome: string;
  agricultureIncome: string;
  lotteryIncome: string;
}

interface DeductionInputs {
  sec80C: string;
  sec80D: string;
  sec80TTA: string;
  otherOldRegime: string;
  otherNewRegime: string;
}

interface TaxResult {
  normalIncome: number;
  specialIncome: number;
  grossTotalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  slabTax: number;
  stcgTax: number;
  ltcgTax: number;
  lotteryTax: number;
  totalSpecialTax: number;
  totalTaxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTaxLiability: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function IncomeTaxCalculatorPage() {
  // Assessee Details
  const [assesseeName, setAssesseeName] = useState("");
  const [financialYear, setFinancialYear] = useState("2025-2026");
  const [taxpayerStatus, setTaxpayerStatus] = useState("individual");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [seniorCitizenType, setSeniorCitizenType] = useState<"normal" | "senior" | "very_senior">("normal");
  const [selectedRegime, setSelectedRegime] = useState<"old" | "new">("new");
  
  // Income Inputs
  const [incomes, setIncomes] = useState<IncomeInputs>({
    salary: "",
    houseProperty: "",
    businessIncome: "",
    stcgStt15: "",
    stcgStt20: "",
    stcgOthers: "",
    ltcg10: "",
    ltcg125: "",
    ltcg20: "",
    otherIncome: "",
    agricultureIncome: "",
    lotteryIncome: "",
  });
  
  // Deduction Inputs
  const [deductions, setDeductions] = useState<DeductionInputs>({
    sec80C: "",
    sec80D: "",
    sec80TTA: "",
    otherOldRegime: "",
    otherNewRegime: "",
  });
  
  // Results
  const [oldRegimeResult, setOldRegimeResult] = useState<TaxResult | null>(null);
  const [newRegimeResult, setNewRegimeResult] = useState<TaxResult | null>(null);
  const [showCapitalGains, setShowCapitalGains] = useState(false);
  
  // Print ref
  const printRef = useRef<HTMLDivElement>(null);

  // Get appropriate old regime slabs based on senior citizen type
  const getOldRegimeSlabs = useCallback(() => {
    switch (seniorCitizenType) {
      case "senior":
        return OLD_REGIME_SLABS_SENIOR;
      case "very_senior":
        return OLD_REGIME_SLABS_VERY_SENIOR;
      default:
        return OLD_REGIME_SLABS_NORMAL;
    }
  }, [seniorCitizenType]);

  // Calculate Tax
  const calculateTax = useCallback(() => {
    // Parse all incomes
    const salary = parseNumber(incomes.salary);
    const houseProperty = parseNumber(incomes.houseProperty);
    const businessIncome = parseNumber(incomes.businessIncome);
    const stcgStt15 = parseNumber(incomes.stcgStt15);
    const stcgStt20 = parseNumber(incomes.stcgStt20);
    const stcgOthers = parseNumber(incomes.stcgOthers);
    const ltcg10 = parseNumber(incomes.ltcg10);
    const ltcg125 = parseNumber(incomes.ltcg125);
    const ltcg20 = parseNumber(incomes.ltcg20);
    const otherIncome = parseNumber(incomes.otherIncome);
    const lotteryIncome = parseNumber(incomes.lotteryIncome);
    
    // Parse deductions
    const sec80C = Math.min(parseNumber(deductions.sec80C), 150000); // Cap at 1.5L
    const sec80D = parseNumber(deductions.sec80D);
    const sec80TTA = Math.min(parseNumber(deductions.sec80TTA), 10000); // Cap at 10K
    const otherOldRegime = parseNumber(deductions.otherOldRegime);
    const otherNewRegime = parseNumber(deductions.otherNewRegime);
    
    // Compute Normal Income (taxed at slab rates)
    const normalIncome = salary + houseProperty + businessIncome + otherIncome;
    
    // Compute Special Income (taxed at special rates)
    const totalSTCG = stcgStt15 + stcgStt20 + stcgOthers;
    const totalLTCG = ltcg10 + ltcg125 + ltcg20;
    const specialIncome = totalSTCG + totalLTCG + lotteryIncome;
    
    // Gross Total Income
    const grossTotalIncome = normalIncome + specialIncome;
    
    // ===== OLD REGIME CALCULATION =====
    const oldDeductions = sec80C + sec80D + sec80TTA + otherOldRegime;
    const oldTaxableNormal = Math.max(0, normalIncome - oldDeductions);
    const oldSlabTax = computeSlabTax(oldTaxableNormal, getOldRegimeSlabs());
    
    // Special rate taxes (OLD)
    const oldStcgTax = (stcgStt15 * 0.15) + (stcgStt20 * 0.20) + (stcgOthers * 0.30);
    const oldLtcgTax = (ltcg10 * 0.10) + (ltcg125 * 0.125) + (ltcg20 * 0.20);
    const oldLotteryTax = lotteryIncome * 0.30;
    const oldTotalSpecialTax = oldStcgTax + oldLtcgTax + oldLotteryTax;
    
    const oldTotalTaxBeforeRebate = oldSlabTax + oldTotalSpecialTax;
    const oldRebate = computeRebate87A(oldTaxableNormal + specialIncome, oldSlabTax, 'old');
    const oldTaxAfterRebate = Math.max(0, oldSlabTax - oldRebate) + oldTotalSpecialTax;
    const oldSurcharge = computeSurcharge(grossTotalIncome, oldTaxAfterRebate, false);
    const oldCess = computeCess(oldTaxAfterRebate + oldSurcharge);
    const oldTotalLiability = oldTaxAfterRebate + oldSurcharge + oldCess;
    
    setOldRegimeResult({
      normalIncome,
      specialIncome,
      grossTotalIncome,
      totalDeductions: oldDeductions,
      taxableIncome: oldTaxableNormal + specialIncome,
      slabTax: oldSlabTax,
      stcgTax: oldStcgTax,
      ltcgTax: oldLtcgTax,
      lotteryTax: oldLotteryTax,
      totalSpecialTax: oldTotalSpecialTax,
      totalTaxBeforeRebate: oldTotalTaxBeforeRebate,
      rebate87A: oldRebate,
      taxAfterRebate: oldTaxAfterRebate,
      surcharge: oldSurcharge,
      cess: oldCess,
      totalTaxLiability: oldTotalLiability,
    });
    
    // ===== NEW REGIME CALCULATION =====
    // New regime: Standard deduction of ₹75,000 and limited deductions
    const newStandardDeduction = salary > 0 ? STANDARD_DEDUCTION : 0;
    const newDeductions = newStandardDeduction + otherNewRegime;
    const newTaxableNormal = Math.max(0, normalIncome - newDeductions);
    const newSlabTax = computeSlabTax(newTaxableNormal, NEW_REGIME_SLABS);
    
    // Special rate taxes (NEW) - same rates
    const newStcgTax = (stcgStt15 * 0.15) + (stcgStt20 * 0.20) + (stcgOthers * 0.30);
    const newLtcgTax = (ltcg10 * 0.10) + (ltcg125 * 0.125) + (ltcg20 * 0.20);
    const newLotteryTax = lotteryIncome * 0.30;
    const newTotalSpecialTax = newStcgTax + newLtcgTax + newLotteryTax;
    
    const newTotalTaxBeforeRebate = newSlabTax + newTotalSpecialTax;
    const newRebate = computeRebate87A(newTaxableNormal + specialIncome, newSlabTax, 'new');
    const newTaxAfterRebate = Math.max(0, newSlabTax - newRebate) + newTotalSpecialTax;
    const newSurcharge = computeSurcharge(grossTotalIncome, newTaxAfterRebate, true);
    const newCess = computeCess(newTaxAfterRebate + newSurcharge);
    const newTotalLiability = newTaxAfterRebate + newSurcharge + newCess;
    
    setNewRegimeResult({
      normalIncome,
      specialIncome,
      grossTotalIncome,
      totalDeductions: newDeductions,
      taxableIncome: newTaxableNormal + specialIncome,
      slabTax: newSlabTax,
      stcgTax: newStcgTax,
      ltcgTax: newLtcgTax,
      lotteryTax: newLotteryTax,
      totalSpecialTax: newTotalSpecialTax,
      totalTaxBeforeRebate: newTotalTaxBeforeRebate,
      rebate87A: newRebate,
      taxAfterRebate: newTaxAfterRebate,
      surcharge: newSurcharge,
      cess: newCess,
      totalTaxLiability: newTotalLiability,
    });
  }, [incomes, deductions, getOldRegimeSlabs]);

  // Auto-calculate on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateTax();
    }, 300);
    return () => clearTimeout(timer);
  }, [calculateTax]);

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Reset Form
  const handleReset = () => {
    setAssesseeName("");
    setFinancialYear("2025-2026");
    setTaxpayerStatus("individual");
    setGender("male");
    setSeniorCitizenType("normal");
    setSelectedRegime("new");
    setIncomes({
      salary: "",
      houseProperty: "",
      businessIncome: "",
      stcgStt15: "",
      stcgStt20: "",
      stcgOthers: "",
      ltcg10: "",
      ltcg125: "",
      ltcg20: "",
      otherIncome: "",
      agricultureIncome: "",
      lotteryIncome: "",
    });
    setDeductions({
      sec80C: "",
      sec80D: "",
      sec80TTA: "",
      otherOldRegime: "",
      otherNewRegime: "",
    });
  };

  // Update income field
  const updateIncome = (field: keyof IncomeInputs, value: string) => {
    setIncomes(prev => ({ ...prev, [field]: value }));
  };

  // Update deduction field
  const updateDeduction = (field: keyof DeductionInputs, value: string) => {
    setDeductions(prev => ({ ...prev, [field]: value }));
  };

  // Get better regime
  const getBetterRegime = () => {
    if (!oldRegimeResult || !newRegimeResult) return null;
    const diff = oldRegimeResult.totalTaxLiability - newRegimeResult.totalTaxLiability;
    if (diff > 0) return { regime: 'new', savings: diff };
    if (diff < 0) return { regime: 'old', savings: -diff };
    return { regime: 'same', savings: 0 };
  };

  const betterRegime = getBetterRegime();
  const currentResult = selectedRegime === 'old' ? oldRegimeResult : newRegimeResult;

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
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #0F766E;
            padding-bottom: 15px;
          }
          .print-header h1 {
            font-size: 24px;
            color: #0F766E;
            margin: 0;
          }
          .print-header p {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
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
              <span className="text-primary font-medium">Income Tax Calculator</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Calculator className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                  Income Tax Calculator – India
                </h1>
                <p className="text-muted-foreground mt-1">
                  FY {financialYear} (AY {parseInt(financialYear.split('-')[0]) + 1}-{parseInt(financialYear.split('-')[1]) + 1})
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
                <strong>Disclaimer:</strong> This calculator is for educational and planning purposes only. 
                Please verify final tax computations with the latest provisions of the Income-tax Act, Finance Acts, 
                and the official Income Tax Department calculator before filing returns.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-6 print-area" ref={printRef}>
          {/* Print Header - Hidden on screen, visible on print */}
          <div className="print-header hidden">
            <h1>R V P J & Co.</h1>
            <p>CHARTERED ACCOUNTANTS</p>
            <p>Junagadh | Rajkot | Porbandar</p>
            <p>Email: info@rvpj.co.in | Phone: +91 9978781078</p>
            <h2 className="mt-4 text-lg font-semibold">INCOME TAX COMPUTATION - FY {financialYear}</h2>
            {assesseeName && <p className="mt-2">Assessee: <strong>{assesseeName}</strong></p>}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr,420px] lg:items-start">
            {/* Left Panel - Inputs */}
            <div className="space-y-6 no-print">
              {/* Assessee Details */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg">Assessee Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="assesseeName">Assessee Name</Label>
                      <Input
                        id="assesseeName"
                        placeholder="Enter name (for print)"
                        value={assesseeName}
                        onChange={(e) => setAssesseeName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Financial Year</Label>
                      <Select value={financialYear} onValueChange={setFinancialYear}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select FY">{financialYear}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {FINANCIAL_YEARS.map((fy) => (
                            <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status of Tax Payer</Label>
                      <Select value={taxpayerStatus} onValueChange={setTaxpayerStatus}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select status">
                            {TAXPAYER_STATUS.find(s => s.value === taxpayerStatus)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {TAXPAYER_STATUS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="flex gap-4 h-10 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === "male"}
                            onChange={() => setGender("male")}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="text-sm">Male</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === "female"}
                            onChange={() => setGender("female")}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="text-sm">Female</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Senior Citizen Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { value: "normal", label: "Below 60 Years" },
                        { value: "senior", label: "Senior (60-80)" },
                        { value: "very_senior", label: "Very Senior (80+)" },
                      ].map((type) => (
                        <label 
                          key={type.value} 
                          className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border transition-all ${
                            seniorCitizenType === type.value 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="seniorCitizen"
                            checked={seniorCitizenType === type.value}
                            onChange={() => setSeniorCitizenType(type.value as typeof seniorCitizenType)}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tax Regime</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedRegime("old")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedRegime === "old"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-medium">Old Regime</span>
                        <p className="text-xs text-muted-foreground mt-1">With deductions</p>
                      </button>
                      <button
                        onClick={() => setSelectedRegime("new")}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedRegime === "new"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-medium">New Regime</span>
                        <p className="text-xs text-muted-foreground mt-1">Lower rates, fewer deductions</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Income Section */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg">Statement of Income</CardTitle>
                  <CardDescription>Enter your income details for the financial year</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary Income</Label>
                    <p className="text-xs text-muted-foreground">
                      Enter gross salary. Standard deduction of ₹75,000 applied in New Regime.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="salary"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="pl-8 h-11"
                        value={incomes.salary}
                        onChange={(e) => updateIncome("salary", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="houseProperty">Income from House Property</Label>
                    <p className="text-xs text-muted-foreground">
                      Net income after 30% deduction u/s 24(a) and home loan interest
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="houseProperty"
                        type="number"
                        placeholder="0"
                        className="pl-8 h-11"
                        value={incomes.houseProperty}
                        onChange={(e) => updateIncome("houseProperty", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessIncome">Business / Professional Income</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="businessIncome"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="pl-8 h-11"
                        value={incomes.businessIncome}
                        onChange={(e) => updateIncome("businessIncome", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Capital Gains - Collapsible */}
                  <div className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowCapitalGains(!showCapitalGains)}
                      className="w-full p-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-medium text-sm">Capital Gains (Click to expand)</span>
                      {showCapitalGains ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {showCapitalGains && (
                      <div className="p-4 space-y-4 bg-slate-50/50">
                        <div>
                          <p className="text-sm font-medium text-primary mb-3">Short-Term Capital Gains (STCG)</p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                              <Label className="text-xs">@15% (Sec 111A)</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="pl-6 h-9"
                                  value={incomes.stcgStt15}
                                  onChange={(e) => updateIncome("stcgStt15", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">@20% (STT)</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="pl-6 h-9"
                                  value={incomes.stcgStt20}
                                  onChange={(e) => updateIncome("stcgStt20", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">@30% (Others)</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="pl-6 h-9"
                                  value={incomes.stcgOthers}
                                  onChange={(e) => updateIncome("stcgOthers", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary mb-3">Long-Term Capital Gains (LTCG)</p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                              <Label className="text-xs">@10% (Sec 112A)</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="pl-6 h-9"
                                  value={incomes.ltcg10}
                                  onChange={(e) => updateIncome("ltcg10", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">@12.5%</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="pl-6 h-9"
                                  value={incomes.ltcg125}
                                  onChange={(e) => updateIncome("ltcg125", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">@20% (Sec 112)</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="pl-6 h-9"
                                  value={incomes.ltcg20}
                                  onChange={(e) => updateIncome("ltcg20", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="otherIncome">Income from Other Sources</Label>
                    <p className="text-xs text-muted-foreground">
                      Interest, dividend, gifts, etc.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="otherIncome"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="pl-8 h-11"
                        value={incomes.otherIncome}
                        onChange={(e) => updateIncome("otherIncome", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lotteryIncome">Winning from Lottery/Game Shows</Label>
                    <p className="text-xs text-muted-foreground">
                      Taxed at flat 30%
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="lotteryIncome"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="pl-8 h-11"
                        value={incomes.lotteryIncome}
                        onChange={(e) => updateIncome("lotteryIncome", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions Section */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg">Deductions under Chapter VI-A</CardTitle>
                  <CardDescription>Applicable mainly under Old Regime</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sec80C">Section 80C, 80CCC, 80CCD</Label>
                      <p className="text-xs text-muted-foreground">Max ₹1,50,000</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          id="sec80C"
                          type="number"
                          min="0"
                          max="150000"
                          placeholder="0"
                          className="pl-8 h-11"
                          value={deductions.sec80C}
                          onChange={(e) => updateDeduction("sec80C", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sec80D">Section 80D - Mediclaim</Label>
                      <p className="text-xs text-muted-foreground">Health insurance premium</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          id="sec80D"
                          type="number"
                          min="0"
                          placeholder="0"
                          className="pl-8 h-11"
                          value={deductions.sec80D}
                          onChange={(e) => updateDeduction("sec80D", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sec80TTA">Section 80TTA</Label>
                      <p className="text-xs text-muted-foreground">Savings interest (Max ₹10,000)</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          id="sec80TTA"
                          type="number"
                          min="0"
                          max="10000"
                          placeholder="0"
                          className="pl-8 h-11"
                          value={deductions.sec80TTA}
                          onChange={(e) => updateDeduction("sec80TTA", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherOldRegime">Other Deductions - Old Regime</Label>
                      <p className="text-xs text-muted-foreground">80E, 80G, 80GG, etc.</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          id="otherOldRegime"
                          type="number"
                          min="0"
                          placeholder="0"
                          className="pl-8 h-11"
                          value={deductions.otherOldRegime}
                          onChange={(e) => updateDeduction("otherOldRegime", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherNewRegime">Eligible Deductions - New Regime</Label>
                    <p className="text-xs text-muted-foreground">
                      80CCD(2) - Employer NPS (only allowed in new regime besides standard deduction)
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="otherNewRegime"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="pl-8 h-11"
                        value={deductions.otherNewRegime}
                        onChange={(e) => updateDeduction("otherNewRegime", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 sticky bottom-4 bg-white/95 backdrop-blur-sm p-3 -mx-3 rounded-lg shadow-lg border">
                <Button onClick={calculateTax} className="flex-1 h-12 text-base">
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculate Tax
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12 px-4">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-6 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
              {/* Main Result Card */}
              <Card className="shadow-xl border-primary/30">
                <CardHeader className="bg-gradient-to-r from-primary/15 to-primary/5 border-b border-primary/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Tax Computation
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                  <CardDescription className="text-primary/80 font-medium">
                    {selectedRegime === 'old' ? 'Old Regime' : 'New Regime (115BAC)'} • FY {financialYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {currentResult ? (
                    <div className="divide-y">
                      {/* Income Summary */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-medium text-sm text-slate-700">Income</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Normal Income</span>
                            <span>{formatIndianCurrency(currentResult.normalIncome)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Special Rate Income</span>
                            <span>{formatIndianCurrency(currentResult.specialIncome)}</span>
                          </div>
                          <div className="flex justify-between font-medium pt-1 border-t">
                            <span>Gross Total Income</span>
                            <span>{formatIndianCurrency(currentResult.grossTotalIncome)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-medium text-sm text-slate-700">Deductions</h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Deductions</span>
                          <span className="text-green-600">(-) {formatIndianCurrency(currentResult.totalDeductions)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-sm pt-1 border-t">
                          <span>Total Taxable Income</span>
                          <span>{formatIndianCurrency(currentResult.taxableIncome)}</span>
                        </div>
                      </div>

                      {/* Tax Breakdown */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-medium text-sm text-slate-700">Tax Calculation</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax on Normal Income (Slab)</span>
                            <span>{formatIndianCurrency(currentResult.slabTax)}</span>
                          </div>
                          {currentResult.stcgTax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">STCG Tax (Special Rates)</span>
                              <span>{formatIndianCurrency(currentResult.stcgTax)}</span>
                            </div>
                          )}
                          {currentResult.ltcgTax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">LTCG Tax (Special Rates)</span>
                              <span>{formatIndianCurrency(currentResult.ltcgTax)}</span>
                            </div>
                          )}
                          {currentResult.lotteryTax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Lottery Tax @30%</span>
                              <span>{formatIndianCurrency(currentResult.lotteryTax)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t">
                            <span className="text-muted-foreground">Total Tax (before rebate)</span>
                            <span>{formatIndianCurrency(currentResult.totalTaxBeforeRebate)}</span>
                          </div>
                          {currentResult.rebate87A > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Less: Rebate u/s 87A</span>
                              <span>(-) {formatIndianCurrency(currentResult.rebate87A)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax after Rebate</span>
                            <span>{formatIndianCurrency(currentResult.taxAfterRebate)}</span>
                          </div>
                          {currentResult.surcharge > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Surcharge</span>
                              <span>{formatIndianCurrency(currentResult.surcharge)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Health & Education Cess @4%</span>
                            <span>{formatIndianCurrency(currentResult.cess)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Total Liability */}
                      <div className="p-4 bg-primary/5">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Total Tax Liability</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatIndianCurrency(currentResult.totalTaxLiability)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>Enter income details to see tax computation</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Regime Comparison */}
              {oldRegimeResult && newRegimeResult && (
                <Card className="bg-slate-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Old vs New Regime Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg border-2 ${selectedRegime === 'old' ? 'border-primary bg-white' : 'border-transparent bg-white/50'}`}>
                        <p className="text-xs text-muted-foreground">Old Regime</p>
                        <p className="text-lg font-bold">{formatIndianCurrency(oldRegimeResult.totalTaxLiability)}</p>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${selectedRegime === 'new' ? 'border-primary bg-white' : 'border-transparent bg-white/50'}`}>
                        <p className="text-xs text-muted-foreground">New Regime</p>
                        <p className="text-lg font-bold">{formatIndianCurrency(newRegimeResult.totalTaxLiability)}</p>
                      </div>
                    </div>
                    
                    {betterRegime && betterRegime.regime !== 'same' && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                        <p className="text-sm text-green-800">
                          <strong>{betterRegime.regime === 'old' ? 'Old' : 'New'} Regime</strong> is better by{' '}
                          <strong>{formatIndianCurrency(betterRegime.savings)}</strong>
                        </p>
                      </div>
                    )}
                    {betterRegime && betterRegime.regime === 'same' && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                        <p className="text-sm text-blue-800">Both regimes result in same tax liability</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tax Slabs Reference */}
              <Card className="no-print">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tax Slab Reference (FY 2025-26)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <p className="font-medium text-primary mb-1">New Regime (115BAC)</p>
                    <div className="space-y-0.5 text-muted-foreground">
                      <p>Up to ₹4L - Nil</p>
                      <p>₹4L - ₹8L - 5%</p>
                      <p>₹8L - ₹12L - 10%</p>
                      <p>₹12L - ₹16L - 15%</p>
                      <p>₹16L - ₹20L - 20%</p>
                      <p>₹20L - ₹24L - 25%</p>
                      <p>Above ₹24L - 30%</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-primary mb-1">Old Regime (Below 60)</p>
                    <div className="space-y-0.5 text-muted-foreground">
                      <p>Up to ₹2.5L - Nil</p>
                      <p>₹2.5L - ₹5L - 5%</p>
                      <p>₹5L - ₹10L - 20%</p>
                      <p>Above ₹10L - 30%</p>
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
              { name: "GST Calculator", href: "/calculators/gst" },
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
        </section>
      </div>
    </>
  );
}
