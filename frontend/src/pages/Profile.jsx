import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "../context/TranslationContext";
import { LogOut, User, Mail, Globe, Palette, Loader2, FileBarChart, ChevronRight, CalendarDays, BarChart3, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

function Profile() {
  const { user, logout, updatePreferences } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLanguageToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newLang = lang === "en" ? "tl" : "en";
    await updatePreferences({ languagePreference: newLang });
    setIsUpdating(false);
  };

  const handleThemeToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newTheme = theme === "light" ? "dark" : "light";
    await updatePreferences({ themePreference: newTheme });
    toggleTheme();
    setIsUpdating(false);
  };

  return (
    <MobileLayout title={t("myProfile")}>
      <div className="space-y-6">
        
        {/* Account Details */}
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t("accountDetails")}
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <User size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t("nameLabel")}
                </p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Mail size={24} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("emailLabel")}</p>
                <p className="truncate text-base font-bold text-slate-800 dark:text-slate-100">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools & Reports */}
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t("toolsLabel")}
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/reports")}
              className="group flex w-full items-center justify-between rounded-2xl bg-emerald-50/50 p-4 transition-colors hover:bg-emerald-100/50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <FileBarChart size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-slate-800 dark:text-slate-100">
                    {t("reportsTitle")}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    View & Export PDF
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 transition-transform group-hover:translate-x-1 dark:text-slate-500" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t("prefsTitle")}
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={handleLanguageToggle}
              disabled={isUpdating}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-[#0f172a]/50 dark:hover:bg-[#0f172a]/80"
            >
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-slate-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {t("langLabel")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {t("langName")}
                </span>
                {isUpdating && <Loader2 size={16} className="animate-spin text-slate-400" />}
              </div>
            </button>

            <button
              onClick={handleThemeToggle}
              disabled={isUpdating}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-[#0f172a]/50 dark:hover:bg-[#0f172a]/80"
            >
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-slate-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {t("themeLabel")}
                </span>
              </div>
              <span className="text-sm font-bold capitalize text-emerald-600 dark:text-emerald-400">
                {theme === "light" ? t("themeLight") : t("themeDark")}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/50">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tools</h2>
          <div className="space-y-2">
            {[
              { to: "/analytics", label: "Analytics & Charts", icon: BarChart3, color: "text-blue-500" },
              { to: "/calendar", label: "Farm Calendar", icon: CalendarDays, color: "text-emerald-500" },
              { to: "/harvests", label: t("myHarvests"), icon: ClipboardList, color: "text-amber-500" },
              { to: "/reports", label: t("reportsTitle"), icon: FileBarChart, color: "text-violet-500" },
            ].map(({ to, label, icon: Icon, color }) => (
              <Link key={to} to={to} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-[#0f172a]/50 dark:hover:bg-[#0f172a]/80">
                <div className="flex items-center gap-3">
                  <Icon size={20} className={color} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-red-100 px-4 py-4 font-bold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            <LogOut size={20} />
            {t("logoutBtn")}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}

export default Profile;