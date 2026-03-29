import BottomNav from "./BottomNav";
import FarmerAssistant from "./FarmerAssistant";
import { useTheme } from "../context/ThemeContext";

function MobileLayout({ title, children, rightAction }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-slate-50 pb-24 text-slate-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-slate-100 overflow-x-hidden">
      {/* Decorative Background Blob */}
      <div className="pointer-events-none absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-[100px] dark:bg-emerald-600/10"></div>
      <div className="pointer-events-none absolute top-40 -left-20 -z-10 h-72 w-72 rounded-full bg-blue-400/10 blur-[80px] dark:bg-blue-600/10"></div>

      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-[#070b14]/70 shadow-sm transition-all duration-300">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {rightAction}
            <button
              onClick={toggleTheme}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 py-6 space-y-6 relative z-10">{children}</main>

      <FarmerAssistant />
      <BottomNav />
    </div>
  );
}

export default MobileLayout;