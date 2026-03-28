import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getCrops } from "../api/cropApi";
import { createExpense } from "../api/expenseApi";

function AddExpense() {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    crop: "",
    category: "others",
    amount: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);

      await createExpense({
        ...formData,
        amount: Number(formData.amount),
      });

      navigate("/expenses");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout title="Add Expense">
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
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="seeds">Seeds</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="pesticide">Pesticide</option>
                <option value="labor">Labor</option>
                <option value="transportation">Transportation</option>
                <option value="irrigation">Irrigation</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 1500"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
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
          {saving ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </MobileLayout>
  );
}

export default AddExpense;