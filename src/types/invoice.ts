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
  quantity: number
  unitPrice: number
}

export type InvoiceSettings = {
  currency: string
  locale: string
  defaultTaxRate: number
  defaultDiscount: number
  defaultCustomer: CustomerProfile
}

export type InvoiceDraft = {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  customer: CustomerProfile
  items: InvoiceLineItem[]
  taxRate: number
  discount: number
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
  defaultDiscount: 0,
  defaultCustomer: {
    name: '',
    address: '',
    email: '',
    phone: '',
  },
}

const today = new Date().toISOString().slice(0, 10)
const plus30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)

export const DEFAULT_INVOICE_DRAFT: InvoiceDraft = {
  invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  issueDate: today,
  dueDate: plus30Days,
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
      quantity: 1,
      unitPrice: 0,
    },
  ],
  taxRate: 13,
  discount: 0,
  notes: '',
}
