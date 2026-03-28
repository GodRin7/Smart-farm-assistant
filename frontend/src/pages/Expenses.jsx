import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { deleteExpense, getExpenses } from "../api/expenseApi";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getExpenses({ category: categoryFilter });
      setExpenses(data);
    } catch (error) {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;

    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (error) {
      setError("Failed to delete expense");
    }
  };

  return (
    <MobileLayout
      title="Expenses"
      rightAction={
        <Link
          to="/expenses/add"
          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white"
        >
          Add
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Filter by category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">All Categories</option>
            <option value="seeds">Seeds</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="pesticide">Pesticide</option>
            <option value="labor">Labor</option>
            <option value="transportation">Transportation</option>
            <option value="irrigation">Irrigation</option>
            <option value="others">Others</option>
          </select>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            Loading expenses...
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && expenses.length === 0 && (
          <div className="rounded-3xl bg-white p-4 text-sm shadow-sm dark:bg-slate-900">
            No expenses found. Start by adding your first expense.
          </div>
        )}

        {!loading &&
          !error &&
          expenses.map((expense) => (
            <div
              key={expense._id}
              className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold capitalize">{expense.category}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {expense.crop?.cropName || "Unknown crop"}
                    {expense.crop?.plotName ? ` • ${expense.crop.plotName}` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-base font-bold">₱{Number(expense.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
                <p>Notes: {expense.notes || "—"}</p>
              </div>

              <button
                onClick={() => handleDelete(expense._id)}
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

export default Expenses;