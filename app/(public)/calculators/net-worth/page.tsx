"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NetWorthCalculatorPage() {
  // Assets
  const [cash, setCash] = useState<string>("");
  const [investments, setInvestments] = useState<string>("");
  const [realEstate, setRealEstate] = useState<string>("");
  const [vehicle, setVehicle] = useState<string>("");
  const [otherAssets, setOtherAssets] = useState<string>("");

  // Liabilities
  const [homeLoan, setHomeLoan] = useState<string>("");
  const [carLoan, setCarLoan] = useState<string>("");
  const [personalLoan, setPersonalLoan] = useState<string>("");
  const [creditCard, setCreditCard] = useState<string>("");
  const [otherLiabilities, setOtherLiabilities] = useState<string>("");

  const [result, setResult] = useState<{
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    debtToAssetRatio: number;
  } | null>(null);

  const calculateNetWorth = () => {
    const totalAssets =
      (parseFloat(cash) || 0) +
      (parseFloat(investments) || 0) +
      (parseFloat(realEstate) || 0) +
      (parseFloat(vehicle) || 0) +
      (parseFloat(otherAssets) || 0);

    const totalLiabilities =
      (parseFloat(homeLoan) || 0) +
      (parseFloat(carLoan) || 0) +
      (parseFloat(personalLoan) || 0) +
      (parseFloat(creditCard) || 0) +
      (parseFloat(otherLiabilities) || 0);

    const netWorth = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    setResult({
      totalAssets: parseFloat(totalAssets.toFixed(2)),
      totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
      netWorth: parseFloat(netWorth.toFixed(2)),
      debtToAssetRatio: parseFloat(debtToAssetRatio.toFixed(2)),
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
            Net Worth Calculator
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Personal / Business Net Worth Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Calculate your total net worth by subtracting liabilities from assets. Track your financial
            health and growth over time.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Assets Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Assets</CardTitle>
              <CardDescription>Enter all your assets and their current value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="cash" className="text-xs">
                  Cash & Bank Balance
                </Label>
                <Input
                  id="cash"
                  type="number"
                  placeholder="₹"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="investments" className="text-xs">
                  Investments (Stocks, MF, FD)
                </Label>
                <Input
                  id="investments"
                  type="number"
                  placeholder="₹"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="real-estate" className="text-xs">
                  Real Estate / Property
                </Label>
                <Input
                  id="real-estate"
                  type="number"
                  placeholder="₹"
                  value={realEstate}
                  onChange={(e) => setRealEstate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vehicle" className="text-xs">
                  Vehicles
                </Label>
                <Input
                  id="vehicle"
                  type="number"
                  placeholder="₹"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="other-assets" className="text-xs">
                  Other Assets (Gold, Business)
                </Label>
                <Input
                  id="other-assets"
                  type="number"
                  placeholder="₹"
                  value={otherAssets}
                  onChange={(e) => setOtherAssets(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Liabilities Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Liabilities</CardTitle>
              <CardDescription>Enter all your debts and outstanding loans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="home-loan" className="text-xs">
                  Home Loan Outstanding
                </Label>
                <Input
                  id="home-loan"
                  type="number"
                  placeholder="₹"
                  value={homeLoan}
                  onChange={(e) => setHomeLoan(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="car-loan" className="text-xs">
                  Car / Auto Loan
                </Label>
                <Input
                  id="car-loan"
                  type="number"
                  placeholder="₹"
                  value={carLoan}
                  onChange={(e) => setCarLoan(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="personal-loan" className="text-xs">
                  Personal Loan
                </Label>
                <Input
                  id="personal-loan"
                  type="number"
                  placeholder="₹"
                  value={personalLoan}
                  onChange={(e) => setPersonalLoan(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="credit-card" className="text-xs">
                  Credit Card Outstanding
                </Label>
                <Input
                  id="credit-card"
                  type="number"
                  placeholder="₹"
                  value={creditCard}
                  onChange={(e) => setCreditCard(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="other-liabilities" className="text-xs">
                  Other Liabilities
                </Label>
                <Input
                  id="other-liabilities"
                  type="number"
                  placeholder="₹"
                  value={otherLiabilities}
                  onChange={(e) => setOtherLiabilities(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <div className="space-y-4">
            <Button onClick={calculateNetWorth} className="w-full" size="lg">
              <TrendingUp className="mr-2" size={18} />
              Calculate Net Worth
            </Button>

            {result && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle>Your Net Worth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Assets:</span>
                    <span className="font-semibold text-green-600">
                      ₹ {result.totalAssets.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Liabilities:</span>
                    <span className="font-semibold text-red-600">
                      ₹ {result.totalLiabilities.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-lg font-medium">Net Worth:</span>
                    <span
                      className={`text-2xl font-bold ${result.netWorth >= 0 ? "text-primary" : "text-red-600"}`}
                    >
                      ₹ {result.netWorth.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">Debt-to-Asset Ratio</p>
                    <p className="text-xl font-bold">{result.debtToAssetRatio.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {result.debtToAssetRatio < 30
                        ? "Excellent financial health"
                        : result.debtToAssetRatio < 50
                          ? "Good financial position"
                          : "Consider reducing debt"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-6 border-primary/20 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Understanding Net Worth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Net Worth = Total Assets - Total Liabilities</strong>
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Positive net worth indicates financial stability and growth</li>
              <li>Track net worth quarterly or annually to measure financial progress</li>
              <li>Aim to increase assets and reduce liabilities over time</li>
              <li>Debt-to-Asset ratio below 30% is considered healthy</li>
              <li>Use current market values for all assets</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


