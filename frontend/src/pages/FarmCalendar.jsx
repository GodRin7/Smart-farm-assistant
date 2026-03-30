import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getSchedules, toggleSchedule, deleteSchedule } from "../api/scheduleApi";
import { useTranslation } from "../context/TranslationContext";
import {
  Droplets, Leaf, Sprout, Scissors, PackageCheck, MoreHorizontal,
  CheckCircle2, Circle, Trash2, Plus, RefreshCw, CalendarDays, Filter,
} from "lucide-react";

const TASK_META = {
  watering:    { icon: Droplets,    color: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-50 dark:bg-sky-500/10",     border: "border-sky-200 dark:border-sky-500/30",    label: "taskWatering" },
  fertilizing: { icon: Leaf,        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", label: "taskFertilizing" },
  spraying:    { icon: Sprout,      color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/30", label: "taskSpraying" },
  weeding:     { icon: Scissors,    color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-500/10",   border: "border-amber-200 dark:border-amber-500/30",  label: "taskWeeding" },
  harvesting:  { icon: PackageCheck, color: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-500/10",     border: "border-rose-200 dark:border-rose-500/30",    label: "taskHarvesting" },
  other:       { icon: MoreHorizontal, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/30", label: "taskOther" },
};

const REPEAT_LABELS = { none: "repeatNone", daily: "repeatDaily", weekly: "repeatWeekly", biweekly: "repeatBiweekly" };

function FarmCalendar() {
  const { t, lang } = useTranslation();
  const locale = lang === "tl" ? "fil-PH" : "en-US";

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming"); // upcoming | done | all
  const [selectedDate, setSelectedDate] = useState(null); // ISO date string "YYYY-MM-DD"

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSchedules();
      setSchedules(data);
    } catch (e) {
      setError(t("calendarError", "Failed to load calendar."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const handleToggle = async (id) => {
    try {
      const updated = await toggleSchedule(id);
      setSchedules(prev => prev.map(s => s._id === id ? { ...s, isDone: updated.isDone } : s));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s._id !== id));
    } catch {}
  };

  // Build a weekly strip: today -1 day to today +6 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const stripDays = Array.from({ length: 9 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i - 1);
    return d;
  });

  const toDateStr = (d) => d.toISOString().slice(0, 10);

  // Count tasks per day for the strip
  const tasksByDay = {};
  schedules.forEach(s => {
    const key = toDateStr(new Date(s.scheduledDate));
    if (!tasksByDay[key]) tasksByDay[key] = { total: 0, done: 0 };
    tasksByDay[key].total++;
    if (s.isDone) tasksByDay[key].done++;
  });

  // Filtered & sorted list
  const filteredSchedules = schedules
    .filter(s => {
      if (selectedDate) return toDateStr(new Date(s.scheduledDate)) === selectedDate;
      if (filter === "upcoming") return !s.isDone;
      if (filter === "done") return s.isDone;
      return true;
    })
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  // Group by date
  const grouped = {};
  filteredSchedules.forEach(s => {
    const key = toDateStr(new Date(s.scheduledDate));
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const getDayLabel = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const t_ = new Date(); t_.setHours(0,0,0,0);
    const diff = Math.round((d - t_) / 86400000);
    if (diff === 0) return t("today");
    if (diff === 1) return t("tomorrow", "Tomorrow");
    if (diff === -1) return t("yesterday", "Yesterday");
    return d.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" });
  };

  const isOverdue = (dateStr) => new Date(dateStr + "T23:59:59") < new Date();

  return (
    <MobileLayout
      title={t("farmCalendar", "Farm Calendar")}
      rightAction={
        <Link
          to="/calendar/add"
          id="add-task-btn"
          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          <Plus size={16} /> {t("addTask", "Add Task")}
        </Link>
      }
    >
      <div className="space-y-6 pb-6">

        {/* Weekly Strip Calendar */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-2 w-max">
            {stripDays.map((day) => {
              const key = toDateStr(day);
              const isToday = key === toDateStr(today);
              const isSelected = key === selectedDate;
              const dayTasks = tasksByDay[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(isSelected ? null : key)}
                  className={`flex flex-col items-center gap-1.5 w-14 rounded-2xl py-3 px-1 transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                      : isToday
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
                      : "bg-white/60 text-slate-600 border border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800/50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {day.toLocaleDateString(locale, { weekday: "short" })}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {day.getDate()}
                  </span>
                  {dayTasks ? (
                    <div className={`flex gap-0.5 items-center`}>
                      {Array.from({ length: Math.min(dayTasks.total, 3) }, (_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i < dayTasks.done
                              ? isSelected ? "bg-white/70" : "bg-emerald-400"
                              : isSelected ? "bg-white/30" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Tabs (only when no date selected) */}
        {!selectedDate && (
          <div className="flex rounded-2xl border border-slate-200/60 bg-white/50 p-1 dark:border-slate-800/50 dark:bg-slate-900/40 backdrop-blur-sm">
            {[["upcoming", t("upcoming", "Upcoming")], ["done", t("done", "Done")], ["all", t("filterAllCrops", "All")]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`flex-1 rounded-xl py-2 text-xs font-bold tracking-wide transition-all ${
                  filter === val
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {selectedDate && (
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
              <CalendarDays size={16} className="inline mr-2 text-emerald-500" />
              {getDayLabel(selectedDate)}
            </h2>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              {t("viewAll")}
            </button>
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-[2rem] bg-white/50 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800/50">
            <RefreshCw size={24} className="animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">{error}</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 py-14 px-4 text-center dark:border-slate-700 dark:bg-slate-800/30">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/80 dark:bg-emerald-900/30">
              <CalendarDays size={30} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{t("noTasks", "No tasks scheduled.")}</p>
            <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">{t("noTasksSub", "Tap 'Add Task' to plan your farm work.")}</p>
          </div>
        ) : (
          <div className="space-y-7">
            {Object.entries(grouped).map(([dateStr, tasks]) => (
              <div key={dateStr}>
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`text-xs font-black uppercase tracking-widest ${isOverdue(dateStr) ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}>
                    {getDayLabel(dateStr)}
                  </span>
                  <div className="flex-1 h-px bg-slate-200/70 dark:bg-slate-800" />
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {tasks.filter(s => s.isDone).length}/{tasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => {
                    const meta = TASK_META[task.taskType] || TASK_META.other;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={task._id}
                        className={`flex items-start gap-4 rounded-[1.5rem] border bg-white p-4 shadow-sm transition-all dark:bg-slate-900/50 ${task.isDone ? "opacity-55 dark:opacity-40" : meta.border}`}
                      >
                        {/* Check button */}
                        <button
                          onClick={() => handleToggle(task._id)}
                          className={`mt-0.5 shrink-0 transition-transform active:scale-90 ${task.isDone ? "text-emerald-500" : "text-slate-300 dark:text-slate-600 hover:text-emerald-400"}`}
                        >
                          {task.isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>

                        {/* Task icon + info */}
                        <div className="flex flex-1 items-start gap-3 overflow-hidden">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className={`font-bold text-slate-800 dark:text-slate-100 ${task.isDone ? "line-through" : ""}`}>
                              {task.title || t(meta.label)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {task.crop && (
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {task.crop.cropName}
                                </span>
                              )}
                              {task.repeatType !== "none" && (
                                <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md">
                                  ↻ {t(REPEAT_LABELS[task.repeatType])}
                                </span>
                              )}
                              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                {new Date(task.scheduledDate).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {task.notes ? (
                              <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{task.notes}</p>
                            ) : null}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="mt-0.5 shrink-0 text-slate-300 hover:text-rose-400 dark:text-slate-700 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

export default FarmCalendar;
