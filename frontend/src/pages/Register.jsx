import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "../context/TranslationContext";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

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
            <h1 className="text-2xl font-bold">{t("registerTitle")}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Start managing your farm records.
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
              {t("fullName")}
            </label>
            <input
              type="text"
              name="name"
              placeholder={t("fullName")}
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
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
            {loading ? t("loading") : t("registerHere")}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          {t("haveAccount")}{" "}
          <Link to="/login" className="font-medium text-green-600 dark:text-green-400">
            {t("loginHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;