import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import CropCard from "../components/CropCard";
import { getCrops } from "../api/cropApi";

function Crops() {
  const [crops, setCrops] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCrops(statusFilter);
      setCrops(data);
    } catch (error) {
      setError("Failed to load crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [statusFilter]);

  return (
    <MobileLayout
      title="Crops"
      rightAction={
        <Link
          to="/crops/add"
          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white"
        >
          Add
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Filter by status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">All Crops</option>
            <option value="active">Active</option>
            <option value="harvested">Harvested</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            Loading crops...
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && crops.length === 0 && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            No crops found. Start by adding your first crop cycle.
          </div>
        )}

        {!loading &&
          !error &&
          crops.map((crop) => <CropCard key={crop._id} crop={crop} />)}
      </div>
    </MobileLayout>
  );
}

export default Crops;