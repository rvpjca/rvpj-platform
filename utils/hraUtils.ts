/**
 * HRA Utilities
 * -------------
 * Helper types and functions to calculate HRA exemption as per
 * Section 10(13A) read with Rule 2A (least of three rule).
 */

export type MonthCode =
  | "APR"
  | "MAY"
  | "JUN"
  | "JUL"
  | "AUG"
  | "SEP"
  | "OCT"
  | "NOV"
  | "DEC"
  | "JAN"
  | "FEB"
  | "MAR";

export interface HraMonthInput {
  month: MonthCode;
  salary: number;
  hraReceived: number;
  rentPaid: number;
  isMetro: boolean;
}

export interface HraMonthResult extends HraMonthInput {
  exemption: number;
  taxable: number;
}

export interface HraAnnualSummary {
  totalSalary: number;
  totalHra: number;
  totalRent: number;
  totalExemption: number;
  totalTaxable: number;
}

export const MONTHS: { code: MonthCode; label: string }[] = [
  { code: "APR", label: "April" },
  { code: "MAY", label: "May" },
  { code: "JUN", label: "June" },
  { code: "JUL", label: "July" },
  { code: "AUG", label: "August" },
  { code: "SEP", label: "September" },
  { code: "OCT", label: "October" },
  { code: "NOV", label: "November" },
  { code: "DEC", label: "December" },
  { code: "JAN", label: "January" },
  { code: "FEB", label: "February" },
  { code: "MAR", label: "March" },
];

/**
 * Format number in INR
 */
export const formatINR = (amount: number): string => {
  if (isNaN(amount) || !isFinite(amount)) return "₹ 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate HRA exemption for a month using
 * least of:
 * 1. Actual HRA received
 * 2. Rent paid - 10% of salary (basic + DA)
 * 3. 50% of salary for metro / 40% for non-metro
 */
export const calculateMonthlyExemption = (
  input: HraMonthInput,
): HraMonthResult => {
  const salary = Math.max(0, input.salary);
  const hraReceived = Math.max(0, input.hraReceived);
  const rentPaid = Math.max(0, input.rentPaid);

  const rentMinusTenPercent = Math.max(0, rentPaid - 0.1 * salary);
  const fiftyOrForty = (input.isMetro ? 0.5 : 0.4) * salary;

  const exemption = Math.max(
    0,
    Math.min(hraReceived, rentMinusTenPercent, fiftyOrForty),
  );

  const taxable = Math.max(0, hraReceived - exemption);

  return {
    ...input,
    salary,
    hraReceived,
    rentPaid,
    exemption,
    taxable,
  };
};

/**
 * Aggregate annual summary from monthly rows
 */
export const calculateAnnualSummary = (
  rows: HraMonthResult[],
): HraAnnualSummary => {
  return rows.reduce<HraAnnualSummary>(
    (acc, row) => ({
      totalSalary: acc.totalSalary + row.salary,
      totalHra: acc.totalHra + row.hraReceived,
      totalRent: acc.totalRent + row.rentPaid,
      totalExemption: acc.totalExemption + row.exemption,
      totalTaxable: acc.totalTaxable + row.taxable,
    }),
    {
      totalSalary: 0,
      totalHra: 0,
      totalRent: 0,
      totalExemption: 0,
      totalTaxable: 0,
    },
  );
};


