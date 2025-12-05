"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AutoLoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [tenure, setTenure] = useState<string>("");
  const [result, setResult] = useState<{
    loanRequired: number;
    emi: number;
    totalAmount: number;
    totalInterest: number;
  } | null>(null);

  const calculateAutoLoan = () => {
    const vehiclePrice = parseFloat(loanAmount);
    const down = parseFloat(downPayment) || 0;
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(tenure) * 12;

    if (isNaN(vehiclePrice) || isNaN(r) || isNaN(n)) return;

    const p = vehiclePrice - down;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    setResult({
      loanRequired: parseFloat(p.toFixed(2)),
      emi: parseFloat(emi.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
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
            Auto Loan Calculator
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Car / Vehicle Loan EMI Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Calculate monthly EMI for car loans and two-wheeler loans with down payment options.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car size={20} />
              Calculate Auto Loan EMI
            </CardTitle>
            <CardDescription>
              Plan your vehicle purchase with accurate EMI calculations including down payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vehicle-price">Vehicle On-Road Price (₹)</Label>
                  <Input
                    id="vehicle-price"
                    type="number"
                    placeholder="Enter vehicle price"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Include registration, insurance, and other charges
                  </p>
                </div>
                <div>
                  <Label htmlFor="down-payment">Down Payment (₹)</Label>
                  <Input
                    id="down-payment"
                    type="number"
                    placeholder="Enter down payment"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Typical: 15-25% of vehicle price
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
                    Current range: 8% - 11% for auto loans
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
                  <p className="mt-1 text-xs text-muted-foreground">Typical: 3-7 years</p>
                </div>
                <Button onClick={calculateAutoLoan} className="w-full">
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
                        <span className="text-muted-foreground">Vehicle Price:</span>
                        <span className="font-semibold">
                          ₹ {parseFloat(loanAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Down Payment:</span>
                        <span className="font-semibold text-green-600">
                          - ₹ {parseFloat(downPayment || "0").toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-sm">
                        <span className="text-muted-foreground">Loan Amount:</span>
                        <span className="font-semibold">
                          ₹ {result.loanRequired.toLocaleString("en-IN")}
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

                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <p className="font-medium text-foreground">Total Cost of Ownership</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{" "}
                        {(
                          result.totalAmount + parseFloat(downPayment || "0")
                        ).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (Loan repayment + Down payment)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="border-primary/20 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Auto Loan Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-6">
                  <li>Higher down payment reduces EMI and total interest paid</li>
                  <li>Used car loans typically have higher interest rates (12-15%)</li>
                  <li>New car loans have lower rates (8-11%)</li>
                  <li>Shorter tenure = higher EMI but lower total interest</li>
                  <li>Pre-payment allowed in most auto loans without penalty after 6 months</li>
                  <li>Compare offers from banks, NBFCs, and dealer financing</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


