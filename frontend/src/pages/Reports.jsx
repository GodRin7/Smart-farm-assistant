// src/pages/Reports.jsx
import { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { getCrops } from "../api/cropApi";
import { getExpenses } from "../api/expenseApi";
import { getHarvests } from "../api/harvestApi";
import { Printer, RefreshCw } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

function Reports() {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState("harvest"); // 'harvest' or 'cost'
  const [data, setData] = useState({ crops: [], expenses: [], harvests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [c, e, h] = await Promise.all([getCrops(), getExpenses(), getHarvests()]);
        setData({ crops: c, expenses: e, harvests: h });
      } catch (err) {
        console.error("error loading reports", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const buildHarvestSummary = () => {
    const summary = {};
    data.harvests.forEach(h => {
      const cId = h.crop?._id || "unknown";
      if (!summary[cId]) {
        summary[cId] = {
          cropName: h.crop?.cropName || t("filterAllCrops"),
          plotName: h.crop?.plotName || "",
          totalValue: 0,
          entries: 0,
        };
      }
      summary[cId].totalValue += h.totalValue;
      summary[cId].entries += 1;
    });
    return Object.values(summary);
  };

  const buildCostSummary = () => {
    const summary = {};
    data.expenses.forEach(e => {
      const cId = e.crop?._id || "general";
      if (!summary[cId]) {
        summary[cId] = {
          cropName: e.crop?.cropName || t("filterAllCrops"),
          plotName: e.crop?.plotName || "",
          totalCost: 0,
          entries: 0,
        };
      }
      summary[cId].totalCost += e.amount;
      summary[cId].entries += 1;
    });
    return Object.values(summary);
  };

  const currentSummary = reportType === "harvest" ? buildHarvestSummary() : buildCostSummary();
  const totalAmount = currentSummary.reduce((acc, row) => acc + (reportType === "harvest" ? row.totalValue : row.totalCost), 0);

  return (
    <MobileLayout title={t("reportsTitle")}>
      <div className="space-y-6">
        
        {/* Controls - Hidden on Print */}
        <div className="print-hidden flex flex-col gap-4 overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
           <select 
             value={reportType}
             onChange={(e) => setReportType(e.target.value)}
             className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none dark:bg-[#0f172a] dark:text-slate-200"
           >
             <option value="harvest">{t("harvestReport")}</option>
             <option value="cost">{t("costReport")}</option>
           </select>

           <button 
             onClick={handlePrint}
             className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
           >
             <Printer size={18} />
             {t("printBtn")}
           </button>
        </div>

        {/* Report Preview / Print Canvas */}
        <div className="rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm print:shadow-none print:border-none print:p-0 dark:border-slate-800/50 dark:bg-slate-900">
          <div className="mb-6 border-b border-slate-200 pb-4 text-center dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white print:text-black">
               {reportType === "harvest" ? t("harvestReport") : t("costReport")}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-500 print:text-slate-700">Smart Farm Assistant</p>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center text-emerald-500">
              <RefreshCw className="animate-spin" size={24} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 print:text-black">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400 print:bg-slate-100 print:text-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t("cropNameLabel")}</th>
                    <th className="px-4 py-3 text-center font-semibold">Entries</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("amountLabel")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSummary.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 print:border-slate-300">
                      <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-100 print:text-black">
                        {row.cropName} {row.plotName && <span className="block text-xs text-slate-400 print:text-slate-600">{row.plotName}</span>}
                      </td>
                      <td className="px-4 py-4 text-center">{row.entries}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-800 dark:text-slate-100 print:text-black">
                        ₱{Number(reportType === "harvest" ? row.totalValue : row.totalCost).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {currentSummary.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-slate-400">No data found.</td>
                    </tr>
                  )}
                </tbody>
                {currentSummary.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-800 dark:bg-slate-800 dark:text-white print:bg-slate-100 print:text-black">
                      <td className="px-4 py-4 text-right" colSpan="2">{t("totalLabel")}</td>
                      <td className="px-4 py-4 text-right text-emerald-600 dark:text-emerald-400">
                        ₱{Number(totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

export default Reports;
