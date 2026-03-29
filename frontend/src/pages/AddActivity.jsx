import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getCrops } from "../api/cropApi";
import { createActivity } from "../api/activityApi";
import { useTranslation } from "../context/TranslationContext";

function AddActivity() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    crop: "",
    activityType: "others",
    date: "",
    notes: "",
  });

  const [loadingCrops, setLoadingCrops] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await getCrops("active");
        setCrops(data);
      } catch (error) {
        setError(t("failedToLoad"));
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchCrops();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);
      await createActivity(formData);
      navigate("/activities");
    } catch (error) {
      setError(error.response?.data?.message || t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout title={t("addActivity")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("cropNameLabel")}
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                required
                disabled={loadingCrops}
              >
                <option value="">
                  {loadingCrops ? t("loadingCrops") : t("selectCrop")}
                </option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop._id}>
                    {crop.cropName} {crop.plotName ? `• ${crop.plotName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("activityTypeLabel")}
              </label>
              <select
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
              >
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("dateLabel")}
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("notesLabel")}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="..."
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-[2rem] bg-emerald-600 px-4 py-4 text-base font-bold tracking-wide text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.98]"
        >
          {saving ? t("saving") : t("saveActivity")}
        </button>
      </form>
    </MobileLayout>
  );
}

export default AddActivity;