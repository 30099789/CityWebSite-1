// XmlManager.jsx — Sprint 3 Week 10/11
// Assessment requirement: Staff can import/export XML data
// Export: fetches live data from MongoDB and downloads as XML
// Import: parses uploaded XML and POSTs each record to the real API
import { useState, useRef } from "react";
import AdminNav from "../../components/AdminNav";
import BASE_URL from "../../services/api";

// ── XML builder ────────────────────────────────────────────────────────────────
function toXml(obj, tag) {
  if (Array.isArray(obj)) return obj.map((item) => toXml(item, tag.replace(/s$/, ""))).join("\n");
  if (typeof obj === "object" && obj !== null) {
    const inner = Object.entries(obj)
      .filter(([k]) => !["__v"].includes(k))
      .map(([k, v]) => toXml(v, k))
      .join("");
    return `<${tag}>${inner}</${tag}>`;
  }
  return `<${tag}>${String(obj ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</${tag}>`;
}

function buildXML(data) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<citylink>\n` +
    `  <events>\n${toXml(data.events, "events")}\n  </events>\n` +
    `  <announcements>\n${toXml(data.announcements, "announcements")}\n  </announcements>\n` +
    `  <services>\n${toXml(data.services, "services")}\n  </services>\n` +
    `  <bookings>\n${toXml(data.bookings, "bookings")}\n  </bookings>\n` +
    `  <feedback>\n${toXml(data.feedback, "feedback")}\n  </feedback>\n` +
    `</citylink>`
  );
}

// ── XML parser ─────────────────────────────────────────────────────────────────
function parseXMLItems(doc, tag) {
  return Array.from(doc.getElementsByTagName(tag)).map((el) => {
    const obj = {};
    Array.from(el.children).forEach((child) => {
      obj[child.tagName] = child.textContent;
    });
    return obj;
  });
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function XmlManager() {
  const fileRef = useRef();
  const [exporting, setExporting]   = useState(false);
  const [importing, setImporting]   = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [toast, setToast]           = useState(null);
  const [preview, setPreview]       = useState(null); // parsed XML preview before confirming import
  const [pendingData, setPendingData] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ── EXPORT ──────────────────────────────────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    try {
      const [evRes, anRes, svRes, bkRes, fbRes] = await Promise.all([
        fetch(`${BASE_URL}/events`),
        fetch(`${BASE_URL}/announcements`),
        fetch(`${BASE_URL}/services`),
        fetch(`${BASE_URL}/bookings`),
        fetch(`${BASE_URL}/feedback`),
      ]);

      const data = {
        events:        evRes.ok ? await evRes.json() : [],
        announcements: anRes.ok ? await anRes.json() : [],
        services:      svRes.ok ? await svRes.json() : [],
        bookings:      bkRes.ok ? await bkRes.json() : [],
        feedback:      fbRes.ok ? await fbRes.json() : [],
      };

      const xml  = buildXML(data);
      const blob = new Blob([xml], { type: "application/xml" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `citylink-export-${new Date().toISOString().slice(0, 10)}.xml`;
      a.click();
      URL.revokeObjectURL(url);

      showToast(`Exported ${data.events.length} events, ${data.announcements.length} announcements, ${data.services.length} services, ${data.bookings.length} bookings, ${data.feedback.length} feedback.`);
    } catch (err) {
      showToast("Export failed. Make sure the server is running.", "error");
    } finally {
      setExporting(false);
    }
  }

  // ── IMPORT: parse and preview ─────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(ev.target.result, "application/xml");
        const parseError = doc.querySelector("parsererror");
        if (parseError) throw new Error("Invalid XML");

        const parsed = {
          events:        parseXMLItems(doc, "event"),
          announcements: parseXMLItems(doc, "announcement"),
          services:      parseXMLItems(doc, "service"),
          bookings:      parseXMLItems(doc, "booking"),
          feedback:      parseXMLItems(doc, "feedbackItem"),
        };

        setPendingData(parsed);
        setPreview({
          events:        parsed.events.length,
          announcements: parsed.announcements.length,
          services:      parsed.services.length,
          bookings:      parsed.bookings.length,
          feedback:      parsed.feedback.length,
        });
        setImportResult(null);
      } catch {
        showToast("Invalid XML file. Please use a CityLink export file.", "error");
      }
    };
    reader.readAsText(file);
  }

  // ── IMPORT: confirm and POST to API ───────────────────────────────────────
  async function confirmImport() {
    if (!pendingData) return;
    setImporting(true);
    const results = { success: 0, failed: 0, collections: {} };

    async function importCollection(items, endpoint, label) {
      let ok = 0, fail = 0;
      for (const item of items) {
        // Remove _id and __v so MongoDB creates new documents
        const { _id, __v, ...clean } = item;
        try {
          const res = await fetch(`${BASE_URL}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clean),
          });
          res.ok ? ok++ : fail++;
        } catch { fail++; }
      }
      results.collections[label] = { ok, fail };
      results.success += ok;
      results.failed  += fail;
    }

    try {
      if (pendingData.events.length)        await importCollection(pendingData.events,        "events",        "Events");
      if (pendingData.announcements.length) await importCollection(pendingData.announcements, "announcements", "Announcements");
      if (pendingData.services.length)      await importCollection(pendingData.services,      "services",      "Services");
      if (pendingData.bookings.length)      await importCollection(pendingData.bookings,      "bookings",      "Bookings");
      if (pendingData.feedback.length)      await importCollection(pendingData.feedback,      "feedback",      "Feedback");

      setImportResult(results);
      setPreview(null);
      setPendingData(null);
      showToast(`Import complete — ${results.success} records added.${results.failed > 0 ? ` ${results.failed} failed.` : ""}`, results.failed > 0 ? "error" : "success");
    } catch {
      showToast("Import failed. Please try again.", "error");
    } finally {
      setImporting(false);
    }
  }

  function cancelImport() {
    setPreview(null);
    setPendingData(null);
  }

  const COLS = [
    { key: "events",        label: "Events",        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "announcements", label: "Announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
    { key: "services",      label: "Services",      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { key: "bookings",      label: "Bookings",      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { key: "feedback",      label: "Feedback",      icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="XML Import / Export" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>{toast.msg}</div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">XML Data Manager</h1>
          <p className="text-sm text-slate-500">Export live database records as XML, or import XML files to add records to the database.</p>
        </div>

        {/* Export card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Export Data</h2>
              <p className="text-sm text-slate-500">Downloads all current database records as a single XML file. Use this to back up data or share with others.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
            {COLS.map(({ key, label, icon }) => (
              <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-center">
                <svg className="w-4 h-4 text-slate-400 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <p className="text-xs font-semibold text-slate-600">{label}</p>
              </div>
            ))}
          </div>

          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {exporting ? "Exporting…" : "Export as XML"}
          </button>
        </div>

        {/* Import card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Import Data</h2>
              <p className="text-sm text-slate-500">Upload a CityLink XML export file. Records will be added to the database — existing records are not overwritten.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
          </div>

          {/* File picker */}
          <input ref={fileRef} type="file" accept=".xml,application/xml" onChange={handleFileChange} className="hidden" />

          {!preview ? (
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Choose XML File
            </button>
          ) : (
            // Preview before confirming
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">File contents detected</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {COLS.map(({ key, label }) => (
                    <div key={key} className={`rounded-xl border px-3 py-2 text-center ${preview[key] > 0 ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100 opacity-50"}`}>
                      <p className="text-lg font-bold text-slate-900">{preview[key]}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                <strong>Note:</strong> This will add {Object.values(preview).reduce((a, b) => a + b, 0)} new records to the database. Existing records will not be changed.
              </div>

              <div className="flex gap-3">
                <button onClick={cancelImport}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={confirmImport} disabled={importing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 transition disabled:opacity-50">
                  {importing ? "Importing…" : "Confirm Import"}
                </button>
              </div>
            </div>
          )}

          {/* Import result */}
          {importResult && (
            <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Import Results</p>
              <div className="space-y-2">
                {Object.entries(importResult.collections).map(([label, { ok, fail }]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-medium">{label}</span>
                    <div className="flex gap-3">
                      {ok > 0   && <span className="text-emerald-600 font-semibold">{ok} added</span>}
                      {fail > 0 && <span className="text-red-500 font-semibold">{fail} failed</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-700">
          <p className="font-semibold mb-1">How to use XML Import / Export</p>
          <ul className="space-y-1 text-blue-600 list-disc list-inside">
            <li>Use <strong>Export</strong> to download a backup of all live data as XML</li>
            <li>Use <strong>Import</strong> to upload a previously exported XML file and add its records to the database</li>
            <li>The XML format follows the CityLink schema — only files exported from this portal are supported</li>
            <li>Import adds new records — it does not delete or overwrite existing ones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}