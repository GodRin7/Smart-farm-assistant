import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { deleteHarvest, getHarvests } from "../api/harvestApi";

function Harvests() {
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getHarvests();
      setHarvests(data);
    } catch (error) {
      setError("Failed to load harvest records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this harvest record?");
    if (!confirmed) return;

    try {
      await deleteHarvest(id);
      fetchHarvests();
    } catch (error) {
      setError("Failed to delete harvest record");
    }
  };

  return (
    <MobileLayout
      title="Harvests"
      rightAction={
        <Link
          to="/harvests/add"
          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white"
        >
          Add
        </Link>
      }
    >
      <div className="space-y-4">
        {loading && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            Loading harvests...
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && harvests.length === 0 && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            No harvest records found. Start by adding your first harvest record.
          </div>
        )}

        {!loading &&
          !error &&
          harvests.map((harvest) => (
            <div
              key={harvest._id}
              className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    {harvest.crop?.cropName || "Unknown crop"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {harvest.crop?.plotName || "No plot name"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-base font-bold">₱{Number(harvest.totalValue).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {harvest.quantity} {harvest.unit}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>Harvest Date: {new Date(harvest.harvestDate).toLocaleDateString()}</p>
                <p>Price per Unit: ₱{Number(harvest.pricePerUnit).toLocaleString()}</p>
                <p>Notes: {harvest.notes || "—"}</p>
              </div>

              <button
                onClick={() => handleDelete(harvest._id)}
                className="mt-4 rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </MobileLayout>
  );
}

export default Harvests;