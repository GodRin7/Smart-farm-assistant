import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { createCrop } from "../api/cropApi";

function AddCrop() {
  const navigate = useNavigate();

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
      setError(error.response?.data?.message || "Failed to create crop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout title="Add Crop">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Crop Name</label>
              <input
                type="text"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                placeholder="e.g. Tomato"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Variety</label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. Cherry Tomato"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Plot Name</label>
              <input
                type="text"
                name="plotName"
                value={formData.plotName}
                onChange={handleChange}
                placeholder="e.g. Back Plot"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Area</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g. 120"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Area Unit</label>
              <select
                name="areaUnit"
                value={formData.areaUnit}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="sqm">Square Meters</option>
                <option value="hectare">Hectare</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Date Planted</label>
              <input
                type="date"
                name="plantedDate"
                value={formData.plantedDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Expected Harvest Date</label>
              <input
                type="date"
                name="expectedHarvestDate"
                value={formData.expectedHarvestDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes"
                rows="4"
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
          disabled={loading}
          className="w-full rounded-2xl bg-green-600 px-4 py-3 text-base font-semibold text-white"
        >
          {loading ? "Saving..." : "Save Crop"}
        </button>
      </form>
    </MobileLayout>
  );
}

export default AddCrop;