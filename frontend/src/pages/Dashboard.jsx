import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getDashboard } from "../api/dashboardApi";
import { Leaf, CalendarClock, Banknote, TrendingUp, ChevronRight, Sprout, ShoppingCart, RefreshCw } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboard();
        setDashboard(data);
      } catch (error) {
        setError(t("dashError"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [t]);

  if (loading) {
    return (
      <MobileLayout title={t("dashboard")}>
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl bg-white/50 backdrop-blur-xl shadow-sm dark:bg-[#0f172a]/50 border border-white/20 dark:border-slate-800/50">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="font-medium text-slate-500 dark:text-slate-400">{t("syncing")}</p>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title={t("dashboard")}>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          <p>{error}</p>
        </div>
      </MobileLayout>
    );
  }

  const { summary, recentActivities, latestExpenses, upcomingHarvests } = dashboard;

  return (
    <MobileLayout title={t("dashboard")}>
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white shadow-xl shadow-emerald-600/20 dark:from-emerald-600 dark:to-emerald-900">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold tracking-tight">{t("yourFarm")}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-100 opacity-90">
              <Sprout size={16} /> {t("growingNicely")}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group rounded-[2rem] border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              <Leaf size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("activeCrops")}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{summary.activeCrops}</p>
          </div>

          <div className="group rounded-[2rem] border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              <CalendarClock size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("upcomingHarvests")}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{summary.upcomingHarvestsCount}</p>
          </div>

          <div className="group rounded-[2rem] border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              <Banknote size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("totalExpenses")}</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              ₱{Number(summary.totalExpenses).toLocaleString()}
            </p>
          </div>

          <div className="group rounded-[2rem] border border-white/40 bg-emerald-50/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-200/50 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              <TrendingUp size={20} />
            </div>
            <p className="text-sm font-medium text-emerald-800/70 dark:text-emerald-300/70">{t("harvestValue")}</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
              ₱{Number(summary.totalHarvestValue).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Upcoming Harvests */}
        <div className="rounded-[2.5rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("upcomingHarvests")}</h3>
            <Link to="/crops" className="flex items-center text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400">
              {t("viewAll")} <ChevronRight size={16} />
            </Link>
          </div>

          {upcomingHarvests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("noUpcoming")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingHarvests.map((crop) => (
                <div key={crop._id} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-[#0f172a] dark:hover:border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <CalendarClock size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{crop.cropName}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {crop.plotName || "No plot name"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t("expected")}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {new Date(crop.expectedHarvestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="rounded-[2.5rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("recentActivities")}</h3>
            <Link to="/activities" className="flex items-center text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400">
              {t("history")} <ChevronRight size={16} />
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("noActivities")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm border border-slate-100 dark:bg-[#0f172a] dark:border-slate-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Sprout size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-semibold capitalize text-slate-800 dark:text-slate-100">
                      {activity.activityType.replaceAll("_", " ")}
                    </p>
                    <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                      {activity.crop?.cropName || "Unknown crop"}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
                    {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </MobileLayout>
  );
}

export default Dashboard;