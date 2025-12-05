"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RERACalculatorPage() {
  const [projectCost, setProjectCost] = useState<string>("");
  const [areaInSqFt, setAreaInSqFt] = useState<string>("");
  const [bookingAmount, setBookingAmount] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [result, setResult] = useState<{
    totalCost: number;
    ratePerSqFt: number;
    balanceAmount: number;
    paidPercentage: number;
  } | null>(null);

  const calculateRERA = () => {
    const cost = parseFloat(projectCost);
    const area = parseFloat(areaInSqFt);
    const booking = parseFloat(bookingAmount) || 0;
    const paid = parseFloat(paidAmount) || 0;

    if (isNaN(cost) || isNaN(area)) return;

    const totalCost = cost;
    const ratePerSqFt = cost / area;
    const totalPaid = booking + paid;
    const balanceAmount = cost - totalPaid;
    const paidPercentage = (totalPaid / cost) * 100;

    setResult({
      totalCost: parseFloat(totalCost.toFixed(2)),
      ratePerSqFt: parseFloat(ratePerSqFt.toFixed(2)),
      balanceAmount: parseFloat(balanceAmount.toFixed(2)),
      paidPercentage: parseFloat(paidPercentage.toFixed(2)),
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
            RERA Calculator
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Real Estate (Regulation and Development) Act Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Calculate property cost breakdown, rate per sq ft, balance amount, and payment percentage
            under RERA regulations.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator size={20} />
              RERA Property Calculator
            </CardTitle>
            <CardDescription>
              Calculate total project cost and payment breakdown for RERA-registered properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-cost">Total Project Cost / Agreement Value (₹)</Label>
                  <Input
                    id="project-cost"
                    type="number"
                    placeholder="Enter total project cost"
                    value={projectCost}
                    onChange={(e) => setProjectCost(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="area">Carpet/Built-up Area (Sq. Ft.)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="Enter area in square feet"
                    value={areaInSqFt}
                    onChange={(e) => setAreaInSqFt(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="booking">Booking Amount Paid (₹)</Label>
                  <Input
                    id="booking"
                    type="number"
                    placeholder="Enter booking amount"
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="paid">Additional Amount Paid (₹)</Label>
                  <Input
                    id="paid"
                    type="number"
                    placeholder="Enter additional payments"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />
                </div>
                <Button onClick={calculateRERA} className="w-full">
                  Calculate
                </Button>
              </div>

              {result && (
                <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Property Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="text-xl font-bold">
                        ₹ {result.totalCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate per Sq. Ft.:</span>
                      <span className="font-semibold text-primary">
                        ₹ {result.ratePerSqFt.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-semibold text-green-600">
                        ₹{" "}
                        {(
                          parseFloat(bookingAmount || "0") + parseFloat(paidAmount || "0")
                        ).toLocaleString("en-IN")}{" "}
                        ({result.paidPercentage.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-medium">Balance Amount:</span>
                      <span className="text-xl font-bold text-orange-600">
                        ₹ {result.balanceAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="border-primary/20 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">About RERA Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>RERA (Real Estate Regulation and Development Act)</strong> provides
                  transparency and accountability in real estate transactions. This calculator helps you:
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>Calculate the total project cost and rate per square foot</li>
                  <li>Track the amount paid vs. balance amount</li>
                  <li>Understand payment percentage for RERA compliance</li>
                  <li>Plan your payment schedule for property purchase</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


