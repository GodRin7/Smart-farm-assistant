import { Link, useLocation } from "react-router-dom";
import { Home, Sprout, Wallet, ClipboardList, User } from "lucide-react";

const navItems = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Crops", path: "/crops", icon: Sprout },
  { name: "Harvests", path: "/harvests", icon: ClipboardList },
  { name: "Expenses", path: "/expenses", icon: Wallet },
  { name: "Profile", path: "/profile", icon: User },
];

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex min-w-[56px] flex-col items-center rounded-xl px-3 py-2 text-xs ${
                active
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon size={20} />
              <span className="mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;