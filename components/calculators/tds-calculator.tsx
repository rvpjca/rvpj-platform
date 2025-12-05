"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TDSCalculator() {
  const [amount, setAmount] = useState("50000");
  const [rate, setRate] = useState("10");

  const base = Number(amount) || 0;
  const tdsRate = Number(rate) || 0;
  const tds = (base * tdsRate) / 100;
  const net = base - tds;

  return (
    <Card>
      <CardHeader>
        <CardTitle>TDS Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tds-amount">Payment amount (₹)</Label>
            <Input
              id="tds-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tds-rate">TDS rate (%)</Label>
            <Input
              id="tds-rate"
              type="number"
              min="0"
              max="100"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            TDS to deduct: <span className="font-semibold text-foreground">₹{tds.toLocaleString("en-IN")}</span>
          </p>
          <p>
            Net payment to vendor:{" "}
            <span className="font-semibold text-foreground">₹{net.toLocaleString("en-IN")}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}



