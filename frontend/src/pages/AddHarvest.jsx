import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getCrops } from "../api/cropApi";
import { createHarvest } from "../api/harvestApi";
import { useTranslation } from "../context/TranslationContext";

function AddHarvest() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    crop: "",
    harvestDate: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    notes: "",
  });

  const [loadingCrops, setLoadingCrops] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await getCrops();
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

  const totalPreview = useMemo(() => {
    const quantity = Number(formData.quantity) || 0;
    const pricePerUnit = Number(formData.pricePerUnit) || 0;
    return quantity * pricePerUnit;
  }, [formData.quantity, formData.pricePerUnit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);

      await createHarvest({
        ...formData,
        quantity: Number(formData.quantity),
        pricePerUnit: Number(formData.pricePerUnit),
      });

      navigate("/harvests");
    } catch (error) {
      setError(error.response?.data?.message || t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout title={t("addHarvest")}>
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
                {t("dateLabel")}
              </label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("quantityLabel")}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                  className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("unitLabel")}
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g. kg"
                  className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("pricePerUnitLabel")}
              </label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                placeholder="e.g. 35"
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:bg-slate-800"
                required
              />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 px-5 py-4 dark:border-emerald-900/30 dark:bg-emerald-900/20">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800/70 dark:text-emerald-400/70">
                {t("estTotalValue")}
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₱{Number(totalPreview).toLocaleString()}
              </p>
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
          {saving ? t("saving") : t("saveHarvest")}
        </button>
      </form>
    </MobileLayout>
  );
}

export default AddHarvest;