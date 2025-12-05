"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function HomeLoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [tenure, setTenure] = useState<string>("");
  const [result, setResult] = useState<{
    emi: number;
    totalAmount: number;
    totalInterest: number;
    principalPercentage: number;
    interestPercentage: number;
  } | null>(null);

  const calculateHomeLoan = () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(tenure) * 12;

    if (isNaN(p) || isNaN(r) || isNaN(n)) return;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;
    const principalPercentage = (p / totalAmount) * 100;
    const interestPercentage = (totalInterest / totalAmount) * 100;

    setResult({
      emi: parseFloat(emi.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      principalPercentage: parseFloat(principalPercentage.toFixed(2)),
      interestPercentage: parseFloat(interestPercentage.toFixed(2)),
    });
  };

  return (
    <div className="bg-white">
      <section className="border-b bg-slate-50">
        <div className="container space-y-4 py-16">
          <Link
            href="/calculators"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to all calculators
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Home Loan Calculator
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Home Loan EMI Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Calculate your monthly home loan EMI, total interest payable, and loan affordability for
            property purchase.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home size={20} />
              Calculate Home Loan EMI
            </CardTitle>
            <CardDescription>
              Plan your home purchase with accurate EMI and interest calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loan-amount">Home Loan Amount (₹)</Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    placeholder="Enter loan amount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Typical range: ₹10 lakh - ₹5 crore
                  </p>
                </div>
                <div>
                  <Label htmlFor="interest">Interest Rate (% per annum)</Label>
                  <Input
                    id="interest"
                    type="number"
                    step="0.1"
                    placeholder="Enter interest rate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current range: 8.5% - 9.5% for home loans
                  </p>
                </div>
                <div>
                  <Label htmlFor="tenure">Loan Tenure (Years)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    placeholder="Enter tenure"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Typical: 10-30 years</p>
                </div>
                <Button onClick={calculateHomeLoan} className="w-full">
                  Calculate EMI
                </Button>
              </div>

              {result && (
                <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Loan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border-2 border-primary/20 bg-white p-4 text-center">
                      <p className="text-sm text-muted-foreground">Monthly EMI</p>
                      <p className="text-3xl font-bold text-primary">
                        ₹ {result.emi.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Principal Amount:</span>
                        <span className="font-semibold">
                          ₹ {parseFloat(loanAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest:</span>
                        <span className="font-semibold text-orange-600">
                          ₹ {result.totalInterest.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Payable:</span>
                        <span className="text-xl font-bold">
                          ₹ {result.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Principal:</span>
                        <span className="font-semibold">{result.principalPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${result.principalPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Interest:</span>
                        <span className="font-semibold">{result.interestPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${result.interestPercentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="border-primary/20 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Home Loan Tax Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-6">
                  <li>
                    <strong>Section 80C:</strong> Deduction up to ₹1.5 lakh on principal repayment
                  </li>
                  <li>
                    <strong>Section 24(b):</strong> Deduction up to ₹2 lakh on interest paid (self-occupied)
                  </li>
                  <li>
                    <strong>Section 80EEA:</strong> Additional ₹1.5 lakh deduction for first-time buyers
                    (property value up to ₹45 lakh)
                  </li>
                  <li>Lower interest rates for women borrowers in many banks</li>
                  <li>Floating rates may change based on RBI policy and MCLR</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


