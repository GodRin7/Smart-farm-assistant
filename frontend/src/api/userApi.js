import API from "./axios";

/**
 * Update the logged-in user's preferences (theme and/or language).
 * @param {{ themePreference?: "light"|"dark"|"system", languagePreference?: "en"|"tl" }} prefs
 * @returns updated user object (without token)
 */
export const updatePreferences = async (prefs = {}) => {
  const { data } = await API.put("/auth/preferences", prefs);
  return data;
};
