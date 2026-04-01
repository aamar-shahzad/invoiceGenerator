import { forwardRef } from 'react'
import { calcLineTotal, calculateTotals, formatCurrency } from '../lib/invoice'
import type { BusinessProfile, InvoiceDraft, InvoiceSettings } from '../types/invoice'

type InvoicePreviewProps = {
  business: BusinessProfile
  invoice: InvoiceDraft
  settings: InvoiceSettings
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ business, invoice, settings }, ref) => {
    const totals = calculateTotals(invoice)

    return (
      <section className="card">
        <h2>Preview</h2>

        <div className="preview" ref={ref}>
          <header className="preview-header">
            <div>
              <h1>{business.name || 'Your Business Name'}</h1>
              <p>{business.address || 'Business address'}</p>
              <p>{business.email || 'business@email.com'}</p>
              <p>{business.phone || '+1 000 000 0000'}</p>
            </div>
            <div className="right">
              <h2>INVOICE</h2>
              <p>No: {invoice.invoiceNumber}</p>
              <p>Issued: {invoice.issueDate}</p>
              <p>Due: {invoice.dueDate}</p>
            </div>
          </header>

          <section>
            <h3>Bill To</h3>
            <p>{invoice.customer.name || 'Customer name'}</p>
            <p>{invoice.customer.address || 'Customer address'}</p>
            <p>{invoice.customer.email || 'customer@email.com'}</p>
            <p>{invoice.customer.phone || '+1 000 000 0000'}</p>
          </section>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Period</th>
                <th>Hours</th>
                <th>Rate / Hour</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.description || '-'}</td>
                  <td>
                    {item.periodFrom} to {item.periodTo}
                  </td>
                  <td>{item.hours}</td>
                  <td>
                    {formatCurrency(item.hourlyRate, settings.currency, settings.locale)}
                  </td>
                  <td>
                    {formatCurrency(
                      calcLineTotal(item.hours, item.hourlyRate),
                      settings.currency,
                      settings.locale,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <p>
              <span>Subtotal</span>
              <strong>
                {formatCurrency(totals.subtotal, settings.currency, settings.locale)}
              </strong>
            </p>
            <p>
              <span>Tax - Ontario HST ({invoice.taxRate}%)</span>
              <strong>
                {formatCurrency(totals.taxAmount, settings.currency, settings.locale)}
              </strong>
            </p>
            <p className="grand-total">
              <span>Total</span>
              <strong>{formatCurrency(totals.total, settings.currency, settings.locale)}</strong>
            </p>
          </div>

          {invoice.notes ? (
            <section>
              <h3>Notes</h3>
              <p>{invoice.notes}</p>
            </section>
          ) : null}
        </div>
      </section>
    )
  },
)

InvoicePreview.displayName = 'InvoicePreview'

export default InvoicePreview
