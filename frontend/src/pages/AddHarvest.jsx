import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getCrops } from "../api/cropApi";
import { createHarvest } from "../api/harvestApi";

function AddHarvest() {
  const navigate = useNavigate();

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
        setError("Failed to load crops");
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
      setError(error.response?.data?.message || "Failed to create harvest record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout title="Add Harvest">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Crop</label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
                disabled={loadingCrops}
              >
                <option value="">
                  {loadingCrops ? "Loading crops..." : "Select crop"}
                </option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop._id}>
                    {crop.cropName} {crop.plotName ? `• ${crop.plotName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Harvest Date</label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 45"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. kg"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Price per Unit</label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                placeholder="e.g. 35"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div className="rounded-2xl bg-green-50 px-4 py-3 dark:bg-green-900/20">
              <p className="text-sm text-slate-700 dark:text-slate-300">Estimated Total Value</p>
              <p className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">
                ₱{Number(totalPreview).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Optional notes"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-green-600 px-4 py-3 text-base font-semibold text-white"
        >
          {saving ? "Saving..." : "Save Harvest"}
        </button>
      </form>
    </MobileLayout>
  );
}

export default AddHarvest;