import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { deleteExpense, getExpenses } from "../api/expenseApi";
import { Plus, Filter, CircleDollarSign, RefreshCw, Trash2, Calendar, FileText } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, lang } = useTranslation();
  const locale = lang === "tl" ? "fil-PH" : "en-US";

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      setError(t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t("confirmDelete"));
    if (!confirmed) return;

    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (error) {
      setError(t("failedToLoad")); // Reusing error label for brevity or could create failedToDelete
    }
  };

  const getCatLabel = (cat) => {
    const map = {
      seeds: t("catSeeds"),
      fertilizer: t("catFertilizer"),
      pesticide: t("catPesticide"),
      labor: t("catLabor"),
      transportation: t("catTransport"),
      irrigation: t("catIrrigation"),
      others: t("catOthers"),
    };
    return map[cat] || cat;
  };

  const uniqueCrops = Array.from(new Set(expenses.map(e => e.crop?._id).filter(Boolean)))
    .map(id => expenses.find(e => e.crop?._id === id).crop);

  const filteredExpenses = expenses.filter(exp => {
    if (categoryFilter && exp.category !== categoryFilter) return false;
    if (cropFilter && exp.crop?._id !== cropFilter) return false;
    if (dateFilter) {
      try {
        const expDate = new Date(exp.date).toISOString().split('T')[0];
        if (expDate !== dateFilter) return false;
      } catch (e) {
        return false; // protect against invalid dates
      }
    }
    return true;
  });

  return (
    <MobileLayout
      title={t("myExpenses")}
      rightAction={
        <Link
          to="/expenses/add"
          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <Plus size={16} /> {t("addExpense")}
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Advanced Filter UI */}
        <div className="grid grid-cols-1 gap-3">
          {/* Category */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
            <div className="flex items-center px-4 py-3">
              <Filter size={18} className="text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-transparent px-3 text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
              >
                <option value="">{t("filterAllCategories")}</option>
                <option value="seeds">{t("catSeeds")}</option>
                <option value="fertilizer">{t("catFertilizer")}</option>
                <option value="pesticide">{t("catPesticide")}</option>
                <option value="labor">{t("catLabor")}</option>
                <option value="transportation">{t("catTransport")}</option>
                <option value="irrigation">{t("catIrrigation")}</option>
                <option value="others">{t("catOthers")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Crop Select */}
            <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
              <div className="flex items-center px-4 py-3 h-full">
                <select
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
                >
                  <option value="">All Crops</option>
                  {uniqueCrops.map(c => (
                    <option key={c._id} value={c._id}>{c.cropName} {c.plotName ? `(${c.plotName})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Input */}
            <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
              <div className="flex items-center px-4 py-3 h-full">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex h-40 flex-col items-center justify-center space-y-4 rounded-[2rem] bg-white/50 backdrop-blur-xl shadow-sm dark:bg-[#0f172a]/50 border border-white/20 dark:border-slate-800/50">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("loadingExpenses")}</p>
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && expenses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-300 bg-white/40 px-6 py-12 text-center backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/40">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <CircleDollarSign size={32} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">{t("noExpenses")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("startExpense")}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="group relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-amber-200 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-amber-800/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      <CircleDollarSign size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        {getCatLabel(expense.category)}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {expense.crop?.cropName || t("filterAllCrops")}
                        {expense.crop?.plotName ? ` • ${expense.crop.plotName}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                      ₱{Number(expense.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/50 p-3 dark:bg-[#0f172a]/50">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      <Calendar size={12} /> {t("dateLabel")}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {new Date(expense.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      <FileText size={12} /> {t("notesLabel")}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {expense.notes || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-100/50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                  >
                    <Trash2 size={14} /> {t("delete")}
                  </button>
                </div>
              </div>
            ))}
            
            {filteredExpenses.length === 0 && expenses.length > 0 && (
              <p className="text-center text-sm font-medium text-slate-500 py-8">No matching expenses found.</p>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

export default Expenses;