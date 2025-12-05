/**
 * tdsNri195.ts
 * ------------
 * Reusable helper utilities for Section 195 / non-resident TDS computations.
 *
 * ⚠️ IMPORTANT DISCLAIMER:
 * - All rates, thresholds and notes below are illustrative placeholders.
 * - Real-world NRI TDS requires analysing residential status, chargeability,
 *   applicable sections (195, 194E, 196D, etc.), DTAA provisions, surcharge,
 *   cess, Rule 37BB forms, TRC/ Form 10F, etc.
 * - Update this config with the latest Finance Act, Income-tax Rules, CBDT
 *   circulars and your own working papers before production use.
 * - This module intentionally keeps the logic simple so it can back calculators
 *   and dashboards; it is NOT a substitute for legal/tax advice.
 */

export type NriDeductionType = "TDS";

export type NriPaymentCategory =
  | "INTEREST_NRO"
  | "INTEREST_NRE"
  | "INTEREST_NRO_FD"
  | "DIVIDEND"
  | "ROYALTY"
  | "FTS"
  | "PROFESSIONAL_FEES"
  | "RENT_IMMOVABLE"
  | "PROPERTY_SALE"
  | "STCG_LISTED"
  | "LTCG_LISTED"
  | "OTHER_CAPITAL_GAIN"
  | "ANY_OTHER_INCOME";

export interface NriTdsConfig {
  code: string;
  section: string;
  label: string;
  category: NriPaymentCategory;
  type: NriDeductionType;
  baseRate: number;
  noPanRate: number;
  threshold?: number;
  thresholdNote?: string;
  notes?: string;
}

export interface NriTdsResult {
  config: NriTdsConfig;
  amount: number;
  appliedRate: number;
  tdsAmount: number;
  netAmount: number;
  isThresholdHit: boolean;
  message: string;
}

// TODO: Update all configurations with latest Finance Act / DTAA references before production use.
const BASE_NRI_TDS_CONFIG: Record<string, NriTdsConfig> = {
  NR_195_INT_NRO: {
    code: "NR_195_INT_NRO",
    section: "195 / 115A",
    label: "Interest (NRO account – non-resident)",
    category: "INTEREST_NRO",
    type: "TDS",
    baseRate: 0.3,
    noPanRate: 0.3,
    threshold: 0,
    thresholdNote: "Illustrative rate on interest payable to non-resident (excluding savings interest).",
    notes: "Update rate for specific instruments / treaty.",
  },
  NR_195_INT_NRE: {
    code: "NR_195_INT_NRE",
    section: "10(4) / 195",
    label: "Interest (NRE account – taxable portion)",
    category: "INTEREST_NRE",
    type: "TDS",
    baseRate: 0,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "Most NRE account interest is exempt; placeholder for exceptional cases.",
    notes: "Check exemption conditions u/s 10(4) & RBI rules.",
  },
  NR_195_DIVIDEND: {
    code: "NR_195_DIVIDEND",
    section: "195 / 115A",
    label: "Dividend to non-resident",
    category: "DIVIDEND",
    type: "TDS",
    baseRate: 0.2,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "Dividend rate depends on domestic law & DTAA – placeholder.",
  },
  NR_195_ROYALTY: {
    code: "NR_195_ROYALTY",
    section: "195 / 115A",
    label: "Royalty paid to non-resident",
    category: "ROYALTY",
    type: "TDS",
    baseRate: 0.1,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "Treaty may provide lower rate; update before use.",
  },
  NR_195_FTS: {
    code: "NR_195_FTS",
    section: "195 / 115A",
    label: "Fees for Technical Services (FTS)",
    category: "FTS",
    type: "TDS",
    baseRate: 0.1,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "Check DTAA Article for technical services; placeholder rate.",
  },
  NR_195_PROF: {
    code: "NR_195_PROF",
    section: "195",
    label: "Professional / consultancy fees to non-resident",
    category: "PROFESSIONAL_FEES",
    type: "TDS",
    baseRate: 0.2,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "",
  },
  NR_195_RENT: {
    code: "NR_195_RENT",
    section: "195",
    label: "Rent for immovable property (non-resident landlord)",
    category: "RENT_IMMOVABLE",
    type: "TDS",
    baseRate: 0.3,
    noPanRate: 0.3,
    threshold: 0,
    thresholdNote: "Often taxed at slab for NRIs – use actual computation in practice.",
  },
  NR_195_PROPERTY_SALE: {
    code: "NR_195_PROPERTY_SALE",
    section: "195 / 48 / 112 / 112A",
    label: "Sale of immovable property by NRI",
    category: "PROPERTY_SALE",
    type: "TDS",
    baseRate: 0.2,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "Actual rate depends on LTCG/STCG, indexation etc. Placeholder only.",
  },
  NR_195_STCG_LISTED: {
    code: "NR_195_STCG_LISTED",
    section: "195 / 111A",
    label: "STCG on listed equity/units (non-resident)",
    category: "STCG_LISTED",
    type: "TDS",
    baseRate: 0.15,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "",
  },
  NR_195_LTCG_LISTED: {
    code: "NR_195_LTCG_LISTED",
    section: "195 / 112A",
    label: "LTCG on listed equity/units (non-resident)",
    category: "LTCG_LISTED",
    type: "TDS",
    baseRate: 0.1,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "Ignores ₹1L exemption; placeholder only.",
  },
  NR_195_OTHER_CG: {
    code: "NR_195_OTHER_CG",
    section: "195 / 112",
    label: "Other capital gains (non-resident)",
    category: "OTHER_CAPITAL_GAIN",
    type: "TDS",
    baseRate: 0.2,
    noPanRate: 0.2,
    threshold: 0,
    thresholdNote: "Actual rate depends on nature of asset & holding period.",
  },
  NR_195_ANY_OTHER: {
    code: "NR_195_ANY_OTHER",
    section: "195",
    label: "Any other income to non-resident",
    category: "ANY_OTHER_INCOME",
    type: "TDS",
    baseRate: 0.3,
    noPanRate: 0.3,
    threshold: 0,
    thresholdNote: "",
    notes: "Generic catch-all. Override with specifics.",
  },
};

let nriTdsConfigStore: Record<string, NriTdsConfig> = { ...BASE_NRI_TDS_CONFIG };

export const listNriSections = (): NriTdsConfig[] => Object.values(nriTdsConfigStore).map((cfg) => ({ ...cfg }));

export const getNriSectionConfig = (code: string): NriTdsConfig | null =>
  nriTdsConfigStore[code] ? { ...nriTdsConfigStore[code] } : null;

export const resetNriConfigToBase = (): void => {
  nriTdsConfigStore = { ...BASE_NRI_TDS_CONFIG };
};

export const updateNriSectionConfig = (
  code: string,
  partial: Partial<Omit<NriTdsConfig, "code">>,
): NriTdsConfig | null => {
  const existing = nriTdsConfigStore[code];
  if (!existing) return null;
  const updated: NriTdsConfig = { ...existing, ...partial };
  nriTdsConfigStore[code] = updated;
  return { ...updated };
};

export const computeNriTds = (sectionCode: string, amount: number, hasPAN: boolean): NriTdsResult => {
  const config =
    getNriSectionConfig(sectionCode) ??
    ({
      code: sectionCode,
      section: "195",
      label: sectionCode,
      category: "ANY_OTHER_INCOME",
      type: "TDS",
      baseRate: 0,
      noPanRate: 0,
      threshold: 0,
    } satisfies NriTdsConfig);

  if (amount <= 0) {
    return {
      config,
      amount,
      appliedRate: 0,
      tdsAmount: 0,
      netAmount: amount,
      isThresholdHit: false,
      message: "Amount must be positive.",
    };
  }

  const threshold = config.threshold ?? 0;
  if (threshold > 0 && amount <= threshold) {
    return {
      config,
      amount,
      appliedRate: 0,
      tdsAmount: 0,
      netAmount: amount,
      isThresholdHit: true,
      message: `Within threshold. ${config.thresholdNote ?? ""}`,
    };
  }

  let rate = config.baseRate;
  if (!hasPAN) rate = Math.max(config.baseRate, config.noPanRate);

  const tdsAmount = Math.round(amount * rate);
  const netAmount = amount - tdsAmount;

  return {
    config,
    amount,
    appliedRate: rate,
    tdsAmount,
    netAmount,
    isThresholdHit: false,
    message: `TDS on NRI payment at ${(rate * 100).toFixed(2)}% (illustrative).`,
  };
};

export interface NriTdsDropdownOption {
  value: string;
  label: string;
  section: string;
  category: NriPaymentCategory;
}

export const getNriDropdownOptions = (): NriTdsDropdownOption[] =>
  listNriSections().map((cfg) => ({
    value: cfg.code,
    label: cfg.label,
    section: cfg.section,
    category: cfg.category,
  }));


