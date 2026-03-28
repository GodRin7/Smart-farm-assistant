import BottomNav from "./BottomNav";
import { useTheme } from "../context/ThemeContext";

function MobileLayout({ title, children, rightAction }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f7f8f2] pb-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {rightAction}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">{children}</main>

      <BottomNav />
    </div>
  );
}

export default MobileLayout;