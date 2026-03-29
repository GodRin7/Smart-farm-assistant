import API from "./axios";

/**
 * Fetch a greeting from the Farmer Guide NPC.
 * @param {string} lang - "en" (default) or "tl" (Tagalog/Filipino)
 */
export const getAssistantGreeting = async (lang = "en") => {
  const { data } = await API.get(`/assistant/greeting?lang=${lang}`);
  return data;
};

/**
 * Get active crops from the NPC assistant (pre-formatted).
 * @param {string} lang - "en" or "tl"
 */
export const getAssistantCrops = async (lang = "en") => {
  const { data } = await API.get(`/assistant/crops?lang=${lang}`);
  return data;
};

/**
 * Get recent activities from the NPC assistant (pre-formatted).
 * @param {string} lang - "en" or "tl"
 */
export const getAssistantActivities = async (lang = "en") => {
  const { data } = await API.get(`/assistant/activities?lang=${lang}`);
  return data;
};

/**
 * Get recent expenses from the NPC assistant (pre-formatted).
 * @param {string} lang - "en" or "tl"
 */
export const getAssistantExpenses = async (lang = "en") => {
  const { data } = await API.get(`/assistant/expenses?lang=${lang}`);
  return data;
};

/**
 * Get harvest records from the NPC assistant (pre-formatted).
 * @param {string} lang - "en" or "tl"
 */
export const getAssistantHarvests = async (lang = "en") => {
  const { data } = await API.get(`/assistant/harvests?lang=${lang}`);
  return data;
};

/**
 * Get farm summary from the NPC assistant (pre-formatted).
 * @param {string} lang - "en" or "tl"
 */
export const getAssistantSummary = async (lang = "en") => {
  const { data } = await API.get(`/assistant/summary?lang=${lang}`);
  return data;
};

/**
 * Send a chat message to the Farmer Guide NPC.
 * @param {string} message - User's free-form chat message
 * @param {string} lang - "en" or "tl"
 */
export const postAssistantChat = async (message, lang = "en") => {
  const { data } = await API.post(`/assistant/chat?lang=${lang}`, { message });
  return data;
};
