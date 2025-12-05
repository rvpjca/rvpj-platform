"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const cessRate = 0.04;

function calculateOldRegimeTax(income: number) {
  let tax = 0;
  if (income <= 250_000) return 0;
  if (income <= 500_000) {
    tax += (income - 250_000) * 0.05;
  } else if (income <= 1_000_000) {
    tax += 250_000 * 0.05 + (income - 500_000) * 0.2;
  } else {
    tax += 250_000 * 0.05 + 500_000 * 0.2 + (income - 1_000_000) * 0.3;
  }
  return tax;
}

function calculateNewRegimeTax(income: number) {
  let tax = 0;
  const slabs = [
    { limit: 300_000, rate: 0 },
    { limit: 600_000, rate: 0.05 },
    { limit: 900_000, rate: 0.1 },
    { limit: 1_200_000, rate: 0.15 },
    { limit: 1_500_000, rate: 0.2 },
  ];

  let prev = 0;
  for (const slab of slabs) {
    if (income > slab.limit) {
      tax += (slab.limit - prev) * slab.rate;
      prev = slab.limit;
    } else {
      tax += (income - prev) * slab.rate;
      return tax;
    }
  }

  if (income > 1_500_000) {
    tax += (income - 1_500_000) * 0.3;
  }

  return tax;
}

export function IncomeTaxCalculator() {
  const [income, setIncome] = useState("1000000");

  const results = useMemo(() => {
    const incomeValue = Number(income) || 0;
    const oldTax = calculateOldRegimeTax(incomeValue);
    const newTax = calculateNewRegimeTax(incomeValue);
    return {
      income: incomeValue,
      oldTax: oldTax,
      oldTotal: oldTax + oldTax * cessRate,
      newTax: newTax,
      newTotal: newTax + newTax * cessRate,
    };
  }, [income]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Tax (FY 2024-25)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="income">Annual taxable income (₹)</Label>
          <Input
            id="income"
            type="number"
            min="0"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-primary">Old regime</p>
            <p className="text-2xl font-semibold text-foreground">
              ₹{results.oldTotal.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">Tax + 4% cess</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-primary">New regime</p>
            <p className="text-2xl font-semibold text-foreground">
              ₹{results.newTotal.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">Tax + 4% cess</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



