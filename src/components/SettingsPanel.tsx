import type { BusinessProfile, CustomerProfile, InvoiceSettings } from '../types/invoice'

type SettingsPanelProps = {
  business: BusinessProfile
  settings: InvoiceSettings
  customerDefaults: CustomerProfile
  onBusinessChange: (next: BusinessProfile) => void
  onSettingsChange: (next: InvoiceSettings) => void
  onCustomerDefaultsChange: (next: CustomerProfile) => void
}

function SettingsPanel({
  business,
  settings,
  customerDefaults,
  onBusinessChange,
  onSettingsChange,
  onCustomerDefaultsChange,
}: SettingsPanelProps) {
  return (
    <section className="card">
      <h2>Business Settings</h2>
      <p className="muted">Saved on your device and editable anytime.</p>

      <div className="grid">
        <label>
          Business Name
          <input
            value={business.name}
            onChange={(event) =>
              onBusinessChange({ ...business, name: event.target.value })
            }
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={business.email}
            onChange={(event) =>
              onBusinessChange({ ...business, email: event.target.value })
            }
          />
        </label>
        <label>
          Phone
          <input
            value={business.phone}
            onChange={(event) =>
              onBusinessChange({ ...business, phone: event.target.value })
            }
          />
        </label>
        <label className="span-2">
          Address
          <textarea
            rows={3}
            value={business.address}
            onChange={(event) =>
              onBusinessChange({ ...business, address: event.target.value })
            }
          />
        </label>
      </div>

      <h3>Defaults</h3>
      <div className="grid">
        <label>
          Currency
          <input value="CAD" disabled />
        </label>
        <label>
          Tax Region
          <input value="Ontario (HST)" disabled />
        </label>
        <label>
          Default Tax % (Ontario HST)
          <input
            type="number"
            min={0}
            step="0.01"
            value={settings.defaultTaxRate}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                defaultTaxRate: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          Default Discount %
          <input
            type="number"
            min={0}
            step="0.01"
            value={settings.defaultDiscount}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                defaultDiscount: Number(event.target.value),
              })
            }
          />
        </label>
      </div>

      <h3>Default Customer (Bill To)</h3>
      <p className="muted">Auto-filled in invoice customer details.</p>
      <div className="grid">
        <label>
          Customer Name
          <input
            value={customerDefaults.name}
            onChange={(event) =>
              onCustomerDefaultsChange({
                ...customerDefaults,
                name: event.target.value,
              })
            }
          />
        </label>
        <label>
          Customer Email
          <input
            type="email"
            value={customerDefaults.email}
            onChange={(event) =>
              onCustomerDefaultsChange({
                ...customerDefaults,
                email: event.target.value,
              })
            }
          />
        </label>
        <label>
          Customer Phone
          <input
            value={customerDefaults.phone}
            onChange={(event) =>
              onCustomerDefaultsChange({
                ...customerDefaults,
                phone: event.target.value,
              })
            }
          />
        </label>
        <label className="span-2">
          Customer Address
          <textarea
            rows={3}
            value={customerDefaults.address}
            onChange={(event) =>
              onCustomerDefaultsChange({
                ...customerDefaults,
                address: event.target.value,
              })
            }
          />
        </label>
      </div>
    </section>
  )
}

export default SettingsPanel
