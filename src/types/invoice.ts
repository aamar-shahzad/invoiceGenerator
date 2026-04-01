export type BusinessProfile = {
  name: string
  address: string
  email: string
  phone: string
}

export type CustomerProfile = {
  name: string
  address: string
  email: string
  phone: string
}

export type InvoiceLineItem = {
  id: string
  description: string
  periodFrom: string
  periodTo: string
  hours: number
  hourlyRate: number
}

export type InvoiceSettings = {
  currency: string
  locale: string
  defaultTaxRate: number
  defaultCustomer: CustomerProfile
}

export type InvoiceDraft = {
  invoiceNumber: string
  issueDate: string
  customer: CustomerProfile
  items: InvoiceLineItem[]
  taxRate: number
  notes: string
}

export type InvoiceTotals = {
  subtotal: number
  taxAmount: number
  total: number
}

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: '',
  address: '',
  email: '',
  phone: '',
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  currency: 'CAD',
  locale: 'en-CA',
  defaultTaxRate: 13,
  defaultCustomer: {
    name: '',
    address: '',
    email: '',
    phone: '',
  },
}

const today = new Date().toISOString().slice(0, 10)

export const DEFAULT_INVOICE_DRAFT: InvoiceDraft = {
  invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  issueDate: today,
  customer: {
    name: '',
    address: '',
    email: '',
    phone: '',
  },
  items: [
    {
      id: crypto.randomUUID(),
      description: '',
      periodFrom: today,
      periodTo: today,
      hours: Number.NaN,
      hourlyRate: Number.NaN,
    },
  ],
  taxRate: 13,
  notes: '',
}
