import type { InvoiceDraft, InvoiceTotals } from '../types/invoice'

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100

export const calcLineTotal = (hours: number, hourlyRate: number): number =>
  roundMoney(hours * hourlyRate)

export const calculateTotals = (invoice: InvoiceDraft): InvoiceTotals => {
  const subtotal = roundMoney(
    invoice.items.reduce(
      (sum, item) => sum + calcLineTotal(item.hours, item.hourlyRate),
      0,
    ),
  )
  const taxAmount = roundMoney((subtotal * Math.max(invoice.taxRate, 0)) / 100)

  return {
    subtotal,
    taxAmount,
    total: roundMoney(subtotal + taxAmount),
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
