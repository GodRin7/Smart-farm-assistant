import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getCropById, updateCrop } from "../api/cropApi";

function EditCrop() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cropName: "",
    variety: "",
    plotName: "",
    area: "",
    areaUnit: "sqm",
    plantedDate: "",
    expectedHarvestDate: "",
    actualHarvestDate: "",
    status: "active",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const crop = await getCropById(id);

        setFormData({
          cropName: crop.cropName || "",
          variety: crop.variety || "",
          plotName: crop.plotName || "",
          area: crop.area || "",
          areaUnit: crop.areaUnit || "sqm",
          plantedDate: crop.plantedDate ? crop.plantedDate.slice(0, 10) : "",
          expectedHarvestDate: crop.expectedHarvestDate
            ? crop.expectedHarvestDate.slice(0, 10)
            : "",
          actualHarvestDate: crop.actualHarvestDate ? crop.actualHarvestDate.slice(0, 10) : "",
          status: crop.status || "active",
          notes: crop.notes || "",
        });
      } catch (error) {
        setError("Failed to load crop");
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

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

      await updateCrop(id, {
        ...formData,
        area: formData.area ? Number(formData.area) : 0,
        actualHarvestDate: formData.actualHarvestDate || null,
      });

      navigate(`/crops/${id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update crop");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Edit Crop">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">Loading crop...</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Edit Crop">
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
              <label className="mb-2 block text-sm font-medium">Actual Harvest Date</label>
              <input
                type="date"
                name="actualHarvestDate"
                value={formData.actualHarvestDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="active">Active</option>
                <option value="harvested">Harvested</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
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
          disabled={saving}
          className="w-full rounded-2xl bg-green-600 px-4 py-3 text-base font-semibold text-white"
        >
          {saving ? "Updating..." : "Update Crop"}
        </button>
      </form>
    </MobileLayout>
  );
}

export default EditCrop;