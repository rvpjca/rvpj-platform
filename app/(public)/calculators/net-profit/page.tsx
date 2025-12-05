"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NetProfitCalculatorPage() {
  // Revenue
  const [salesRevenue, setSalesRevenue] = useState<string>("");
  const [otherIncome, setOtherIncome] = useState<string>("");

  // Direct Costs
  const [costOfGoods, setCostOfGoods] = useState<string>("");

  // Operating Expenses
  const [salaries, setSalaries] = useState<string>("");
  const [rent, setRent] = useState<string>("");
  const [utilities, setUtilities] = useState<string>("");
  const [marketing, setMarketing] = useState<string>("");
  const [otherExpenses, setOtherExpenses] = useState<string>("");

  // Taxes
  const [incomeTax, setIncomeTax] = useState<string>("");

  const [result, setResult] = useState<{
    totalRevenue: number;
    grossProfit: number;
    grossMargin: number;
    operatingExpenses: number;
    operatingProfit: number;
    operatingMargin: number;
    netProfit: number;
    netMargin: number;
  } | null>(null);

  const calculateNetProfit = () => {
    const revenue = (parseFloat(salesRevenue) || 0) + (parseFloat(otherIncome) || 0);
    const cogs = parseFloat(costOfGoods) || 0;
    const opex =
      (parseFloat(salaries) || 0) +
      (parseFloat(rent) || 0) +
      (parseFloat(utilities) || 0) +
      (parseFloat(marketing) || 0) +
      (parseFloat(otherExpenses) || 0);
    const tax = parseFloat(incomeTax) || 0;

    if (revenue === 0) return;

    const grossProfit = revenue - cogs;
    const grossMargin = (grossProfit / revenue) * 100;
    const operatingProfit = grossProfit - opex;
    const operatingMargin = (operatingProfit / revenue) * 100;
    const netProfit = operatingProfit - tax;
    const netMargin = (netProfit / revenue) * 100;

    setResult({
      totalRevenue: parseFloat(revenue.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      grossMargin: parseFloat(grossMargin.toFixed(2)),
      operatingExpenses: parseFloat(opex.toFixed(2)),
      operatingProfit: parseFloat(operatingProfit.toFixed(2)),
      operatingMargin: parseFloat(operatingMargin.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      netMargin: parseFloat(netMargin.toFixed(2)),
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
            Net Profit Calculator
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Business Net Profit & Margin Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Calculate gross profit, operating profit, net profit, and profit margins for your business.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-green-600">Revenue</CardTitle>
              <CardDescription className="text-xs">All income sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="sales" className="text-xs">
                  Sales Revenue (₹)
                </Label>
                <Input
                  id="sales"
                  type="number"
                  placeholder="Enter sales revenue"
                  value={salesRevenue}
                  onChange={(e) => setSalesRevenue(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="other-income" className="text-xs">
                  Other Income (₹)
                </Label>
                <Input
                  id="other-income"
                  type="number"
                  placeholder="Interest, investments, etc."
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-600">Expenses</CardTitle>
              <CardDescription className="text-xs">All costs and expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="cogs" className="text-xs font-semibold">
                  Cost of Goods Sold (₹)
                </Label>
                <Input
                  id="cogs"
                  type="number"
                  placeholder="Direct costs"
                  value={costOfGoods}
                  onChange={(e) => setCostOfGoods(e.target.value)}
                />
              </div>
              <div className="pt-2">
                <p className="mb-2 text-xs font-semibold">Operating Expenses:</p>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Salaries & wages"
                    value={salaries}
                    onChange={(e) => setSalaries(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Rent & lease"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Utilities & bills"
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Marketing & advertising"
                    value={marketing}
                    onChange={(e) => setMarketing(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Other expenses"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax & Results Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-red-600">Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="tax" className="text-xs">
                  Income Tax (₹)
                </Label>
                <Input
                  id="tax"
                  type="number"
                  placeholder="Tax payable"
                  value={incomeTax}
                  onChange={(e) => setIncomeTax(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button onClick={calculateNetProfit} className="w-full" size="lg">
              <DollarSign className="mr-2" size={18} />
              Calculate Profit
            </Button>

            {result && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">Profit Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 border-b pb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span className="font-semibold">
                        ₹ {result.totalRevenue.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">COGS:</span>
                      <span className="text-red-600">
                        - ₹ {parseFloat(costOfGoods || "0").toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Gross Profit:</span>
                      <span className="font-bold text-green-600">
                        ₹ {result.grossProfit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Margin: {result.grossMargin.toFixed(2)}%
                    </p>
                  </div>

                  <div className="space-y-2 border-b pb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Operating Expenses:</span>
                      <span className="text-orange-600">
                        - ₹ {result.operatingExpenses.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Operating Profit:</span>
                      <span className="font-bold text-blue-600">
                        ₹ {result.operatingProfit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Margin: {result.operatingMargin.toFixed(2)}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Income Tax:</span>
                      <span className="text-red-600">
                        - ₹ {parseFloat(incomeTax || "0").toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Net Profit:</span>
                        <span
                          className={`text-xl font-bold ${result.netProfit >= 0 ? "text-primary" : "text-red-600"}`}
                        >
                          ₹ {result.netProfit.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Net Margin: {result.netMargin.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-6 border-primary/20 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Understanding Profit Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Gross Profit:</strong> Revenue - Cost of Goods Sold (measures production
                efficiency)
              </li>
              <li>
                <strong>Operating Profit (EBIT):</strong> Gross Profit - Operating Expenses (measures
                operational efficiency)
              </li>
              <li>
                <strong>Net Profit (PAT):</strong> Operating Profit - Taxes (final profit after all
                expenses)
              </li>
              <li>
                <strong>Profit Margins:</strong> Higher margins indicate better profitability and
                efficiency
              </li>
              <li>Industry average net margins: Retail (2-5%), Manufacturing (5-10%), IT (15-25%)</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


