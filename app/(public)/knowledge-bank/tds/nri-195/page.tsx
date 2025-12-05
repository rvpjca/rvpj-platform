import { listNriSections } from "@/lib/tdsNri195";

export default function Nri195Page() {
  const sections = listNriSections();

  return (
    <div className="container py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Knowledge Bank / TDS</p>
        <h1 className="text-3xl font-bold text-slate-900">Section 195 – Illustrative NRI TDS Rates</h1>
        <p className="text-muted-foreground">
          Quick reference for common non-resident payment categories. All values shown are placeholders – align with the
          latest Finance Act, Income-tax Rules, CBDT circulars and DTAA before issuing certificates or filing returns.
        </p>
      </header>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left font-semibold">Section / Label</th>
                <th className="p-3 text-left font-semibold">Category</th>
                <th className="p-3 text-right font-semibold">Base Rate</th>
                <th className="p-3 text-right font-semibold">No PAN Rate</th>
                <th className="p-3 text-right font-semibold">Threshold</th>
                <th className="p-3 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.code} className="border-t align-top">
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">{section.label}</p>
                    <p className="text-xs text-muted-foreground">Ref: {section.section}</p>
                  </td>
                  <td className="p-3 text-slate-700">{section.category}</td>
                  <td className="p-3 text-right">{(section.baseRate * 100).toFixed(2)}%</td>
                  <td className="p-3 text-right">{(section.noPanRate * 100).toFixed(2)}%</td>
                  <td className="p-3 text-right">
                    {section.threshold ? `₹${section.threshold.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="p-3 text-slate-600">
                    {section.thresholdNote && <div>{section.thresholdNote}</div>}
                    {section.notes && <div className="text-xs text-muted-foreground">{section.notes}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
        <strong>Disclaimer</strong>
        <p>
          Section 195 TDS depends on the nature of income, residential status, PAN availability, surcharge/cess, DTAA,
          TRC/Form 10F, Rule 37BB, etc. This table is a simplified learning aid. Always validate with current law and your
          tax advisors before relying on any rate.
        </p>
      </section>
    </div>
  );
}


