"use client";

/**
 * TDS / TCS Calculator – India
 * ============================
 * 
 * DISCLAIMER: This TDS/TCS calculator is for educational and planning purposes only.
 * Actual TDS/TCS applicability, rate and threshold depend on current Income-tax Act,
 * Finance Acts, CBDT circulars etc. This calculator is a simplified tool for quick
 * reference only. Please verify with the latest provisions / official TDS calculator
 * on incometaxindia.gov.in before relying on these calculations.
 * 
 * Features:
 * - Section-wise TDS/TCS calculation
 * - PAN quoted / not quoted logic
 * - Threshold-based exemption
 * - Multiple sections (194A, 194C, 194H, 194I, 194J, 206C, etc.)
 * - Export to Excel/PDF/Print
 * 
 * Section 206AA: Higher deduction @20% when PAN is not quoted
 * Section 206CC: Higher TCS rate when PAN is not quoted
 */

import { useState, useMemo } from "react";
import { 
  Calculator, 
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt,
  Building,
  User
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
// TDS/TCS SECTION CONFIGURATION
// ============================================================================

interface SectionConfig {
  code: string;
  label: string;
  description: string;
  type: "TDS" | "TCS";
  baseRate: number;
  noPanRate: number;
  threshold: number;
  thresholdNote: string;
}

const SECTION_CONFIG: Record<string, SectionConfig> = {
  "193": {
    code: "193",
    label: "193 – Interest on Securities",
    description: "Interest on securities (Debentures, Bonds, etc.)",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 5000,
    thresholdNote: "No TDS if aggregate interest during FY ≤ ₹5,000 (Listed debentures: ₹10,000)"
  },
  "194": {
    code: "194",
    label: "194 – Dividend",
    description: "Dividend payments",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 5000,
    thresholdNote: "No TDS if dividend ≤ ₹5,000 in aggregate during FY"
  },
  "194A": {
    code: "194A",
    label: "194A – Interest other than Securities",
    description: "Interest on deposits, loans, advances (other than securities)",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 40000,
    thresholdNote: "No TDS if interest ≤ ₹40,000 (₹50,000 for senior citizens). Bank interest threshold higher."
  },
  "194B": {
    code: "194B",
    label: "194B – Lottery / Crossword / Game Show",
    description: "Winnings from lottery, crossword puzzle, card games, TV shows",
    type: "TDS",
    baseRate: 30,
    noPanRate: 30,
    threshold: 10000,
    thresholdNote: "No TDS if winnings ≤ ₹10,000. Section 115BB applies."
  },
  "194BB": {
    code: "194BB",
    label: "194BB – Horse Race Winnings",
    description: "Winnings from horse races",
    type: "TDS",
    baseRate: 30,
    noPanRate: 30,
    threshold: 10000,
    thresholdNote: "No TDS if winnings ≤ ₹10,000"
  },
  "194C_IND": {
    code: "194C_IND",
    label: "194C – Contractor (Individual/HUF)",
    description: "Payment to contractor/sub-contractor (Individual/HUF)",
    type: "TDS",
    baseRate: 1,
    noPanRate: 20,
    threshold: 30000,
    thresholdNote: "No TDS if single payment ≤ ₹30,000 AND aggregate during FY ≤ ₹1,00,000"
  },
  "194C_OTH": {
    code: "194C_OTH",
    label: "194C – Contractor (Company/Firm)",
    description: "Payment to contractor/sub-contractor (Company/Firm/Others)",
    type: "TDS",
    baseRate: 2,
    noPanRate: 20,
    threshold: 30000,
    thresholdNote: "No TDS if single payment ≤ ₹30,000 AND aggregate during FY ≤ ₹1,00,000"
  },
  "194C_TRANS": {
    code: "194C_TRANS",
    label: "194C – Transporter (44AE declaration)",
    description: "Payment to transporter who owns ≤10 goods carriages & furnishes 44AE declaration",
    type: "TDS",
    baseRate: 0,
    noPanRate: 20,
    threshold: 0,
    thresholdNote: "NIL TDS if transporter owns ≤10 goods carriages and furnishes declaration with PAN"
  },
  "194D": {
    code: "194D",
    label: "194D – Insurance Commission",
    description: "Insurance commission to agents",
    type: "TDS",
    baseRate: 5,
    noPanRate: 20,
    threshold: 15000,
    thresholdNote: "No TDS if commission ≤ ₹15,000 during FY"
  },
  "194DA": {
    code: "194DA",
    label: "194DA – Life Insurance Maturity",
    description: "Payment for life insurance policy maturity",
    type: "TDS",
    baseRate: 5,
    noPanRate: 20,
    threshold: 100000,
    thresholdNote: "No TDS if amount ≤ ₹1,00,000. TDS on income portion only."
  },
  "194G": {
    code: "194G",
    label: "194G – Lottery Commission",
    description: "Commission on sale of lottery tickets",
    type: "TDS",
    baseRate: 5,
    noPanRate: 20,
    threshold: 15000,
    thresholdNote: "No TDS if commission ≤ ₹15,000 during FY"
  },
  "194H": {
    code: "194H",
    label: "194H – Commission / Brokerage",
    description: "Commission or brokerage payments",
    type: "TDS",
    baseRate: 5,
    noPanRate: 20,
    threshold: 15000,
    thresholdNote: "No TDS if commission/brokerage ≤ ₹15,000 during FY"
  },
  "194I_LAND": {
    code: "194I_LAND",
    label: "194I – Rent on Land & Building",
    description: "Rent for land, building, furniture, fittings",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 240000,
    thresholdNote: "No TDS if rent ≤ ₹2,40,000 during FY"
  },
  "194I_MACHINERY": {
    code: "194I_MACHINERY",
    label: "194I – Rent on Machinery/Equipment",
    description: "Rent for plant, machinery, equipment",
    type: "TDS",
    baseRate: 2,
    noPanRate: 20,
    threshold: 240000,
    thresholdNote: "No TDS if rent ≤ ₹2,40,000 during FY"
  },
  "194IA": {
    code: "194IA",
    label: "194IA – Immovable Property Transfer",
    description: "Payment for transfer of immovable property (other than agricultural land)",
    type: "TDS",
    baseRate: 1,
    noPanRate: 20,
    threshold: 5000000,
    thresholdNote: "No TDS if consideration ≤ ₹50,00,000"
  },
  "194IB": {
    code: "194IB",
    label: "194IB – Rent by Individual/HUF",
    description: "Rent paid by Individual/HUF not liable to tax audit",
    type: "TDS",
    baseRate: 5,
    noPanRate: 20,
    threshold: 50000,
    thresholdNote: "Applicable when monthly rent > ₹50,000. TDS on last month's rent."
  },
  "194J_PROF": {
    code: "194J_PROF",
    label: "194J – Professional Fees",
    description: "Fees for professional or technical services",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 30000,
    thresholdNote: "No TDS if fees ≤ ₹30,000 during FY"
  },
  "194J_TECH": {
    code: "194J_TECH",
    label: "194J – Technical Services / Royalty",
    description: "Technical services, royalty, non-compete fees",
    type: "TDS",
    baseRate: 2,
    noPanRate: 20,
    threshold: 30000,
    thresholdNote: "No TDS if fees ≤ ₹30,000 during FY. 2% for certain technical services."
  },
  "194J_DIRECTOR": {
    code: "194J_DIRECTOR",
    label: "194J – Director Remuneration",
    description: "Remuneration/fees/commission to company directors",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 0,
    thresholdNote: "No threshold exemption for director remuneration"
  },
  "194K": {
    code: "194K",
    label: "194K – Mutual Fund Dividend",
    description: "Dividend distributed by mutual funds",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 5000,
    thresholdNote: "No TDS if dividend ≤ ₹5,000 during FY"
  },
  "194LA": {
    code: "194LA",
    label: "194LA – Compensation for Immovable Property",
    description: "Compensation for compulsory acquisition of immovable property",
    type: "TDS",
    baseRate: 10,
    noPanRate: 20,
    threshold: 250000,
    thresholdNote: "No TDS if compensation ≤ ₹2,50,000"
  },
  "194M": {
    code: "194M",
    label: "194M – Payment by Individual/HUF",
    description: "Payment to contractors/professionals by Individual/HUF (not liable to audit)",
    type: "TDS",
    baseRate: 5,
    noPanRate: 20,
    threshold: 5000000,
    thresholdNote: "Applicable when aggregate payment > ₹50,00,000 during FY"
  },
  "194N": {
    code: "194N",
    label: "194N – Cash Withdrawal",
    description: "Cash withdrawals above threshold from bank accounts",
    type: "TDS",
    baseRate: 2,
    noPanRate: 20,
    threshold: 10000000,
    thresholdNote: "No TDS if cash withdrawal ≤ ₹1 crore during FY (₹20L for non-filers)"
  },
  "194O": {
    code: "194O",
    label: "194O – E-Commerce Participant",
    description: "Payment by e-commerce operator to e-commerce participant",
    type: "TDS",
    baseRate: 1,
    noPanRate: 5,
    threshold: 500000,
    thresholdNote: "No TDS if gross amount ≤ ₹5,00,000 during FY"
  },
  "194Q": {
    code: "194Q",
    label: "194Q – Purchase of Goods",
    description: "Payment for purchase of goods (buyer's turnover > ₹10 Cr)",
    type: "TDS",
    baseRate: 0.1,
    noPanRate: 5,
    threshold: 5000000,
    thresholdNote: "TDS on amount exceeding ₹50,00,000 during FY. Buyer's previous year turnover > ₹10 Cr."
  },
  "195": {
    code: "195",
    label: "195 – Payment to Non-Resident",
    description: "Payment of interest/royalty/FTS/other income to non-resident",
    type: "TDS",
    baseRate: 20,
    noPanRate: 20,
    threshold: 0,
    thresholdNote: "Rates vary based on nature of payment and DTAA. 20% is a general rate for interest."
  },
  "206C_SCRAP": {
    code: "206C_SCRAP",
    label: "206C – TCS on Scrap",
    description: "Sale of scrap",
    type: "TCS",
    baseRate: 1,
    noPanRate: 5,
    threshold: 0,
    thresholdNote: "TCS on sale of scrap to certain buyers"
  },
  "206C_TIMBER": {
    code: "206C_TIMBER",
    label: "206C – TCS on Timber",
    description: "Sale of timber obtained under forest lease",
    type: "TCS",
    baseRate: 2.5,
    noPanRate: 5,
    threshold: 0,
    thresholdNote: "TCS on sale of timber obtained under forest lease"
  },
  "206C_MINERALS": {
    code: "206C_MINERALS",
    label: "206C – TCS on Minerals",
    description: "Sale of coal, lignite, iron ore",
    type: "TCS",
    baseRate: 1,
    noPanRate: 5,
    threshold: 0,
    thresholdNote: "TCS on sale of coal, lignite, iron ore"
  },
  "206C_MOTOR": {
    code: "206C_MOTOR",
    label: "206C(1F) – Motor Vehicle > ₹10L",
    description: "Sale of motor vehicle exceeding ₹10 lakh",
    type: "TCS",
    baseRate: 1,
    noPanRate: 5,
    threshold: 1000000,
    thresholdNote: "TCS if motor vehicle value > ₹10,00,000"
  },
  "206C_1H": {
    code: "206C_1H",
    label: "206C(1H) – Sale of Goods > ₹50L",
    description: "Receipt from sale of goods exceeding ₹50 lakh (seller's turnover > ₹10 Cr)",
    type: "TCS",
    baseRate: 0.1,
    noPanRate: 1,
    threshold: 5000000,
    thresholdNote: "TCS on amount exceeding ₹50,00,000 during FY. Seller's previous year turnover > ₹10 Cr."
  },
  "206C_LRS": {
    code: "206C_LRS",
    label: "206C(1G) – Foreign Remittance (LRS)",
    description: "Foreign remittance under Liberalised Remittance Scheme",
    type: "TCS",
    baseRate: 5,
    noPanRate: 10,
    threshold: 700000,
    thresholdNote: "No TCS if remittance ≤ ₹7,00,000. 5% on excess (20% for non-education/medical purposes above threshold)."
  },
  "206C_TOUR": {
    code: "206C_TOUR",
    label: "206C(1G) – Overseas Tour Package",
    description: "Sale of overseas tour package",
    type: "TCS",
    baseRate: 5,
    noPanRate: 10,
    threshold: 0,
    thresholdNote: "5% TCS on overseas tour package sale"
  }
};

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
 * Compute TDS/TCS
 */
function computeTDS(sectionCode: string, amount: number, hasPAN: boolean): {
  rate: number;
  tds: number;
  net: number;
  thresholdHit: boolean;
  config: SectionConfig | null;
} {
  const config = SECTION_CONFIG[sectionCode];
  if (!config || amount <= 0) {
    return { rate: 0, tds: 0, net: amount, thresholdHit: false, config: null };
  }
  
  // Check threshold
  if (config.threshold > 0 && amount <= config.threshold) {
    return { rate: 0, tds: 0, net: amount, thresholdHit: true, config };
  }
  
  // Determine rate
  let rate = config.baseRate;
  if (!hasPAN) {
    rate = Math.max(config.baseRate, config.noPanRate);
  }
  
  // Calculate TDS/TCS
  const taxAmount = Math.round((amount * rate) / 100);
  
  // For TDS: Net = Amount - TDS
  // For TCS: Net = Amount (TCS is collected additionally)
  const net = config.type === "TDS" ? amount - taxAmount : amount;
  
  return { rate, tds: taxAmount, net, thresholdHit: false, config };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TDSCalculatorPage() {
  // State
  const [section, setSection] = useState("194A");
  const [amount, setAmount] = useState("100000");
  const [hasPAN, setHasPAN] = useState(true);
  
  // Calculate result
  const result = useMemo(() => {
    return computeTDS(section, parseFloat(amount) || 0, hasPAN);
  }, [section, amount, hasPAN]);
  
  // Pie chart data
  const pieData = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (amt === 0 || result.tds === 0) return { taxPercent: 0, netPercent: 100 };
    const taxPercent = (result.tds / amt) * 100;
    return {
      taxPercent,
      netPercent: 100 - taxPercent,
    };
  }, [amount, result.tds]);
  
  // Print handler
  const handlePrint = () => {
    window.print();
  };
  
  // Export to Excel (CSV)
  const handleExportExcel = () => {
    let csv = "TDS/TCS Calculation Report\n\n";
    csv += "Section," + (result.config?.label || section) + "\n";
    csv += "Amount (₹)," + amount + "\n";
    csv += "PAN Quoted," + (hasPAN ? "Yes" : "No") + "\n";
    csv += "Type," + (result.config?.type || "TDS") + "\n";
    csv += "Applicable Rate (%)," + result.rate + "\n";
    csv += (result.config?.type === "TCS" ? "TCS" : "TDS") + " Amount (₹)," + result.tds + "\n";
    csv += "Net Payable (₹)," + result.net + "\n";
    csv += "Threshold Hit," + (result.thresholdHit ? "Yes (No TDS/TCS)" : "No") + "\n";
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tds-calculation-${section}-${new Date().toISOString().split('T')[0]}.csv`;
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
        <section className="border-b bg-gradient-to-br from-slate-50 via-white to-blue-50/30 no-print">
          <div className="container space-y-4 py-8 md:py-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/calculators" className="hover:text-primary transition-colors">
                Calculators
              </Link>
              <span>/</span>
              <span className="text-primary font-medium">TDS / TCS Calculator</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <Receipt className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                  TDS / TCS Calculator
                </h1>
                <p className="text-muted-foreground mt-1">
                  Section-wise Tax Deducted/Collected at Source
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
                <strong>Disclaimer:</strong> This TDS/TCS calculator is for educational and planning purposes only. 
                Actual applicability, rate and threshold depend on current Income-tax Act, Finance Acts, CBDT 
                circulars etc. Please verify with the latest provisions and official calculator on{" "}
                <a href="https://www.incometaxindia.gov.in" target="_blank" rel="noopener noreferrer" className="underline">
                  incometaxindia.gov.in
                </a>.
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
            <h2 className="text-lg font-semibold mt-2">TDS/TCS Calculation Report</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr,400px] lg:items-start">
            {/* Left Panel - Inputs */}
            <div className="space-y-6">
              {/* Input Card */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    TDS / TCS Calculation
                  </CardTitle>
                  <CardDescription>
                    Select section and enter amount to calculate tax deduction/collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {/* Section Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Select Section
                    </Label>
                    <Select value={section} onValueChange={setSection}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select TDS/TCS section" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <SelectItem value="header_tds" disabled>
                          <span className="font-bold text-blue-600">— TDS Sections —</span>
                        </SelectItem>
                        {Object.entries(SECTION_CONFIG)
                          .filter(([_, config]) => config.type === "TDS")
                          .map(([code, config]) => (
                            <SelectItem key={code} value={code}>
                              {config.label}
                            </SelectItem>
                          ))}
                        <SelectItem value="header_tcs" disabled>
                          <span className="font-bold text-blue-600">— TCS Sections —</span>
                        </SelectItem>
                        {Object.entries(SECTION_CONFIG)
                          .filter(([_, config]) => config.type === "TCS")
                          .map(([code, config]) => (
                            <SelectItem key={code} value={code}>
                              {config.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {result.config && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.config.description}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label>Amount of Payment / Consideration</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        type="number"
                        min="0"
                        className="pl-8 h-12 text-lg"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[50000, 100000, 500000, 1000000, 5000000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setAmount(amt.toString())}
                          className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          {formatNumber(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PAN Quoted Toggle */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      PAN Quoted by Deductee?
                      <span className="text-xs text-muted-foreground">(Section 206AA/206CC)</span>
                    </Label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setHasPAN(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                          hasPAN
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Yes</span>
                      </button>
                      <button
                        onClick={() => setHasPAN(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                          !hasPAN
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">No</span>
                      </button>
                    </div>
                    {!hasPAN && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Higher rate applies when PAN is not quoted (20% or section rate, whichever is higher)
                      </p>
                    )}
                  </div>

                  {/* Threshold Note */}
                  {result.config && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800 mb-1">Threshold Note:</p>
                      <p className="text-sm text-blue-700">{result.config.thresholdNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-bold text-lg">
                          {result.config?.type || "TDS"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Base Rate</p>
                        <p className="font-bold text-lg">
                          {result.config?.baseRate || 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
              {/* Results Card */}
              <Card className="shadow-xl border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    {result.config?.type || "TDS"} Calculation Result
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Section {result.config?.code || section}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Threshold Hit Message */}
                  {result.thresholdHit && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-semibold text-green-700">No {result.config?.type} Required</p>
                      <p className="text-sm text-green-600 mt-1">Amount is within threshold limit</p>
                    </div>
                  )}

                  {/* Main Result */}
                  <div className="text-center py-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">
                      {result.config?.type || "TDS"} Amount
                    </p>
                    <p className={`text-4xl font-bold ${result.thresholdHit ? "text-green-600" : "text-blue-600"}`}>
                      {formatINR(result.tds)}
                    </p>
                  </div>
                  
                  {/* Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">{formatINR(parseFloat(amount) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PAN Quoted</span>
                      <span className={`font-semibold ${hasPAN ? "text-green-600" : "text-red-600"}`}>
                        {hasPAN ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applicable Rate</span>
                      <span className="font-semibold text-blue-600">{result.rate}%</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="font-medium">
                        {result.config?.type === "TCS" ? "Amount Payable" : "Net Payable to Party"}
                      </span>
                      <span className="text-xl font-bold">{formatINR(result.net)}</span>
                    </div>
                    {result.config?.type === "TCS" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total with TCS</span>
                        <span className="font-semibold">{formatINR((parseFloat(amount) || 0) + result.tds)}</span>
                      </div>
                    )}
                  </div>

                  {/* Pie Chart Visual */}
                  {!result.thresholdHit && result.tds > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-center mb-3">Tax Breakdown</p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="relative w-24 h-24">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle
                              cx="18"
                              cy="18"
                              r="15.9155"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="3"
                              strokeDasharray={`${pieData.taxPercent} ${100 - pieData.taxPercent}`}
                              strokeDashoffset="0"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.9155"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray={`${pieData.netPercent} ${100 - pieData.netPercent}`}
                              strokeDashoffset={`-${pieData.taxPercent}`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-slate-600">
                              {pieData.taxPercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>{result.config?.type || "TDS"} ({pieData.taxPercent.toFixed(1)}%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span>Net ({pieData.netPercent.toFixed(1)}%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card className="bg-slate-50 no-print">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 text-sm">Quick Reference</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• <strong>Section 206AA:</strong> Higher TDS @20% if PAN not quoted</p>
                    <p>• <strong>Section 206CC:</strong> Higher TCS rate if PAN not quoted</p>
                    <p>• Thresholds are per Financial Year (cumulative)</p>
                    <p>• TDS is deducted from payment; TCS is collected additionally</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Other Calculators */}
        <section className="container py-8 no-print">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Other Calculators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Income Tax Calculator", href: "/calculators/income-tax" },
              { name: "GST Calculator", href: "/calculators/gst" },
              { name: "EMI Calculator", href: "/calculators/emi" },
              { name: "SIP Calculator", href: "/calculators/sip" },
            ].map((calc) => (
              <Link
                key={calc.name}
                href={calc.href}
                className="p-4 rounded-lg border bg-white hover:border-blue-300 hover:shadow-md transition-all text-center"
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
