import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getDashboard } from "../api/dashboardApi";
import { Leaf, CalendarClock, Banknote, TrendingUp, ChevronRight, Sprout, ShoppingCart, RefreshCw, AlertTriangle, Clock, CheckCircle2, Wallet, PackageOpen, Activity, Info, BarChart3, TrendingDown, Bell, CloudRain, ThermometerSun } from "lucide-react";
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

  const { summary, recentActivities, latestExpenses, upcomingHarvests, smartAlerts, analytics } = dashboard;

  const getUrgency = (expectedDate) => {
    const diffTime = new Date(expectedDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) return { days: diffDays, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30' };
    if (diffDays <= 7) return { days: diffDays, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30' };
    return { days: diffDays, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30' };
  };

  const getActivityName = (type) => {
    const keyMap = { land_preparation: "actLandPrep", planting: "actPlanting", watering: "actWatering", fertilizing: "actFertilizing", spraying: "actSpraying", weeding: "actWeeding", harvesting: "actHarvesting" };
    return keyMap[type] ? t(keyMap[type]) : type.replaceAll("_", " ");
  };

  const unreadAlertsCount = smartAlerts?.length || 0;

  const RightAction = () => (
    <div className="relative">
      <button 
        onClick={() => {
          const el = document.getElementById("action-center");
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center justify-center">
        <Bell size={20} />
      </button>
      {unreadAlertsCount > 0 && (
         <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white shadow-sm dark:border-slate-900 border-opacity-50">
           {unreadAlertsCount}
         </div>
      )}
    </div>
  );

  return (
    <MobileLayout title={t("dashboard")} rightAction={<RightAction />}>
      <div className="space-y-8 pb-6">
        
        {/* Welcome Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{t("yourFarm")}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Sprout size={16} className="text-emerald-500" /> {t("growingNicely")}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Profit/Value - Hero Card */}
          <div className="col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-500/20 dark:from-emerald-600 dark:to-emerald-900 border border-emerald-400/20">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-emerald-100 font-semibold text-sm flex items-center gap-2">
                   <TrendingUp size={16} /> {t("harvestValue")}
                </p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold opacity-80">₱</span>
                  <span className="text-4xl font-black tracking-tight">{Number(summary.totalHarvestValue).toLocaleString()}</span>
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                <Leaf size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="group flex flex-col justify-between rounded-[1.5rem] border border-slate-200/60 bg-white p-5 shadow-sm transition-all dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
              <Sprout size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("activeCrops")}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">{summary.activeCrops}</p>
            </div>
          </div>

          <div className="group flex flex-col justify-between rounded-[1.5rem] border border-slate-200/60 bg-white p-5 shadow-sm transition-all dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t("totalExpenses")}</p>
              <p className="mt-1 text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 truncate">
                ₱{Number(summary.totalExpenses).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Smart Alerts Action Center */}
        {smartAlerts?.length > 0 && (
          <div id="action-center" className="scroll-mt-24 pb-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 px-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                <Bell size={18} />
              </span>
              {t("smartAlertsTitle")}
            </h3>
            
            <div className="flex snap-x snap-mandatory overflow-x-auto pb-4 gap-4 px-1 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {smartAlerts.map((alert) => (
                <div key={alert.id} className={`shrink-0 snap-center relative w-[85%] rounded-[2rem] border shadow-md p-5 ${
                  alert.color === 'rose' ? 'bg-gradient-to-br from-rose-50 to-red-100/50 border-rose-200 dark:from-red-900/30 dark:to-rose-950/40 dark:border-red-800/50' :
                  alert.color === 'amber' ? 'bg-gradient-to-br from-amber-50 to-orange-100/50 border-amber-200 dark:from-orange-900/30 dark:to-amber-950/40 dark:border-orange-800/50' :
                  alert.color === 'emerald' ? 'bg-gradient-to-br from-emerald-50 to-green-100/50 border-emerald-200 dark:from-green-900/30 dark:to-emerald-950/40 dark:border-green-800/50' :
                  'bg-gradient-to-br from-blue-50 to-indigo-100/50 border-blue-200 dark:from-blue-900/30 dark:to-indigo-950/40 dark:border-blue-800/50'
                }`}>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                       <h4 className={`text-base font-bold leading-tight pr-4 ${
                         alert.color === 'rose' ? 'text-rose-900 dark:text-rose-300' :
                         alert.color === 'amber' ? 'text-amber-900 dark:text-amber-300' :
                         alert.color === 'emerald' ? 'text-emerald-900 dark:text-emerald-300' :
                         'text-blue-900 dark:text-blue-300'
                       }`}>
                         {t(alert.title)}
                       </h4>
                       <span className={`flex shrink-0 h-8 w-8 items-center justify-center rounded-full shadow-sm bg-white/60 dark:bg-black/20 backdrop-blur-md ${
                         alert.color === 'rose' ? 'text-rose-600 dark:text-rose-400' :
                         alert.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                         alert.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                         'text-blue-600 dark:text-blue-400'
                       }`}>
                         {alert.icon === 'AlertTriangle' ? <AlertTriangle size={16}/> : alert.icon === 'Clock' ? <Clock size={16}/> : alert.icon === 'CheckCircle2' ? <CheckCircle2 size={16} /> : alert.icon === 'Banknote' ? <Banknote size={16} /> : alert.icon === 'ThermometerSun' ? <ThermometerSun size={16}/> : alert.icon === 'CloudRain' ? <CloudRain size={16}/> : <Info size={16}/>}
                       </span>
                    </div>
                    <p className={`text-[13px] font-semibold leading-relaxed mb-4 opacity-90 ${
                         alert.color === 'rose' ? 'text-rose-800 dark:text-rose-200' :
                         alert.color === 'amber' ? 'text-amber-800 dark:text-amber-200' :
                         alert.color === 'emerald' ? 'text-emerald-800 dark:text-emerald-200' :
                         'text-blue-800 dark:text-blue-200'
                       }`}>
                      {t(alert.message)}
                    </p>
                    {alert.cropName && (
                      <div className="inline-flex py-1.5 px-3 rounded-xl bg-white/50 dark:bg-black/20 text-[10px] font-black shadow-sm uppercase tracking-wider">
                        {alert.cropName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Harvests */}
        <div>
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarClock size={20} className="text-amber-500" />
              {t("upcomingHarvests")}
            </h3>
            <Link to="/harvests" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
              {t("viewAll")}
            </Link>
          </div>

          {upcomingHarvests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 py-10 px-4 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50">
                <PackageOpen size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("noUpcoming")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingHarvests.map((crop) => {
                const urgency = getUrgency(crop.expectedHarvestDate);
                return (
                  <Link key={crop._id} to={`/crops/${crop._id}`} className={`flex items-center justify-between rounded-[1.5rem] border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900/50 ${urgency.border}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] ${urgency.bg} ${urgency.color}`}>
                        {urgency.days <= 3 ? <AlertTriangle size={24} /> : urgency.days <= 7 ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate font-bold text-slate-800 dark:text-slate-100 text-base">{crop.cropName}</p>
                        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {crop.plotName || t("mainField")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className={`text-sm font-black ${urgency.color}`}>
                        {urgency.days === 0 ? t("today") : urgency.days < 0 ? t("overdue") : `${t("inTime")} ${urgency.days} ${t("daysShort")}`}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(crop.expectedHarvestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div>
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              {t("recentActivities")}
            </h3>
            <Link to="/activities" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
              {t("history")}
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 py-10 px-4 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50">
                <Activity size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("noActivities")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Activity size={22} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-bold capitalize text-slate-800 dark:text-slate-100">
                      {getActivityName(activity.activityType)}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {activity.crop?.cropName ? `${t("onWord")} ${activity.crop.cropName}` : t("generalFarming")}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                    {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Expenses */}
        <div>
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wallet size={20} className="text-rose-500" />
              {t("latestExpenses")} 
            </h3>
            <Link to="/expenses" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
              {t("viewAll")}
            </Link>
          </div>

          {latestExpenses?.length === 0 || !latestExpenses ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 py-10 px-4 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50">
                <ShoppingCart size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("noRecentExpenses")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestExpenses.map((expense) => (
                <div key={expense._id} className="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                    <ShoppingCart size={22} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-bold text-slate-800 dark:text-slate-100">
                      {expense.description || (expense.category === "Others" ? t("catOthers") : t(`cat${expense.category}`))}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {expense.crop?.cropName ? `${t("forWord")} ${expense.crop.cropName}` : t("generalCat")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-rose-600 dark:text-rose-400">
                      -₱{Number(expense.amount).toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crop Analytics */}
        <div>
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              {t("cropPerf")}
            </h3>
          </div>

          {!analytics?.cropAnalytics || analytics.cropAnalytics.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 py-10 px-4 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50">
                <Leaf size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("noActiveCrops")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.cropAnalytics.map((crop) => {
                const isProfit = crop.netEstimate >= 0;
                return (
                  <div key={crop._id} className="relative flex flex-col gap-3 rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80 overflow-hidden">
                    {/* Background glow if most active */}
                    {crop.isMostActive && (
                       <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
                    )}

                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">{crop.cropName}</h4>
                          {crop.isMostActive && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                              {t("mostActive")}
                            </span>
                          )}
                          {crop.status === "harvested" && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                              {t("statusHarvested")}
                            </span>
                          )}
                          {crop.status === "failed" && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/40 px-2 py-0.5 rounded-full">
                              {t("filterFailed").split(' ')[0]} 
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                          {crop.plotName || t("mainField")} • {crop.activityCount} {t("activitiesCount")}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm font-black flex items-center justify-end gap-1 ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isProfit ? '+' : '-'}₱{Math.abs(crop.netEstimate).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t("netEstimate")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 relative z-10">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("harvestValShort")}</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">₱{Number(crop.totalHarvestValue).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("expensesShort")}</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">₱{Number(crop.totalExpenses).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </MobileLayout>
  );
}

export default Dashboard;