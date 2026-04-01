import type { InvoiceDraft, InvoiceTotals } from '../types/invoice'

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100

const safeNumber = (value: number): number =>
  Number.isFinite(value) ? Math.max(value, 0) : 0

export const calcLineTotal = (hours: number, hourlyRate: number): number =>
  roundMoney(safeNumber(hours) * safeNumber(hourlyRate))

export const calculateTotals = (invoice: InvoiceDraft): InvoiceTotals => {
  const subtotal = roundMoney(
    invoice.items.reduce(
      (sum, item) => sum + calcLineTotal(item.hours, item.hourlyRate),
      0,
    ),
  )
  const taxAmount = roundMoney((subtotal * safeNumber(invoice.taxRate)) / 100)

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
  }).format(safeNumber(value))
