import type { InvoiceDraft } from '../types/invoice'

type InvoiceEditorProps = {
  invoice: InvoiceDraft
  onChange: (next: InvoiceDraft) => void
}

function InvoiceEditor({ invoice, onChange }: InvoiceEditorProps) {
  const updateItem = (
    id: string,
    key: 'description' | 'quantity' | 'unitPrice',
    value: string,
  ) => {
    const nextItems = invoice.items.map((item) => {
      if (item.id !== id) return item
      if (key === 'description') return { ...item, description: value }
      return { ...item, [key]: Number(value) }
    })
    onChange({ ...invoice, items: nextItems })
  }

  const addItem = () => {
    onChange({
      ...invoice,
      items: [
        ...invoice.items,
        { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
      ],
    })
  }

  const removeItem = (id: string) => {
    const nextItems = invoice.items.filter((item) => item.id !== id)
    onChange({
      ...invoice,
      items: nextItems.length
        ? nextItems
        : [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }],
    })
  }

  return (
    <section className="card">
      <h2>Invoice</h2>
      <div className="grid">
        <label>
          Invoice No.
          <input
            value={invoice.invoiceNumber}
            onChange={(event) =>
              onChange({ ...invoice, invoiceNumber: event.target.value })
            }
          />
        </label>
        <label>
          Issue Date
          <input
            type="date"
            value={invoice.issueDate}
            onChange={(event) => onChange({ ...invoice, issueDate: event.target.value })}
          />
        </label>
        <label>
          Due Date
          <input
            type="date"
            value={invoice.dueDate}
            onChange={(event) => onChange({ ...invoice, dueDate: event.target.value })}
          />
        </label>
      </div>

      <h3>Bill To</h3>
      <div className="grid">
        <label>
          Customer Name
          <input
            value={invoice.customer.name}
            onChange={(event) =>
              onChange({
                ...invoice,
                customer: { ...invoice.customer, name: event.target.value },
              })
            }
          />
        </label>
        <label>
          Customer Email
          <input
            type="email"
            value={invoice.customer.email}
            onChange={(event) =>
              onChange({
                ...invoice,
                customer: { ...invoice.customer, email: event.target.value },
              })
            }
          />
        </label>
        <label>
          Customer Phone
          <input
            value={invoice.customer.phone}
            onChange={(event) =>
              onChange({
                ...invoice,
                customer: { ...invoice.customer, phone: event.target.value },
              })
            }
          />
        </label>
        <label className="span-2">
          Customer Address
          <textarea
            rows={3}
            value={invoice.customer.address}
            onChange={(event) =>
              onChange({
                ...invoice,
                customer: { ...invoice.customer, address: event.target.value },
              })
            }
          />
        </label>
      </div>

      <h3>Line Items</h3>
      <div className="items">
        {invoice.items.map((item) => (
          <div key={item.id} className="item-row">
            <input
              placeholder="Description"
              value={item.description}
              onChange={(event) => updateItem(item.id, 'description', event.target.value)}
            />
            <input
              type="number"
              min={0}
              step="1"
              value={item.quantity}
              onChange={(event) => updateItem(item.id, 'quantity', event.target.value)}
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.unitPrice}
              onChange={(event) => updateItem(item.id, 'unitPrice', event.target.value)}
            />
            <button type="button" className="ghost danger" onClick={() => removeItem(item.id)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="ghost" onClick={addItem}>
          + Add Item
        </button>
      </div>

      <div className="grid">
        <label>
          Tax %
          <input
            type="number"
            min={0}
            step="0.01"
            value={invoice.taxRate}
            onChange={(event) =>
              onChange({ ...invoice, taxRate: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Discount %
          <input
            type="number"
            min={0}
            step="0.01"
            value={invoice.discount}
            onChange={(event) =>
              onChange({ ...invoice, discount: Number(event.target.value) })
            }
          />
        </label>
        <label className="span-2">
          Notes
          <textarea
            rows={3}
            value={invoice.notes}
            onChange={(event) => onChange({ ...invoice, notes: event.target.value })}
          />
        </label>
      </div>
    </section>
  )
}

export default InvoiceEditor
