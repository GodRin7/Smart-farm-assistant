import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import CropCard from "../components/CropCard";
import { getCrops } from "../api/cropApi";
import { Plus, Filter, Sprout, RefreshCw } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

function Crops() {
  const [crops, setCrops] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCrops(statusFilter);
      setCrops(data);
    } catch (error) {
      setError(t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [statusFilter]);

  return (
    <MobileLayout
      title={t("myCrops")}
      rightAction={
        <Link
          to="/crops/add"
          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <Plus size={16} /> {t("addCrop")}
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-2 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="flex items-center rounded-[1.5rem] bg-slate-50/80 px-4 py-1 dark:bg-[#0f172a]/80">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
            >
              <option value="">{t("filterAllCrops")}</option>
              <option value="active">{t("filterActive")}</option>
              <option value="harvested">{t("filterHarvested")}</option>
              <option value="failed">{t("filterFailed")}</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex h-40 flex-col items-center justify-center space-y-4 rounded-[2rem] bg-white/50 backdrop-blur-xl shadow-sm dark:bg-[#0f172a]/50 border border-white/20 dark:border-slate-800/50">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("loadingCrops")}</p>
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && crops.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-300 bg-white/40 px-6 py-12 text-center backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/40">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Sprout size={32} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">{t("noCrops")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("startCrop")}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4">
            {crops.map((crop) => <CropCard key={crop._id} crop={crop} />)}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

export default Crops;