/**
 * tdsRates.ts
 * -----------
 * Centralised TypeScript utilities for maintaining TDS/TCS rates,
 * thresholds and quick computations (PAN vs non-PAN) for CA-firm tools.
 *
 * IMPORTANT:
 * - All rates / thresholds here are illustrative placeholders.
 * - Before production use, update values as per the latest Finance Act,
 *   Income-tax Rules, CBDT circulars and internal working papers.
 * - PAN logic (206AA / 206CC) is simplified to “max(baseRate, noPanRate)”.
 */

export type DeductionType = "TDS" | "TCS";

export interface TdsConfig {
  code: string;
  label: string;
  type: DeductionType;
  baseRate: number;
  noPanRate: number;
  threshold: number;
  thresholdNote: string;
  notes?: string;
}

export interface TdsResult {
  config: TdsConfig;
  amount: number;
  appliedRate: number;
  tdsAmount: number;
  netAmount: number;
  isThresholdHit: boolean;
  message: string;
}

const BASE_TDS_CONFIG: Record<string, TdsConfig> = {
  "194A": {
    code: "194A",
    label: "194A – Interest other than securities",
    type: "TDS",
    baseRate: 0.1,
    noPanRate: 0.2,
    threshold: 5000,
    thresholdNote: "No TDS up to ₹5,000 (illustrative).",
    notes: "TODO: update for bank interest limits and special cases.",
  },
  "194C_IND": {
    code: "194C_IND",
    label: "194C – Contractor (Individual / HUF)",
    type: "TDS",
    baseRate: 0.01,
    noPanRate: 0.2,
    threshold: 30000,
    thresholdNote: "No TDS if single payment ≤ ₹30,000 (simplified).",
  },
  "194C_OTH": {
    code: "194C_OTH",
    label: "194C – Contractor (Others)",
    type: "TDS",
    baseRate: 0.02,
    noPanRate: 0.2,
    threshold: 30000,
    thresholdNote: "No TDS if single payment ≤ ₹30,000 (simplified).",
  },
  "194H": {
    code: "194H",
    label: "194H – Commission or Brokerage",
    type: "TDS",
    baseRate: 0.05,
    noPanRate: 0.2,
    threshold: 15000,
    thresholdNote: "No TDS if commission ≤ ₹15,000 (simplified).",
  },
  "194I_LAND": {
    code: "194I_LAND",
    label: "194I – Rent (Land & Building)",
    type: "TDS",
    baseRate: 0.1,
    noPanRate: 0.2,
    threshold: 240000,
    thresholdNote: "No TDS if annual rent ≤ ₹2,40,000 (simplified).",
  },
  "194I_PLANT": {
    code: "194I_PLANT",
    label: "194I – Rent (Plant & Machinery)",
    type: "TDS",
    baseRate: 0.02,
    noPanRate: 0.2,
    threshold: 240000,
    thresholdNote: "No TDS if annual rent ≤ ₹2,40,000 (simplified).",
  },
  "194J_PROF": {
    code: "194J_PROF",
    label: "194J – Professional fees",
    type: "TDS",
    baseRate: 0.1,
    noPanRate: 0.2,
    threshold: 30000,
    thresholdNote: "No TDS if fees ≤ ₹30,000 (simplified).",
  },
  "194J_TECH": {
    code: "194J_TECH",
    label: "194J – Technical services",
    type: "TDS",
    baseRate: 0.02,
    noPanRate: 0.2,
    threshold: 30000,
    thresholdNote: "No TDS if fees ≤ ₹30,000 (simplified).",
  },
  "194N": {
    code: "194N",
    label: "194N – Cash withdrawal",
    type: "TDS",
    baseRate: 0.02,
    noPanRate: 0.2,
    threshold: 10000000,
    thresholdNote: "No TDS up to ₹1 Cr withdrawal (simplified).",
  },
  "206C_1H": {
    code: "206C_1H",
    label: "206C(1H) – TCS on sale of goods",
    type: "TCS",
    baseRate: 0.001,
    noPanRate: 0.01,
    threshold: 5000000,
    thresholdNote: "Applies on receipts exceeding ₹50 lakh (simplified).",
  },
};

let tdsConfigStore: Record<string, TdsConfig> = { ...BASE_TDS_CONFIG };

export const listSections = (): TdsConfig[] => Object.values(tdsConfigStore).map((cfg) => ({ ...cfg }));

export const getSectionConfig = (code: string): TdsConfig | null =>
  tdsConfigStore[code] ? { ...tdsConfigStore[code] } : null;

export const resetToBaseConfig = (): void => {
  tdsConfigStore = { ...BASE_TDS_CONFIG };
};

export const updateSectionConfig = (
  code: string,
  partial: Partial<Omit<TdsConfig, "code">>,
): TdsConfig | null => {
  const existing = tdsConfigStore[code];
  if (!existing) return null;
  const updated: TdsConfig = { ...existing, ...partial };
  tdsConfigStore[code] = updated;
  return { ...updated };
};

export const computeTds = (sectionCode: string, amount: number, hasPAN: boolean): TdsResult => {
  const config =
    getSectionConfig(sectionCode) ??
    ({
      code: sectionCode,
      label: sectionCode,
      type: "TDS",
      baseRate: 0,
      noPanRate: 0,
      threshold: 0,
      thresholdNote: "Section not configured.",
    } satisfies TdsConfig);

  if (!config || amount <= 0) {
    return {
      config,
      amount,
      appliedRate: 0,
      tdsAmount: 0,
      netAmount: amount,
      isThresholdHit: false,
      message: amount <= 0 ? "Amount must be positive." : "Unknown section.",
    };
  }

  if (amount <= config.threshold) {
    return {
      config,
      amount,
      appliedRate: 0,
      tdsAmount: 0,
      netAmount: amount,
      isThresholdHit: true,
      message: `Within threshold – ${config.thresholdNote}`,
    };
  }

  let rate = config.baseRate;
  if (!hasPAN) rate = Math.max(config.baseRate, config.noPanRate);

  const tdsAmount = Math.round(amount * rate);
  const netAmount = config.type === "TCS" ? amount + tdsAmount : amount - tdsAmount;

  return {
    config,
    amount,
    appliedRate: rate,
    tdsAmount,
    netAmount,
    isThresholdHit: false,
    message: `${config.type} computed at ${(rate * 100).toFixed(2)}%`,
  };
};

export interface TdsDropdownOption {
  value: string;
  label: string;
}

export const getDropdownOptions = (): TdsDropdownOption[] =>
  listSections().map((cfg) => ({ value: cfg.code, label: cfg.label }));


