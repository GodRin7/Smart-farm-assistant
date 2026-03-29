import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import StatusBadge from "../components/StatusBadge";
import { deleteCrop, getCropById } from "../api/cropApi";
import { useTranslation } from "../context/TranslationContext";
import { RefreshCw, MapPin, Calendar, CheckCircle2, FileText, Trash2, Edit } from "lucide-react";

function CropDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const locale = lang === "tl" ? "fil-PH" : "en-US";

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const data = await getCropById(id);
        setCrop(data);
      } catch (error) {
        setError(t("failedToLoad"));
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(t("confirmDelete"));
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteCrop(id);
      navigate("/crops");
    } catch (error) {
      setError(t("failedToLoad"));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title={t("cropDetails")}>
        <div className="flex h-40 flex-col items-center justify-center space-y-4 rounded-[2rem] bg-white/50 backdrop-blur-xl shadow-sm dark:bg-[#0f172a]/50 border border-white/20 dark:border-slate-800/50">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title={t("cropDetails")}>
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title={t("cropDetails")}
      rightAction={
        <Link
          to={`/crops/${id}/edit`}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <Edit size={16} />
          {t("editCrop")}
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="absolute top-0 right-0 h-32 w-32 -translate-y-12 translate-x-8 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-900/20"></div>
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                {crop.cropName}
              </h2>
              <p className="mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                {crop.variety || "—"}
              </p>
            </div>
            <StatusBadge status={crop.status} />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 rounded-[2rem] bg-indigo-50/50 p-5 dark:bg-indigo-900/10">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <MapPin size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{t("plotName")}</span>
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {crop.plotName || "—"}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-[2rem] bg-orange-50/50 p-5 dark:bg-orange-900/10">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <MapPin size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{t("area")}</span>
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {crop.area || 0} {crop.areaUnit === 'sqm' ? t("sqm") : t("hectare")}
            </p>
          </div>
        </div>

        {/* Timelines */}
        <div className="rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-700">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 border-4 border-white shadow dark:bg-emerald-900/50 dark:border-slate-900 dark:text-emerald-400 shrink-0 z-10">
                <Calendar size={18} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-3">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("plantedDate")}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(crop.plantedDate).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600 border-4 border-white shadow dark:bg-amber-900/50 dark:border-slate-900 dark:text-amber-400 shrink-0 z-10">
                <Calendar size={18} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-3">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("expectedHarvest")}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(crop.expectedHarvestDate).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 z-10 ${crop.actualHarvestDate ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:border-slate-900 dark:text-blue-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-900 dark:text-slate-500'}`}>
                <CheckCircle2 size={18} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-3">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("actualHarvestDate")}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {crop.actualHarvestDate
                    ? new Date(crop.actualHarvestDate).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })
                    : "—"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Notes */}
        <div className="rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <FileText size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">{t("notesLabel")}</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {crop.notes || "—"}
          </p>
        </div>

        {/* Delete */}
        <div className="pt-2 pb-6">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-white/50 border border-rose-200 px-4 py-4 text-base font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <Trash2 size={20} />
            {deleting ? t("deleting") : t("delete")}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}

export default CropDetails;