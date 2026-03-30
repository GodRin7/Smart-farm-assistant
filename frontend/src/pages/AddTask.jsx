import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { createSchedule } from "../api/scheduleApi";
import { getCrops } from "../api/cropApi";
import { useTranslation } from "../context/TranslationContext";

const TASK_TYPES = ["watering", "fertilizing", "spraying", "weeding", "harvesting", "other"];
const REPEAT_TYPES = ["none", "daily", "weekly", "biweekly"];

const TASK_ICONS = {
  watering: "💧", fertilizing: "🌿", spraying: "🌱",
  weeding: "✂️", harvesting: "📦", other: "📋",
};

function AddTask() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    taskType: "watering",
    title: "",
    crop: "",
    scheduledDate: new Date().toISOString().slice(0, 16),
    repeatType: "none",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCrops({ status: "active" }).then(setCrops).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await createSchedule({
        ...formData,
        crop: formData.crop || null,
      });
      navigate("/calendar");
    } catch (err) {
      setError(err.response?.data?.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800";

  return (
    <MobileLayout title={t("addTask", "Add Task")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="space-y-5">

            {/* Task Type Selector — visual grid */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("taskTypeLabel", "Task Type")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TASK_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, taskType: type }))}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                      formData.taskType === type
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "border-slate-200/60 bg-white/50 text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-2xl">{TASK_ICONS[type]}</span>
                    <span className="text-[11px] font-bold capitalize tracking-wide leading-tight">{t(`task${type.charAt(0).toUpperCase() + type.slice(1)}`, type)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional custom title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("taskTitleLabel", "Custom Title (optional)")}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t("taskTitlePlaceholder", "e.g. Morning Watering Run")}
                className={inputClass}
              />
            </div>

            {/* Linked Crop */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("selectCrop")} ({t("optional", "optional")})
              </label>
              <select name="crop" value={formData.crop} onChange={handleChange} className={inputClass}>
                <option value="">{t("allCrops", "All / General")}</option>
                {crops.map(c => (
                  <option key={c._id} value={c._id}>{c.cropName}{c.plotName ? ` — ${c.plotName}` : ""}</option>
                ))}
              </select>
            </div>

            {/* Scheduled Date & Time */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("scheduledDate", "Scheduled Date & Time")}
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* Repeat */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("repeatLabel", "Repeat")}
              </label>
              <select name="repeatType" value={formData.repeatType} onChange={handleChange} className={inputClass}>
                {REPEAT_TYPES.map(r => (
                  <option key={r} value={r}>{t(`repeat${r.charAt(0).toUpperCase() + r.slice(1)}`, r)}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("notesLabel")}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[2rem] bg-emerald-600 px-4 py-4 text-base font-bold tracking-wide text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.98]"
        >
          {loading ? t("saving") : t("saveTask", "Save Task")}
        </button>
      </form>
    </MobileLayout>
  );
}

export default AddTask;
