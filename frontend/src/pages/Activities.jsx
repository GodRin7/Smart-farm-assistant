import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { deleteActivity, getActivities } from "../api/activityApi";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getActivities({ activityType: activityTypeFilter });
      setActivities(data);
    } catch (error) {
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activityTypeFilter]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this activity?");
    if (!confirmed) return;

    try {
      await deleteActivity(id);
      fetchActivities();
    } catch (error) {
      setError("Failed to delete activity");
    }
  };

  return (
    <MobileLayout
      title="Activities"
      rightAction={
        <Link
          to="/activities/add"
          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white"
        >
          Add
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Filter by activity
          </label>
          <select
            value={activityTypeFilter}
            onChange={(e) => setActivityTypeFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">All Activities</option>
            <option value="land_preparation">Land Preparation</option>
            <option value="planting">Planting</option>
            <option value="watering">Watering</option>
            <option value="fertilizing">Fertilizing</option>
            <option value="spraying">Spraying</option>
            <option value="weeding">Weeding</option>
            <option value="harvesting">Harvesting</option>
            <option value="others">Others</option>
          </select>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            Loading activities...
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            No activities found. Start by adding your first activity log.
          </div>
        )}

        {!loading &&
          !error &&
          activities.map((activity) => (
            <div
              key={activity._id}
              className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold capitalize">
                    {activity.activityType.replaceAll("_", " ")}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {activity.crop?.cropName || "Unknown crop"}
                    {activity.crop?.plotName ? ` • ${activity.crop.plotName}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>Date: {new Date(activity.date).toLocaleDateString()}</p>
                <p>Notes: {activity.notes || "—"}</p>
              </div>

              <button
                onClick={() => handleDelete(activity._id)}
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

export default Activities;