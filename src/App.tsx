import { useEffect, useMemo, useRef, useState } from "react";
import InvoiceEditor from "./components/InvoiceEditor";
import InvoicePreview from "./components/InvoicePreview";
import SettingsPanel from "./components/SettingsPanel";
import { calculateTotals } from "./lib/invoice";
import { buildInvoicePdf } from "./lib/pdf";
import { canShareFiles, downloadFile, shareFile } from "./lib/share";
import {
  loadBusinessProfile,
  loadInvoiceDraft,
  loadInvoiceSettings,
  saveBusinessProfile,
  saveInvoiceDraft,
  saveInvoiceSettings,
} from "./lib/storage";
import type {
  BusinessProfile,
  InvoiceDraft,
  InvoiceSettings,
} from "./types/invoice";

type TabKey = "settings" | "invoice" | "preview";

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("settings");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [lastPdfFile, setLastPdfFile] = useState<File | null>(null);
  const [business, setBusiness] = useState<BusinessProfile>(() =>
    loadBusinessProfile(),
  );
  const [settings, setSettings] = useState<InvoiceSettings>(() =>
    loadInvoiceSettings(),
  );
  const [invoice, setInvoice] = useState<InvoiceDraft>(() =>
    loadInvoiceDraft(),
  );
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveBusinessProfile(business);
  }, [business]);

  useEffect(() => {
    setSettings((previous) => ({
      ...previous,
      currency: "CAD",
      locale: "en-CA",
      defaultTaxRate: previous.defaultTaxRate || 13,
      defaultCustomer: previous.defaultCustomer ?? {
        name: "",
        address: "",
        email: "",
        phone: "",
      },
    }));
  }, []);

  useEffect(() => {
    saveInvoiceSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveInvoiceDraft(invoice);
  }, [invoice]);

  useEffect(() => {
    setInvoice((previous) => ({
      ...previous,
      taxRate: settings.defaultTaxRate,
      discount: settings.defaultDiscount,
    }));
  }, [settings.defaultDiscount, settings.defaultTaxRate]);

  useEffect(() => {
    setInvoice((previous) => ({
      ...previous,
      customer: {
        name: previous.customer.name || settings.defaultCustomer.name,
        address: previous.customer.address || settings.defaultCustomer.address,
        email: previous.customer.email || settings.defaultCustomer.email,
        phone: previous.customer.phone || settings.defaultCustomer.phone,
      },
    }));
  }, [settings.defaultCustomer]);

  const totals = useMemo(() => calculateTotals(invoice), [invoice]);
  const canExport = Boolean(
    business.name && invoice.customer.name && invoice.items.length > 0,
  );

  const createPdf = async (): Promise<File | null> => {
    if (!previewRef.current) return null;
    if (!canExport) {
      setStatusMessage(
        "Please complete business name, customer name, and one line item.",
      );
      return null;
    }

    try {
      setBusy(true);
      setStatusMessage("Generating PDF...");
      const file = await buildInvoicePdf(
        previewRef.current,
        invoice.invoiceNumber || "invoice",
      );
      setLastPdfFile(file);
      return file;
    } catch {
      setStatusMessage("Unable to export right now. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    const file = (await createPdf()) ?? lastPdfFile;
    if (!file) return;

    downloadFile(file);
    setStatusMessage("Invoice exported and downloaded.");
  };

  const handleSharePdf = async () => {
    const file = (await createPdf()) ?? lastPdfFile;
    if (!file) return;

    try {
      if (!canShareFiles(file)) {
        downloadFile(file);
        setStatusMessage(
          "Sharing is unavailable here. Invoice downloaded instead.",
        );
        return;
      }

      await shareFile(file, `Invoice ${invoice.invoiceNumber}`);
      setStatusMessage("Invoice shared.");
    } catch {
      setStatusMessage("Unable to share right now.");
    }
  };

  return (
    <main className="app-shell">
      <header>
        <h1>Invoice Generator</h1>
        <p>Create, export, and share invoices from your phone or desktop.</p>
      </header>

      <nav className="tabs" aria-label="Invoice sections">
        <button
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
        <button
          className={activeTab === "invoice" ? "active" : ""}
          onClick={() => setActiveTab("invoice")}
        >
          Invoice
        </button>
        <button
          className={activeTab === "preview" ? "active" : ""}
          onClick={() => setActiveTab("preview")}
        >
          Preview & Export
        </button>
      </nav>

      {activeTab === "settings" ? (
        <SettingsPanel
          business={business}
          settings={settings}
          customerDefaults={settings.defaultCustomer}
          onBusinessChange={setBusiness}
          onSettingsChange={setSettings}
          onCustomerDefaultsChange={(nextCustomer) =>
            setSettings((previous) => ({
              ...previous,
              defaultCustomer: nextCustomer,
            }))
          }
        />
      ) : null}

      {activeTab === "invoice" ? (
        <InvoiceEditor invoice={invoice} onChange={setInvoice} />
      ) : null}

      {activeTab === "preview" ? (
        <>
          <InvoicePreview
            business={business}
            invoice={invoice}
            settings={settings}
            ref={previewRef}
          />
          <section className="card action-bar">
            <div>
              <p>
                <strong>Total: </strong>
                {new Intl.NumberFormat(settings.locale, {
                  style: "currency",
                  currency: settings.currency,
                }).format(totals.total)}
              </p>
              {statusMessage ? <p className="muted">{statusMessage}</p> : null}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button disabled={busy} onClick={handleDownloadPdf}>
                {busy ? "Working..." : "Export & Download PDF"}
              </button>
              <button
                className="ghost"
                disabled={busy}
                onClick={handleSharePdf}
              >
                Share PDF
              </button>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default App;
