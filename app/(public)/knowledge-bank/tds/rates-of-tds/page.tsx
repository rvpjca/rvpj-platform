import { listSections } from "@/lib/tdsRates";

export default function RatesOfTdsPage() {
  const sections = listSections();

  return (
    <div className="container py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Knowledge Bank / TDS</p>
        <h1 className="text-3xl font-bold text-slate-900">Rates of TDS / TCS (Illustrative)</h1>
        <p className="text-muted-foreground">
          Reference sheet for commonly used TDS/TCS sections. Rates shown here are simplified placeholders –
          please confirm with the latest Finance Act, CBDT circulars and internal working papers before
          relying on them.
        </p>
      </header>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left font-semibold">Section</th>
                <th className="p-3 text-left font-semibold">Type</th>
                <th className="p-3 text-right font-semibold">Base Rate</th>
                <th className="p-3 text-right font-semibold">No PAN Rate</th>
                <th className="p-3 text-right font-semibold">Threshold</th>
                <th className="p-3 text-left font-semibold">Threshold note</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.code} className="border-t align-top">
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">{section.label}</p>
                    {section.notes && <p className="text-xs text-muted-foreground">{section.notes}</p>}
                  </td>
                  <td className="p-3 text-slate-700">{section.type}</td>
                  <td className="p-3 text-right">{(section.baseRate * 100).toFixed(2)}%</td>
                  <td className="p-3 text-right">{(section.noPanRate * 100).toFixed(2)}%</td>
                  <td className="p-3 text-right">₹{section.threshold.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-slate-600">{section.thresholdNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="block font-semibold">Disclaimer</strong>
        <p>
          This sheet is for quick reference only. TDS/TCS rates, thresholds, PAN rules (206AA/206CC) and compliance
          conditions change frequently. Always verify with current law, official notifications and your audit /
          tax team before issuing certificates or filing returns.
        </p>
      </section>
    </div>
  );
}


