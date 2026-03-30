import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "../context/TranslationContext";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [slowLoad, setSlowLoad] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSlowLoad(false);

    // If request takes longer than 3 seconds, Render is likely waking up
    const timeoutId = setTimeout(() => setSlowLoad(true), 3000);

    const result = await login(formData);

    clearTimeout(timeoutId);
    setSlowLoad(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("loginSubtitle")}
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            {theme === "light" ? t("themeDark") : t("themeLight")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("emailAddr")}
            </label>
            <input
              type="email"
              name="email"
              placeholder={t("emailAddr")}
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("password")}
            </label>
            <input
              type="password"
              name="password"
              placeholder={t("password")}
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-green-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
          >
            {loading ? t("loading") : t("loginBtn")}
          </button>
          
          {slowLoad && loading && (
            <p className="animate-pulse text-center text-sm font-medium text-amber-600 dark:text-amber-500">
              Waking up secure server... this can take up to 45 seconds.
            </p>
          )}
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          {t("noAccount")}{" "}
          <Link to="/register" className="font-medium text-green-600 dark:text-green-400">
            {t("registerHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;