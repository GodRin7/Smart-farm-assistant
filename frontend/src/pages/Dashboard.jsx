import MobileLayout from "../components/MobileLayout";

function Dashboard() {
  return (
    <MobileLayout title="Dashboard">
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 className="text-base font-semibold">Welcome to Smart Farm Assistant</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your dashboard is ready. Crop, expense, activity, and harvest modules will be added next.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Crops</p>
            <p className="mt-2 text-2xl font-bold">0</p>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Expenses</p>
            <p className="mt-2 text-2xl font-bold">₱0</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

export default Dashboard;