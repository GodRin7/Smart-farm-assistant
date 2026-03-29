import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { Calendar, Sprout, ArrowRight } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

function CropCard({ crop }) {
  const { t, lang } = useTranslation();
  const locale = lang === "tl" ? "fil-PH" : "en-US";

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-emerald-800/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Sprout size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">{crop.cropName}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {crop.plotName || t("noNamePlot")}
            </p>
          </div>
        </div>

        <StatusBadge status={crop.status} />
      </div>

      <div className="mt-5 mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/50 p-3 dark:bg-[#0f172a]/50">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            <Calendar size={12} /> {t("plantedDate")}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            {new Date(crop.plantedDate || Date.now()).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            <Calendar size={12} /> {t("expectedHarvest")}
          </p>
          <p className="mt-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {new Date(crop.expectedHarvestDate).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <Link
        to={`/crops/${crop._id}`}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        {t("viewDetails", "View Details")} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export default CropCard;