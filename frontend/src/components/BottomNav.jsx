import { Link, useLocation } from "react-router-dom";
import { Home, Sprout, Wallet, ClipboardList, User } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { name: t("dashboard"), path: "/dashboard", icon: Home },
    { name: t("crops"), path: "/crops", icon: Sprout },
    { name: t("harvests"), path: "/harvests", icon: ClipboardList },
    { name: t("expenses"), path: "/expenses", icon: Wallet },
    { name: t("profile"), path: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-[#070b14]/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] transition-colors duration-300">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex min-w-[56px] flex-col items-center rounded-2xl px-3 py-2 text-xs transition-all duration-300 ${
                active
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className={`transition-transform duration-300 ${active ? '-translate-y-0.5' : 'group-hover:-translate-y-0.5'}`}>
                <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;