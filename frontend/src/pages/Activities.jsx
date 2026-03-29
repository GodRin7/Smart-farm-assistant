import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { deleteActivity, getActivities } from "../api/activityApi";
import { Plus, Filter, ListTodo, RefreshCw, Trash2, Calendar, FileText } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, lang } = useTranslation();
  const locale = lang === "tl" ? "fil-PH" : "en-US";

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getActivities({ activityType: activityTypeFilter });
      setActivities(data);
    } catch (error) {
      setError(t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activityTypeFilter]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t("confirmDelete"));
    if (!confirmed) return;

    try {
      await deleteActivity(id);
      fetchActivities();
    } catch (error) {
      setError(t("failedToLoad"));
    }
  };

  const getActLabel = (act) => {
    const map = {
      land_preparation: t("actLandPrep"),
      planting: t("actPlanting"),
      watering: t("actWatering"),
      fertilizing: t("actFertilizing"),
      spraying: t("actSpraying"),
      weeding: t("actWeeding"),
      harvesting: t("actHarvesting"),
      others: t("catOthers"),
    };
    return map[act] || act.replaceAll("_", " ");
  };

  return (
    <MobileLayout
      title={t("myActivities")}
      rightAction={
        <Link
          to="/activities/add"
          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <Plus size={16} /> {t("addActivity")}
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-2 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="flex items-center rounded-[1.5rem] bg-slate-50/80 px-4 py-1 dark:bg-[#0f172a]/80">
            <Filter size={18} className="text-slate-400" />
            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
            >
              <option value="">{t("filterAllActivities")}</option>
              <option value="land_preparation">{t("actLandPrep")}</option>
              <option value="planting">{t("actPlanting")}</option>
              <option value="watering">{t("actWatering")}</option>
              <option value="fertilizing">{t("actFertilizing")}</option>
              <option value="spraying">{t("actSpraying")}</option>
              <option value="weeding">{t("actWeeding")}</option>
              <option value="harvesting">{t("actHarvesting")}</option>
              <option value="others">{t("catOthers")}</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex h-40 flex-col items-center justify-center space-y-4 rounded-[2rem] bg-white/50 backdrop-blur-xl shadow-sm dark:bg-[#0f172a]/50 border border-white/20 dark:border-slate-800/50">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("loadingActivities")}</p>
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-300 bg-white/40 px-6 py-12 text-center backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/40">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ListTodo size={32} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">{t("noActivities")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("startActivity")}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="group relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-blue-800/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <ListTodo size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        {getActLabel(activity.activityType)}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {activity.crop?.cropName || t("filterAllCrops")}
                        {activity.crop?.plotName ? ` • ${activity.crop.plotName}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/50 p-3 dark:bg-[#0f172a]/50">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      <Calendar size={12} /> {t("dateLabel")}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {new Date(activity.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      <FileText size={12} /> {t("notesLabel")}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {activity.notes || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDelete(activity._id)}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-100/50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                  >
                    <Trash2 size={14} /> {t("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

export default Activities;