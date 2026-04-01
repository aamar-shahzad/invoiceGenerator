import { useEffect, useMemo, useRef, useState } from 'react'
import InvoiceEditor from './components/InvoiceEditor'
import InvoicePreview from './components/InvoicePreview'
import SettingsPanel from './components/SettingsPanel'
import { calculateTotals } from './lib/invoice'
import { buildInvoicePdf } from './lib/pdf'
import { shareOrDownloadFile } from './lib/share'
import {
  loadBusinessProfile,
  loadInvoiceDraft,
  loadInvoiceSettings,
  saveBusinessProfile,
  saveInvoiceDraft,
  saveInvoiceSettings,
} from './lib/storage'
import type { BusinessProfile, InvoiceDraft, InvoiceSettings } from './types/invoice'

type TabKey = 'settings' | 'invoice' | 'preview'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('settings')
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [business, setBusiness] = useState<BusinessProfile>(() => loadBusinessProfile())
  const [settings, setSettings] = useState<InvoiceSettings>(() => loadInvoiceSettings())
  const [invoice, setInvoice] = useState<InvoiceDraft>(() => loadInvoiceDraft())
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    saveBusinessProfile(business)
  }, [business])

  useEffect(() => {
    saveInvoiceSettings(settings)
  }, [settings])

  useEffect(() => {
    saveInvoiceDraft(invoice)
  }, [invoice])

  useEffect(() => {
    setInvoice((previous) => ({
      ...previous,
      taxRate: settings.defaultTaxRate,
      discount: settings.defaultDiscount,
    }))
  }, [settings.defaultDiscount, settings.defaultTaxRate])

  const totals = useMemo(() => calculateTotals(invoice), [invoice])
  const canExport = Boolean(business.name && invoice.customer.name && invoice.items.length > 0)

  const handleExportAndShare = async () => {
    if (!previewRef.current) return
    if (!canExport) {
      setStatusMessage('Please complete business name, customer name, and one line item.')
      return
    }

    try {
      setBusy(true)
      setStatusMessage('Generating PDF...')
      const file = await buildInvoicePdf(previewRef.current, invoice.invoiceNumber || 'invoice')
      const result = await shareOrDownloadFile(file, `Invoice ${invoice.invoiceNumber}`)
      setStatusMessage(result === 'shared' ? 'Invoice shared.' : 'Invoice downloaded.')
    } catch {
      setStatusMessage('Unable to export right now. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="app-shell">
      <header>
        <h1>Invoice Generator</h1>
        <p>Create, export, and share invoices from your phone or desktop.</p>
      </header>

      <nav className="tabs" aria-label="Invoice sections">
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={activeTab === 'invoice' ? 'active' : ''}
          onClick={() => setActiveTab('invoice')}
        >
          Invoice
        </button>
        <button
          className={activeTab === 'preview' ? 'active' : ''}
          onClick={() => setActiveTab('preview')}
        >
          Preview & Export
        </button>
      </nav>

      {activeTab === 'settings' ? (
        <SettingsPanel
          business={business}
          settings={settings}
          onBusinessChange={setBusiness}
          onSettingsChange={setSettings}
        />
      ) : null}

      {activeTab === 'invoice' ? (
        <InvoiceEditor invoice={invoice} onChange={setInvoice} />
      ) : null}

      {activeTab === 'preview' ? (
        <>
          <InvoicePreview business={business} invoice={invoice} settings={settings} ref={previewRef} />
          <section className="card action-bar">
            <div>
              <p>
                <strong>Total: </strong>
                {new Intl.NumberFormat(settings.locale, {
                  style: 'currency',
                  currency: settings.currency,
                }).format(totals.total)}
              </p>
              {statusMessage ? <p className="muted">{statusMessage}</p> : null}
            </div>
            <button disabled={busy} onClick={handleExportAndShare}>
              {busy ? 'Working...' : 'Export PDF & Share'}
            </button>
          </section>
        </>
      ) : null}
    </main>
  )
}

export default App
