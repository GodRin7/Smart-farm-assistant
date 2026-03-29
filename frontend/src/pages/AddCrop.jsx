import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { createCrop } from "../api/cropApi";
import { useTranslation } from "../context/TranslationContext";

function AddCrop() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    cropName: "",
    variety: "",
    plotName: "",
    area: "",
    areaUnit: "sqm",
    plantedDate: "",
    expectedHarvestDate: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      await createCrop({
        ...formData,
        area: formData.area ? Number(formData.area) : 0,
      });

      navigate("/crops");
    } catch (error) {
      setError(error.response?.data?.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout title={t("addCrop")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("cropNameLabel")}
              </label>
              <input
                type="text"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                placeholder="e.g. Tomato"
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("variety")}
              </label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. Cherry Tomato"
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("plotName")}
              </label>
              <input
                type="text"
                name="plotName"
                value={formData.plotName}
                onChange={handleChange}
                placeholder="e.g. Back Plot"
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("area")}
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                  className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("areaUnitLabel")}
                </label>
                <select
                  name="areaUnit"
                  value={formData.areaUnit}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                >
                  <option value="sqm">{t("sqm")}</option>
                  <option value="hectare">{t("hectare")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("plantedDate")}
              </label>
              <input
                type="date"
                name="plantedDate"
                value={formData.plantedDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("expectedHarvest")}
              </label>
              <input
                type="date"
                name="expectedHarvestDate"
                value={formData.expectedHarvestDate}
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
                placeholder="..."
                rows="4"
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
          disabled={loading}
          className="w-full rounded-[2rem] bg-emerald-600 px-4 py-4 text-base font-bold tracking-wide text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.98]"
        >
          {loading ? t("saving") : t("saveCrop")}
        </button>
      </form>
    </MobileLayout>
  );
}

export default AddCrop;