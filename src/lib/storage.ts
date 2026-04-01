import {
  DEFAULT_BUSINESS_PROFILE,
  DEFAULT_INVOICE_DRAFT,
  DEFAULT_INVOICE_SETTINGS,
  type BusinessProfile,
  type InvoiceDraft,
  type InvoiceLineItem,
  type InvoiceSettings,
} from "../types/invoice";

const BUSINESS_KEY = "invoice-app:business";
const SETTINGS_KEY = "invoice-app:settings";
const INVOICE_DRAFT_KEY = "invoice-app:draft";
const INVOICE_SEQUENCE_KEY = "invoice-app:invoice-sequence";

const safeRead = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;

    return { ...fallback, ...JSON.parse(item) };
  } catch {
    return fallback;
  }
};

const toNumberOr = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const loadBusinessProfile = (): BusinessProfile =>
  safeRead(BUSINESS_KEY, DEFAULT_BUSINESS_PROFILE);

export const saveBusinessProfile = (profile: BusinessProfile): void => {
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(profile));
};

export const loadInvoiceSettings = (): InvoiceSettings => {
  const settings = safeRead(SETTINGS_KEY, DEFAULT_INVOICE_SETTINGS);
  return {
    ...DEFAULT_INVOICE_SETTINGS,
    ...settings,
    defaultCustomer: {
      ...DEFAULT_INVOICE_SETTINGS.defaultCustomer,
      ...(settings.defaultCustomer ?? {}),
    },
  };
};

export const saveInvoiceSettings = (settings: InvoiceSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadInvoiceDraft = (): InvoiceDraft => {
  const draft = safeRead(INVOICE_DRAFT_KEY, DEFAULT_INVOICE_DRAFT);
  type LegacyInvoiceLineItem = InvoiceLineItem & {
    quantity?: number;
    unitPrice?: number;
  };

  const legacyItems = (draft.items ?? []) as LegacyInvoiceLineItem[];

  return {
    ...DEFAULT_INVOICE_DRAFT,
    ...draft,
    customer: {
      ...DEFAULT_INVOICE_DRAFT.customer,
      ...(draft.customer ?? {}),
    },
    items: legacyItems.length
      ? legacyItems.map((item) => ({
          id: item.id || crypto.randomUUID(),
          description: item.description ?? "",
          periodFrom:
            typeof item.periodFrom === "string"
              ? item.periodFrom
              : DEFAULT_INVOICE_DRAFT.items[0].periodFrom,
          periodTo:
            typeof item.periodTo === "string"
              ? item.periodTo
              : DEFAULT_INVOICE_DRAFT.items[0].periodTo,
          hours: toNumberOr(item.hours, toNumberOr(item.quantity, Number.NaN)),
          hourlyRate: toNumberOr(
            item.hourlyRate,
            toNumberOr(item.unitPrice, Number.NaN),
          ),
        }))
      : DEFAULT_INVOICE_DRAFT.items,
  };
};

export const saveInvoiceDraft = (invoice: InvoiceDraft): void => {
  localStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify(invoice));
};

export const getNextInvoiceNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const yearKey = `${INVOICE_SEQUENCE_KEY}:${currentYear}`;
  const currentValue = Number(localStorage.getItem(yearKey) ?? "0");
  const nextValue = Number.isFinite(currentValue) ? currentValue + 1 : 1;
  localStorage.setItem(yearKey, String(nextValue));

  return `INV-${currentYear}-${String(nextValue).padStart(3, "0")}`;
};
