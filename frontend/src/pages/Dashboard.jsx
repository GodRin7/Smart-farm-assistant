import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { getDashboard } from "../api/dashboardApi";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboard();
        setDashboard(data);
      } catch (error) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <MobileLayout title="Dashboard">
        <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
          Loading dashboard...
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Dashboard">
        <div className="rounded-3xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      </MobileLayout>
    );
  }

  const { summary, recentActivities, latestExpenses, upcomingHarvests } = dashboard;

  return (
    <MobileLayout title="Dashboard">
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="text-base font-semibold">Farm Summary</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Quick overview of your current farm records.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Crops</p>
            <p className="mt-2 text-2xl font-bold">{summary.activeCrops}</p>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming Harvests</p>
            <p className="mt-2 text-2xl font-bold">{summary.upcomingHarvestsCount}</p>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
            <p className="mt-2 text-xl font-bold">
              ₱{Number(summary.totalExpenses).toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Harvest Value</p>
            <p className="mt-2 text-xl font-bold">
              ₱{Number(summary.totalHarvestValue).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Upcoming Harvests</h3>
            <Link to="/crops" className="text-sm font-medium text-green-600 dark:text-green-400">
              View Crops
            </Link>
          </div>

          {upcomingHarvests.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No crops nearing harvest.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingHarvests.map((crop) => (
                <div key={crop._id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="font-medium">{crop.cropName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {crop.plotName || "No plot name"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Expected: {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Activities</h3>
            <Link
              to="/activities"
              className="text-sm font-medium text-green-600 dark:text-green-400"
            >
              View All
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No recent activities yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity._id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="font-medium capitalize">
                    {activity.activityType.replaceAll("_", " ")}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {activity.crop?.cropName || "Unknown crop"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Latest Expenses</h3>
            <Link
              to="/expenses"
              className="text-sm font-medium text-green-600 dark:text-green-400"
            >
              View All
            </Link>
          </div>

          {latestExpenses.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No expenses recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {latestExpenses.map((expense) => (
                <div key={expense._id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium capitalize">{expense.category}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {expense.crop?.cropName || "Unknown crop"}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₱{Number(expense.amount).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

export default Dashboard;