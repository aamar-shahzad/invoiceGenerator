import type { InvoiceDraft, InvoiceTotals } from '../types/invoice'

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100

export const calcLineTotal = (quantity: number, unitPrice: number): number =>
  roundMoney(quantity * unitPrice)

export const calculateTotals = (invoice: InvoiceDraft): InvoiceTotals => {
  const subtotal = roundMoney(
    invoice.items.reduce(
      (sum, item) => sum + calcLineTotal(item.quantity, item.unitPrice),
      0,
    ),
  )
  const discountAmount = roundMoney((subtotal * Math.max(invoice.discount, 0)) / 100)
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = roundMoney((taxableAmount * Math.max(invoice.taxRate, 0)) / 100)

  return {
    subtotal,
    taxAmount,
    total: roundMoney(taxableAmount + taxAmount),
  }
}

export const formatCurrency = (
  value: number,
  currency: string,
  locale: string,
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
