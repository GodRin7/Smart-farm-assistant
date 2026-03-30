import { useState, useEffect, useMemo } from "react";
import MobileLayout from "../components/MobileLayout";
import { getCrops } from "../api/cropApi";
import { getExpenses } from "../api/expenseApi";
import { getHarvests } from "../api/harvestApi";
import { useTranslation } from "../context/TranslationContext";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, Sprout, Leaf } from "lucide-react";
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Cell, PieChart, Pie,
} from "recharts";

/* ── Shared chart colors ── */
const COLORS = {
  profit: "#10b981",
  expense: "#f43f5e",
  harvest: "#06b6d4",
  seedling: "#84cc16",
  vegetative: "#22c55e",
  maturing: "#f59e0b",
  ready: "#10b981",
};
const PIE_COLORS = ["#10b981","#f59e0b","#6366f1","#f43f5e","#06b6d4","#ec4899"];

/* ── Custom Tooltip ── */
function ChartTooltip({ active, payload, label, prefix = "₱" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {prefix}{Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ── Section wrapper ── */
function ChartCard({ title, subtitle, icon: Icon, iconColor, children, isEmpty }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-100/60 px-5 py-4 dark:border-slate-800/60">
        <div>
          <h3 className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest ${iconColor}`}>
            <Icon size={16} /> {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">
        {isEmpty ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <BarChart3 size={28} className="text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-semibold text-slate-400">Not enough data yet</p>
          </div>
        ) : children}
      </div>
    </div>
  );
}

/* ── Month helper ── */
const getMonthKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monLabel = (key) => {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

function Analytics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState({ crops: [], expenses: [], harvests: [] });

  useEffect(() => {
    (async () => {
      try {
        const [crops, expenses, harvests] = await Promise.all([
          getCrops(), getExpenses(), getHarvests(),
        ]);
        setRaw({ crops, expenses, harvests });
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  /* ── 1. Monthly Profit Over Time: harvest value - expenses ── */
  const profitData = useMemo(() => {
    const map = {};
    raw.harvests.forEach(h => {
      const k = getMonthKey(h.date || h.createdAt);
      if (!map[k]) map[k] = { month: k, revenue: 0, expenses: 0 };
      map[k].revenue += h.totalValue || 0;
    });
    raw.expenses.forEach(e => {
      const k = getMonthKey(e.date || e.createdAt);
      if (!map[k]) map[k] = { month: k, revenue: 0, expenses: 0 };
      map[k].expenses += e.amount || 0;
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(d => ({ ...d, profit: d.revenue - d.expenses, label: monLabel(d.month) }));
  }, [raw]);

  /* ── 2. Crop Growth Status Breakdown (bar chart) ── */
  const cropGrowthData = useMemo(() => {
    const active = raw.crops.filter(c => c.status === "active" && c.plantedDate && c.expectedHarvestDate);
    return active.map(c => {
      const total = new Date(c.expectedHarvestDate) - new Date(c.plantedDate);
      const elapsed = Date.now() - new Date(c.plantedDate);
      const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
      return { name: c.cropName.length > 10 ? c.cropName.slice(0, 9) + "…" : c.cropName, progress: pct };
    });
  }, [raw]);

  /* ── 3. Expense Trends by Month ── */
  const expenseTrendData = useMemo(() => {
    const map = {};
    raw.expenses.forEach(e => {
      const k = getMonthKey(e.date || e.createdAt);
      if (!map[k]) map[k] = { month: k, Seeds: 0, Fertilizer: 0, Pesticide: 0, Labor: 0, Other: 0 };
      const cat = ["Seeds","Fertilizer","Pesticide","Labor"].includes(e.category) ? e.category : "Other";
      map[k][cat] += e.amount || 0;
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(d => ({ ...d, label: monLabel(d.month) }));
  }, [raw]);

  /* ── 4. Expense Category Pie ── */
  const expensePieData = useMemo(() => {
    const map = {};
    raw.expenses.forEach(e => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [raw]);

  /* ── 5. Crop Revenue vs Cost comparison ── */
  const cropCompareData = useMemo(() => {
    const map = {};
    raw.harvests.forEach(h => {
      const name = h.crop?.cropName || "Unknown";
      if (!map[name]) map[name] = { name, revenue: 0, cost: 0 };
      map[name].revenue += h.totalValue || 0;
    });
    raw.expenses.forEach(e => {
      const name = e.crop?.cropName || "General";
      if (!map[name]) map[name] = { name, revenue: 0, cost: 0 };
      map[name].cost += e.amount || 0;
    });
    return Object.values(map).map(d => ({
      ...d,
      shortName: d.name.length > 8 ? d.name.slice(0, 7) + "…" : d.name,
    }));
  }, [raw]);

  /* ── Summary KPIs ── */
  const totalRevenue = raw.harvests.reduce((s, h) => s + (h.totalValue || 0), 0);
  const totalExpenses = raw.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  if (loading) {
    return (
      <MobileLayout title={t("analytics", "Analytics")}>
        <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white/50 dark:bg-slate-900/40">
          <RefreshCw size={28} className="animate-spin text-emerald-500" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={t("analytics", "Analytics")}>
      <div className="space-y-6 pb-8">

        {/* ── KPI Summary Row ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/20 dark:from-emerald-600 dark:to-teal-700">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <p className="text-sm font-bold text-emerald-100 flex items-center gap-2">
              <TrendingUp size={16} /> Net Farm Profit
            </p>
            <p className="mt-1 text-4xl font-black tracking-tight">
              {netProfit >= 0 ? "+" : ""}₱{Math.abs(netProfit).toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-200">
              {profitMargin}% margin · {raw.crops.length} crops tracked
            </p>
          </div>

          {[
            { label: "Total Revenue", value: totalRevenue, icon: TrendingUp, positive: true },
            { label: "Total Expenses", value: totalExpenses, icon: TrendingDown, positive: false },
          ].map(({ label, value, icon: Ic, positive }) => (
            <div key={label} className="rounded-[1.5rem] border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
              <Ic size={18} className={positive ? "text-emerald-500" : "text-rose-500"} />
              <p className="mt-2 text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
                ₱{value.toLocaleString()}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Chart 1: Monthly Profit Over Time ── */}
        <ChartCard
          title="Profit Over Time"
          subtitle="Monthly harvest revenue vs expenses"
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          isEmpty={profitData.length < 1}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={profitData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.harvest} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.harvest} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.expense} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.expense} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.profit} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS.profit} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.harvest} fill="url(#gradRevenue)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke={COLORS.expense} fill="url(#gradExpense)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="profit" name="Net Profit" stroke={COLORS.profit} fill="url(#gradProfit)" strokeWidth={2.5} dot={{ r: 3, fill: COLORS.profit }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 2: Crop Growth Progress ── */}
        <ChartCard
          title="Crop Growth Timeline"
          subtitle="Active crops — % toward harvest"
          icon={Sprout}
          iconColor="text-emerald-600 dark:text-emerald-400"
          isEmpty={cropGrowthData.length === 0}
        >
          <ResponsiveContainer width="100%" height={Math.max(160, cropGrowthData.length * 52)}>
            <BarChart data={cropGrowthData} layout="vertical" margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} width={68} />
              <Tooltip
                content={({ active, payload, label }) => active && payload?.length ? (
                  <div className="rounded-2xl border border-slate-200/60 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</p>
                    <p className="mt-1 text-base font-black text-emerald-500">{payload[0].value}% complete</p>
                  </div>
                ) : null}
              />
              <Bar dataKey="progress" name="Progress" radius={[0, 8, 8, 0]} barSize={22}>
                {cropGrowthData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.progress >= 95 ? COLORS.profit : entry.progress >= 75 ? COLORS.ready : entry.progress >= 25 ? "#22c55e" : "#84cc16"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 px-1">
            {[["#84cc16","Seedling (0–25%)"],["#22c55e","Vegetative (25–75%)"],["#f59e0b","Maturing (75–95%)"],["#10b981","Harvest Ready (95%+)"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* ── Chart 3: Expense Trends by Category ── */}
        <ChartCard
          title="Expense Trends"
          subtitle="Monthly breakdown by category"
          icon={TrendingDown}
          iconColor="text-rose-600 dark:text-rose-400"
          isEmpty={expenseTrendData.length < 1}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expenseTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              {["Seeds","Fertilizer","Pesticide","Labor","Other"].map((cat, i) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={PIE_COLORS[i]} radius={i === 4 ? [4,4,0,0] : [0,0,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 4: Expense Category Pie ── */}
        <ChartCard
          title="Spending Breakdown"
          subtitle="Where your money goes"
          icon={Leaf}
          iconColor="text-violet-600 dark:text-violet-400"
          isEmpty={expensePieData.length === 0}
        >
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {expensePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => active && payload?.length ? (
                    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-xl text-xs font-bold dark:border-slate-800 dark:bg-slate-900/95">
                      <p style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
                      <p className="text-slate-700 dark:text-slate-200">₱{Number(payload[0].value).toLocaleString()}</p>
                    </div>
                  ) : null}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-1 flex-col gap-2">
              {expensePieData.map((entry, i) => {
                const total = expensePieData.reduce((s, e) => s + e.value, 0);
                const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                return (
                  <div key={entry.name}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{pct}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        {/* ── Chart 5: Revenue vs Cost Per Crop ── */}
        <ChartCard
          title="Crop Revenue vs Cost"
          subtitle="Compare return on each crop"
          icon={BarChart3}
          iconColor="text-blue-600 dark:text-blue-400"
          isEmpty={cropCompareData.length === 0}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cropCompareData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="shortName" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₱${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.harvest} radius={[6,6,0,0]} barSize={18} />
              <Bar dataKey="cost" name="Cost" fill={COLORS.expense} radius={[6,6,0,0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </MobileLayout>
  );
}

export default Analytics;
