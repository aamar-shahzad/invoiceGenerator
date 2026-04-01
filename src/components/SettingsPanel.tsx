import type { BusinessProfile, InvoiceSettings } from '../types/invoice'

type SettingsPanelProps = {
  business: BusinessProfile
  settings: InvoiceSettings
  onBusinessChange: (next: BusinessProfile) => void
  onSettingsChange: (next: InvoiceSettings) => void
}

function SettingsPanel({
  business,
  settings,
  onBusinessChange,
  onSettingsChange,
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
          Tax ID
          <input
            value={business.taxId}
            onChange={(event) =>
              onBusinessChange({ ...business, taxId: event.target.value })
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
          Website
          <input
            value={business.website}
            onChange={(event) =>
              onBusinessChange({ ...business, website: event.target.value })
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
          <input
            value={settings.currency}
            maxLength={3}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                currency: event.target.value.toUpperCase(),
              })
            }
          />
        </label>
        <label>
          Locale
          <input
            value={settings.locale}
            placeholder="en-US"
            onChange={(event) =>
              onSettingsChange({ ...settings, locale: event.target.value })
            }
          />
        </label>
        <label>
          Default Tax %
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
    </section>
  )
}

export default SettingsPanel
