import { useEffect, useMemo, useRef, useState } from "react";
import InvoiceEditor from "./components/InvoiceEditor";
import InvoicePreview from "./components/InvoicePreview";
import SettingsPanel from "./components/SettingsPanel";
import { calculateTotals, validateLineItem } from "./lib/invoice";
import { buildInvoicePdf } from "./lib/pdf";
import { canShareFiles, downloadFile, shareFile } from "./lib/share";
import {
  getNextInvoiceNumber,
  loadBusinessProfile,
  loadInvoiceDraft,
  loadInvoiceSettings,
  saveBusinessProfile,
  saveInvoiceDraft,
  saveInvoiceSettings,
} from "./lib/storage";
import type {
  BusinessProfile,
  CustomerProfile,
  InvoiceLineItem,
  InvoiceDraft,
  InvoiceSettings,
} from "./types/invoice";

type TabKey = "settings" | "invoice" | "preview";

const sameCustomer = (a: CustomerProfile, b: CustomerProfile): boolean =>
  a.name === b.name &&
  a.address === b.address &&
  a.email === b.email &&
  a.phone === b.phone;

const buildEmptyLineItem = (issueDate: string): InvoiceLineItem => ({
  id: crypto.randomUUID(),
  description: "",
  periodFrom: issueDate,
  periodTo: issueDate,
  hours: Number.NaN,
  hourlyRate: Number.NaN,
});

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("invoice");
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
    if (invoice.invoiceNumber.trim()) return;
    setInvoice((previous) => ({
      ...previous,
      invoiceNumber: getNextInvoiceNumber(),
    }));
  }, [invoice.invoiceNumber]);

  useEffect(() => {
    setInvoice((previous) => ({
      ...previous,
      taxRate: settings.defaultTaxRate,
    }));
  }, [settings.defaultTaxRate]);

  useEffect(() => {
    setInvoice((previous) => {
      const nextCustomer = {
        name: previous.customer.name || settings.defaultCustomer.name,
        address: previous.customer.address || settings.defaultCustomer.address,
        email: previous.customer.email || settings.defaultCustomer.email,
        phone: previous.customer.phone || settings.defaultCustomer.phone,
      };

      if (sameCustomer(previous.customer, nextCustomer)) {
        return previous;
      }

      return {
        ...previous,
        customer: nextCustomer,
      };
    });
  }, [settings.defaultCustomer]);

  useEffect(() => {
    setSettings((previous) => {
      if (sameCustomer(previous.defaultCustomer, invoice.customer)) {
        return previous;
      }

      return {
        ...previous,
        defaultCustomer: invoice.customer,
      };
    });
  }, [invoice.customer]);

  const totals = useMemo(() => calculateTotals(invoice), [invoice]);
  const lineItemErrorsById = useMemo(
    () =>
      Object.fromEntries(
        invoice.items.map((item) => [item.id, validateLineItem(item)]),
      ),
    [invoice.items],
  );
  const hasLineItemErrors = useMemo(
    () =>
      Object.values(lineItemErrorsById).some(
        (errors) => Object.keys(errors).length > 0,
      ),
    [lineItemErrorsById],
  );
  const hasValidLineItem = useMemo(
    () =>
      invoice.items.some(
        (item) =>
          Number.isFinite(item.hours) &&
          item.hours > 0 &&
          Number.isFinite(item.hourlyRate) &&
          item.hourlyRate >= 0,
      ),
    [invoice.items],
  );
  const canExport = Boolean(
    business.name && invoice.customer.name && hasValidLineItem && !hasLineItemErrors,
  );

  const createPdf = async (): Promise<File | null> => {
    if (!previewRef.current) return null;
    if (!canExport) {
      setStatusMessage(
        "Please complete business name, customer name, and at least one valid line item.",
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

  const handleNewInvoice = () => {
    const today = new Date().toISOString().slice(0, 10);
    setInvoice((previous) => ({
      ...previous,
      invoiceNumber: getNextInvoiceNumber(),
      issueDate: today,
      customer: settings.defaultCustomer,
      items: [buildEmptyLineItem(today)],
      taxRate: settings.defaultTaxRate,
      notes: "",
    }));
    setActiveTab("invoice");
    setStatusMessage("Started a new invoice.");
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
          onBusinessChange={setBusiness}
          onSettingsChange={setSettings}
        />
      ) : null}

      {activeTab === "invoice" ? (
        <>
          <section className="card action-bar">
            <div>
              <strong>Invoice Editor</strong>
            </div>
            <div className="action-buttons">
              <button className="ghost" type="button" onClick={handleNewInvoice}>
                New Invoice
              </button>
            </div>
          </section>
          <InvoiceEditor
            invoice={invoice}
            onChange={setInvoice}
            errorsByItem={lineItemErrorsById}
          />
        </>
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
            <div className="action-buttons">
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
