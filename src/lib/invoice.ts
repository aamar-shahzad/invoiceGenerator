import type { InvoiceDraft, InvoiceLineItem, InvoiceTotals } from '../types/invoice'

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

export type LineItemErrors = {
  description?: string
  period?: string
  hours?: string
  hourlyRate?: string
}

export const validateLineItem = (item: InvoiceLineItem): LineItemErrors => {
  const errors: LineItemErrors = {}

  if (!item.description.trim()) {
    errors.description = 'Description is required.'
  }

  if (!item.periodFrom || !item.periodTo) {
    errors.period = 'From and To dates are required.'
  } else if (item.periodFrom > item.periodTo) {
    errors.period = 'From date cannot be after To date.'
  }

  if (!Number.isFinite(item.hours) || item.hours <= 0) {
    errors.hours = 'Hours must be greater than 0.'
  }

  if (!Number.isFinite(item.hourlyRate) || item.hourlyRate < 0) {
    errors.hourlyRate = 'Rate must be 0 or more.'
  }

  return errors
}
