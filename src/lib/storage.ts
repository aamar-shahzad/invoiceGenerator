import {
  DEFAULT_BUSINESS_PROFILE,
  DEFAULT_INVOICE_DRAFT,
  DEFAULT_INVOICE_SETTINGS,
  type BusinessProfile,
  type InvoiceDraft,
  type InvoiceSettings,
} from '../types/invoice'

const BUSINESS_KEY = 'invoice-app:business'
const SETTINGS_KEY = 'invoice-app:settings'
const INVOICE_DRAFT_KEY = 'invoice-app:draft'

const safeRead = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback

    return { ...fallback, ...JSON.parse(item) }
  } catch {
    return fallback
  }
}

export const loadBusinessProfile = (): BusinessProfile =>
  safeRead(BUSINESS_KEY, DEFAULT_BUSINESS_PROFILE)

export const saveBusinessProfile = (profile: BusinessProfile): void => {
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(profile))
}

export const loadInvoiceSettings = (): InvoiceSettings => {
  const settings = safeRead(SETTINGS_KEY, DEFAULT_INVOICE_SETTINGS)
  return {
    ...DEFAULT_INVOICE_SETTINGS,
    ...settings,
    defaultCustomer: {
      ...DEFAULT_INVOICE_SETTINGS.defaultCustomer,
      ...(settings.defaultCustomer ?? {}),
    },
  }
}

export const saveInvoiceSettings = (settings: InvoiceSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const loadInvoiceDraft = (): InvoiceDraft => {
  const draft = safeRead(INVOICE_DRAFT_KEY, DEFAULT_INVOICE_DRAFT)
  return {
    ...DEFAULT_INVOICE_DRAFT,
    ...draft,
    customer: {
      ...DEFAULT_INVOICE_DRAFT.customer,
      ...(draft.customer ?? {}),
    },
    items:
      draft.items?.map((item) => ({
        id: item.id || crypto.randomUUID(),
        description: item.description ?? '',
        quantity: Number.isFinite(item.quantity) ? item.quantity : 1,
        unitPrice: Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
      })) ?? DEFAULT_INVOICE_DRAFT.items,
  }
}

export const saveInvoiceDraft = (invoice: InvoiceDraft): void => {
  localStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify(invoice))
}
