"use client";

export default function HRACalculatorPage() {
  return (
    <div className="hra-root">
      <style>{`
        :root {
          color-scheme: light;
          font-family: "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f8fafc;
        }

        .hra-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #f8fafc 100%);
          padding: 2rem 1rem 4rem;
        }

        .hra-container {
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hra-header h1 {
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .hra-header p {
          color: #475569;
          margin: 0;
          font-size: 1rem;
        }

        .hra-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .hra-card {
          background: #fff;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 20px 35px -25px rgba(15, 23, 42, 0.45);
          border: 1px solid #e2e8f0;
        }

        .hra-card h2 {
          margin-top: 0;
          color: #0f172a;
        }

        .hra-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hra-field label {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 0.95rem;
          color: #0f172a;
          margin-bottom: 0.3rem;
        }

        .hra-field input[type="number"] {
          width: 100%;
          padding: 0.75rem 0.85rem;
          border-radius: 12px;
          border: 1px solid #cbd5f5;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .hra-field input[type="number"]:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .hra-radio-group {
          display: flex;
          gap: 1rem;
        }

        .hra-radio-group label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 500;
        }

        .hra-button {
          margin-top: 0.5rem;
          padding: 0.9rem 1.4rem;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          border-radius: 999px;
          font-weight: 600;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .hra-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35);
        }

        .hra-error {
          color: #b91c1c;
          font-size: 0.9rem;
          margin-top: 0.75rem;
          display: none;
        }

        .hra-note {
          font-size: 0.85rem;
          color: #475569;
          background: #f8fafc;
          padding: 0.65rem 0.8rem;
          border-radius: 12px;
          border: 1px dashed #cbd5f5;
        }

        .hra-breakup {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .hra-breakup-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1rem;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          transition: background 0.2s, border-color 0.2s;
        }

        .hra-breakup-row.highlight {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.08);
        }

        .hra-breakup-row strong {
          color: #0f172a;
        }

        .hra-result-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .hra-pill {
          padding: 1rem;
          border-radius: 16px;
          text-align: center;
          background: linear-gradient(180deg, #f8fafc, #eef2ff);
          border: 1px solid #dbeafe;
        }

        .hra-pill h3 {
          margin: 0;
          font-size: 0.85rem;
          color: #475569;
        }

        .hra-pill p {
          margin: 0.3rem 0 0;
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
        }

        .hra-info-list {
          margin: 1rem 0 0;
          padding-left: 1.2rem;
          color: #475569;
        }

        .hra-info-card {
          background: #fefce8;
          border: 1px solid #fde68a;
          color: #7c2d12;
        }

        .hra-zero-hint {
          margin-top: 0.8rem;
          font-size: 0.92rem;
          color: #334155;
          background: #e0f2fe;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: none;
        }

        @media (max-width: 768px) {
          .hra-card-grid {
            grid-template-columns: 1fr;
          }
          .hra-root {
            padding: 1.5rem 1rem 3rem;
          }
        }
      `}</style>

      <div className="hra-container">
        <header className="hra-header">
          <h1>HRA Exemption Calculator – India</h1>
          <p>
            Compute exempt and taxable portion of your House Rent Allowance (HRA) under Section 10(13A) – Old
            tax regime.
          </p>
        </header>

        <div className="hra-card-grid">
          <section className="hra-card">
            <h2>HRA Inputs</h2>
            <p className="hra-note">
              HRA exemption is available only under the old tax regime. Under the new regime, HRA is fully taxable.
            </p>

            <div className="hra-form">
              <div className="hra-field">
                <label htmlFor="basicSalary">
                  Basic salary received (annual) <span>₹</span>
                </label>
                <input id="basicSalary" type="number" min="0" data-hra-input defaultValue="600000" />
              </div>

              <div className="hra-field">
                <label htmlFor="daAmount">
                  Dearness Allowance (annual) <span>₹</span>
                </label>
                <input id="daAmount" type="number" min="0" data-hra-input defaultValue="80000" />
              </div>

              <div className="hra-field">
                <label htmlFor="hraReceived">
                  HRA received (annual) <span>₹</span>
                </label>
                <input id="hraReceived" type="number" min="0" data-hra-input defaultValue="240000" />
              </div>

              <div className="hra-field">
                <label htmlFor="rentPaid">
                  Total rent paid during the year <span>₹</span>
                </label>
                <input id="rentPaid" type="number" min="0" data-hra-input defaultValue="260000" />
              </div>

              <div className="hra-field">
                <label>Do you live in Delhi, Mumbai, Kolkata or Chennai?</label>
                <div className="hra-radio-group">
                  <label>
                    <input type="radio" name="metro" value="yes" defaultChecked data-hra-input />
                    Yes (metro)
                  </label>
                  <label>
                    <input type="radio" name="metro" value="no" data-hra-input />
                    No (non-metro)
                  </label>
                </div>
              </div>

              <button id="hraCalculateBtn" className="hra-button" type="button">
                Calculate HRA
              </button>

              <p id="hraError" className="hra-error">
                Values cannot be negative; please enter valid annual amounts.
              </p>
            </div>
          </section>

          <section className="hra-card">
            <h2>HRA Results</h2>
            <div className="hra-breakup">
              <div className="hra-breakup-row" id="rowActual">
                <strong>Actual HRA received</strong>
                <span id="valActual">₹0</span>
              </div>
              <div className="hra-breakup-row" id="rowRent">
                <strong>Rent paid – 10% of salary</strong>
                <span id="valRent">₹0</span>
              </div>
              <div className="hra-breakup-row" id="rowMetro">
                <strong>50% of salary (metro cities)</strong>
                <span id="valMetro">₹0</span>
              </div>
              <div className="hra-breakup-row" id="rowNonMetro">
                <strong>40% of salary (non-metro cities)</strong>
                <span id="valNonMetro">₹0</span>
              </div>
            </div>

            <p style={{ marginTop: "1rem", color: "#0f172a", fontWeight: 600 }}>
              The least of the above values is exempt from HRA.
            </p>

            <div className="hra-result-summary">
              <div className="hra-pill">
                <h3>HRA exempt from tax</h3>
                <p id="hraExempt">₹0</p>
              </div>
              <div className="hra-pill">
                <h3>HRA chargeable to tax</h3>
                <p id="hraTaxable">₹0</p>
              </div>
            </div>

            <div id="hraZeroHint" className="hra-zero-hint">
              Enter your salary, HRA and rent details to see exemption.
            </div>

            <ul className="hra-info-list">
              <li>HRA exemption applies only if HRA is part of your salary and you pay rent for a rented house.</li>
              <li>Exemption is available under the old tax regime. Under the new regime, HRA is fully taxable.</li>
              <li>If no HRA is received or no rent is paid, the entire HRA (if any) becomes taxable.</li>
            </ul>
          </section>
        </div>

        <section className="hra-card hra-info-card">
          <h2 style={{ marginTop: 0 }}>Important</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            This calculator follows the standard “least of three” rule for HRA exemption under Section 10(13A) read
            with Rule 2A. The results are for planning/education only. Always verify with the latest Finance Act,
            CBDT circulars and the official Income Tax Department utilities or consult a qualified tax professional
            before filing returns.
          </p>
        </section>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              const formatINR = (amount) => {
                const formatter = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                });
                const safeAmount = isFinite(amount) ? amount : 0;
                return formatter.format(Math.max(0, Math.round(safeAmount)));
              };

              const ids = {
                basic: "basicSalary",
                da: "daAmount",
                hra: "hraReceived",
                rent: "rentPaid",
                exempt: "hraExempt",
                taxable: "hraTaxable",
                valActual: "valActual",
                valRent: "valRent",
                valMetro: "valMetro",
                valNonMetro: "valNonMetro",
                zeroHint: "hraZeroHint",
                error: "hraError",
              };

              const parseAmount = (id) => {
                const el = document.getElementById(id);
                if (!el) return 0;
                const value = parseFloat(el.value);
                return isNaN(value) || value < 0 ? 0 : value;
              };

              const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = formatINR(value);
              };

              const highlightRows = (targetId) => {
                ["rowActual", "rowRent", "rowMetro", "rowNonMetro"].forEach((rowId) => {
                  const row = document.getElementById(rowId);
                  if (!row) return;
                  if (rowId === targetId) {
                    row.classList.add("highlight");
                  } else {
                    row.classList.remove("highlight");
                  }
                });
              };

              const calculateHra = () => {
                const basic = parseAmount(ids.basic);
                const da = parseAmount(ids.da);
                const hra = parseAmount(ids.hra);
                const rent = parseAmount(ids.rent);
                const salary = basic + da;
                const isMetro = document.querySelector('input[name="metro"]:checked')?.value === "yes";
                const hasNegative = Array.from(document.querySelectorAll("[data-hra-input]"))
                  .filter((input) => input.type === "number")
                  .some((input) => input.value && parseFloat(input.value) < 0);

                const errorEl = document.getElementById(ids.error);
                if (errorEl) errorEl.style.display = hasNegative ? "block" : "none";

                const valA = Math.max(0, hra);
                const valB = Math.max(0, rent - 0.1 * salary);
                const metroCap = Math.max(0, 0.5 * salary);
                const nonMetroCap = Math.max(0, 0.4 * salary);
                const valC = isMetro ? metroCap : nonMetroCap;

                setText(ids.valActual, valA);
                setText(ids.valRent, valB);
                setText(ids.valMetro, metroCap);
                setText(ids.valNonMetro, nonMetroCap);

                let exempt = 0;
                let taxable = Math.max(0, hra);
                let highlightId = "rowActual";

                if (hra <= 0 || rent <= 0 || salary <= 0) {
                  exempt = 0;
                  taxable = Math.max(0, hra);
                  highlightId = "rowActual";
                  const hint = document.getElementById(ids.zeroHint);
                  if (hint) hint.style.display = "block";
                } else {
                  const least = Math.max(0, Math.min(valA, valB, valC));
                  exempt = least;
                  taxable = Math.max(0, hra - least);
                  highlightId = valA === least ? "rowActual" : valB === least ? "rowRent" : isMetro ? "rowMetro" : "rowNonMetro";
                  const hint = document.getElementById(ids.zeroHint);
                  if (hint) hint.style.display = least === 0 ? "block" : "none";
                }

                setText(ids.exempt, exempt);
                setText(ids.taxable, taxable);
                highlightRows(highlightId);
              };

              let debounceTimer;
              const debounceCalc = () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(calculateHra, 300);
              };

              document.querySelectorAll("[data-hra-input]").forEach((input) => {
                input.addEventListener("input", debounceCalc);
                if (input.type === "radio") {
                  input.addEventListener("change", debounceCalc);
                }
              });

              const calcBtn = document.getElementById("hraCalculateBtn");
              if (calcBtn) {
                calcBtn.addEventListener("click", calculateHra);
              }

              calculateHra();
            })();
          `,
        }}
      />
    </div>
  );
}



