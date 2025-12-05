"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const gstRates = [0, 5, 12, 18, 28];

export function GSTCalculator() {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("18");

  const base = Number(amount) || 0;
  const gstRate = Number(rate);
  const tax = (base * gstRate) / 100;
  const total = base + tax;

  return (
    <Card>
      <CardHeader>
        <CardTitle>GST Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gst-amount">Taxable amount (₹)</Label>
            <Input
              id="gst-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>GST rate</Label>
            <Select value={rate} onValueChange={setRate}>
              <SelectTrigger>
                <SelectValue placeholder="Select rate" />
              </SelectTrigger>
              <SelectContent>
                {gstRates.map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            GST amount: <span className="font-semibold text-foreground">₹{tax.toLocaleString("en-IN")}</span>
          </p>
          <p>
            Total invoice value:{" "}
            <span className="font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}



