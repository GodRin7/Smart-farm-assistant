const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const Crop = require("../models/Crop");
const Activity = require("../models/Activity");
const Expense = require("../models/Expense");
const Harvest = require("../models/Harvest");

// ─── Bilingual string library ───────────────────────────────────────────────
const t = {
  en: {
    greeting: (name) =>
      `Hello${name ? ", " + name : ""}! I'm your Farmer Guide. How can I help you today?`,

    // Crops
    cropsIntro: (count) =>
      count === 0
        ? "You don't have any active crops right now."
        : `You have ${count} active crop${count !== 1 ? "s" : ""} growing right now.`,
    cropItem: (crop) => {
      const date = crop.expectedHarvestDate
        ? new Date(crop.expectedHarvestDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "unknown date";
      return {
        label: `${crop.cropName}${crop.plotName ? " — " + crop.plotName : ""}`,
        detail: `Expected harvest: ${date}`,
        badge: crop.status,
      };
    },

    // Activities
    activitiesIntro: (count) =>
      count === 0
        ? "No recent farm activities recorded yet."
        : `Here are your ${count} most recent farm activit${count !== 1 ? "ies" : "y"}.`,
    activityItem: (act) => ({
      label: act.activityType.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      detail: `${act.crop?.cropName || "Unknown crop"} · ${new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    }),

    // Expenses
    expensesIntro: (total) =>
      total === 0
        ? "No expenses recorded yet. Keep track of your costs here."
        : `Your recent farm expenses total ₱${Number(total).toLocaleString()}.`,
    expenseItem: (exp) => ({
      label: `${exp.category.replace(/\b\w/g, (c) => c.toUpperCase())} — ₱${Number(exp.amount).toLocaleString()}`,
      detail: `${exp.crop?.cropName || "Unknown crop"} · ${new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    }),

    // Harvests
    harvestsIntro: (count, total) =>
      count === 0
        ? "No harvest records found yet. Add your first harvest!"
        : `You have ${count} harvest record${count !== 1 ? "s" : ""} with a total value of ₱${Number(total).toLocaleString()}.`,
    harvestItem: (h) => ({
      label: `${h.crop?.cropName || "Unknown"} — ₱${Number(h.totalValue).toLocaleString()}`,
      detail: `${h.quantity} ${h.unit} · ${new Date(h.harvestDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    }),

    // Summary
    summaryIntro: (s) =>
      `You have ${s.activeCrops} active crop${s.activeCrops !== 1 ? "s" : ""}, ` +
      `₱${Number(s.totalExpenses).toLocaleString()} in expenses, ` +
      `and ₱${Number(s.totalHarvestValue).toLocaleString()} in harvest value.`,

    // Quick replies
    quickReplies: ["crops", "activities", "expenses", "harvests", "summary"],
    quickReplyLabels: {
      crops: "🌱 Active Crops",
      activities: "🗓 Recent Activities",
      expenses: "💸 Recent Expenses",
      harvests: "🌾 Harvest Records",
      summary: "📊 My Farm Summary",
    },
  },

  tl: {
    greeting: (name) =>
      `Kamusta${name ? ", " + name : ""}! Ako ang iyong Gabay sa Bukid. Paano kita matutulungan ngayon?`,

    // Crops
    cropsIntro: (count) =>
      count === 0
        ? "Wala kang aktibong pananim sa ngayon."
        : `Mayroon kang ${count} aktibong pananim ngayon.`,
    cropItem: (crop) => {
      const date = crop.expectedHarvestDate
        ? new Date(crop.expectedHarvestDate).toLocaleDateString("fil-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "hindi matukoy";
      return {
        label: `${crop.cropName}${crop.plotName ? " — " + crop.plotName : ""}`,
        detail: `Inaasahang ani: ${date}`,
        badge: crop.status === "active" ? "aktibo" : crop.status,
      };
    },

    // Activities
    activitiesIntro: (count) =>
      count === 0
        ? "Wala pang naitala na aktibidad sa bukid."
        : `Narito ang iyong ${count} pinakabagong aktibidad sa bukid.`,
    activityItem: (act) => {
      const typeMap = {
        land_preparation: "Paghahanda ng Lupa",
        planting: "Pagtatanim",
        watering: "Pagdidilig",
        fertilizing: "Pagpapataba",
        spraying: "Pag-spray",
        weeding: "Pag-aalis ng Damo",
        harvesting: "Pag-aani",
        others: "Iba Pa",
      };
      return {
        label: typeMap[act.activityType] || act.activityType,
        detail: `${act.crop?.cropName || "Hindi kilala"} · ${new Date(act.date).toLocaleDateString("fil-PH", { month: "short", day: "numeric" })}`,
      };
    },

    // Expenses
    expensesIntro: (total) =>
      total === 0
        ? "Wala pang gastos na naitala. Itala ang iyong mga gastos dito."
        : `Ang iyong mga kamakailang gastos sa bukid ay ₱${Number(total).toLocaleString()} ang kabuuan.`,
    expenseItem: (exp) => {
      const catMap = {
        seeds: "Binhi",
        fertilizer: "Pataba",
        pesticide: "Pestisidyo",
        labor: "Manggagawa",
        transportation: "Transportasyon",
        irrigation: "Irigasyon",
        others: "Iba Pa",
      };
      return {
        label: `${catMap[exp.category] || exp.category} — ₱${Number(exp.amount).toLocaleString()}`,
        detail: `${exp.crop?.cropName || "Hindi kilala"} · ${new Date(exp.date).toLocaleDateString("fil-PH", { month: "short", day: "numeric" })}`,
      };
    },

    // Harvests
    harvestsIntro: (count, total) =>
      count === 0
        ? "Wala pang talaan ng ani. Idagdag ang iyong unang ani!"
        : `May ${count} talaan ng ani ka na may kabuuang halagang ₱${Number(total).toLocaleString()}.`,
    harvestItem: (h) => ({
      label: `${h.crop?.cropName || "Hindi kilala"} — ₱${Number(h.totalValue).toLocaleString()}`,
      detail: `${h.quantity} ${h.unit} · ${new Date(h.harvestDate).toLocaleDateString("fil-PH", { month: "short", day: "numeric", year: "numeric" })}`,
    }),

    // Summary
    summaryIntro: (s) =>
      `Mayroon kang ${s.activeCrops} aktibong pananim, ` +
      `₱${Number(s.totalExpenses).toLocaleString()} na gastos, ` +
      `at ₱${Number(s.totalHarvestValue).toLocaleString()} na kita sa ani.`,

    // Quick replies
    quickReplies: ["crops", "activities", "expenses", "harvests", "summary"],
    quickReplyLabels: {
      crops: "🌱 Mga Aktibong Pananim",
      activities: "🗓 Kamakailang Aktibidad",
      expenses: "💸 Kamakailang Gastos",
      harvests: "🌾 Mga Talaan ng Ani",
      summary: "📊 Buod ng Aking Bukid",
    },
  },
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const getLang = (req) => {
  const lang = req.query.lang;
  return lang === "tl" ? "tl" : "en";
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @route   GET /api/assistant/greeting
const getGreeting = async (req, res) => {
  const lang = getLang(req);
  const strings = t[lang];
  res.json({
    topic: "greeting",
    message: strings.greeting(req.user?.name),
    items: [],
    quickReplies: strings.quickReplies,
    quickReplyLabels: strings.quickReplyLabels,
  });
};

// @route   GET /api/assistant/crops
const getCropsAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const strings = t[lang];

    const crops = await Crop.find({ user: req.user._id, status: "active" })
      .sort({ expectedHarvestDate: 1 })
      .limit(5);

    res.json({
      topic: "crops",
      message: strings.cropsIntro(crops.length),
      items: crops.map(strings.cropItem),
      quickReplies: strings.quickReplies.filter((q) => q !== "crops"),
      quickReplyLabels: strings.quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant crops error:", error);
    res.status(500).json({ message: "Error fetching crop data" });
  }
};

// @route   GET /api/assistant/activities
const getActivitiesAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const strings = t[lang];

    const activities = await Activity.find({ user: req.user._id })
      .populate("crop", "cropName")
      .sort({ date: -1 })
      .limit(5);

    res.json({
      topic: "activities",
      message: strings.activitiesIntro(activities.length),
      items: activities.map(strings.activityItem),
      quickReplies: strings.quickReplies.filter((q) => q !== "activities"),
      quickReplyLabels: strings.quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant activities error:", error);
    res.status(500).json({ message: "Error fetching activity data" });
  }
};

// @route   GET /api/assistant/expenses
const getExpensesAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const strings = t[lang];

    const expenses = await Expense.find({ user: req.user._id })
      .populate("crop", "cropName")
      .sort({ date: -1 })
      .limit(5);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      topic: "expenses",
      message: strings.expensesIntro(total),
      items: expenses.map(strings.expenseItem),
      quickReplies: strings.quickReplies.filter((q) => q !== "expenses"),
      quickReplyLabels: strings.quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant expenses error:", error);
    res.status(500).json({ message: "Error fetching expense data" });
  }
};

// @route   GET /api/assistant/harvests
const getHarvestsAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const strings = t[lang];

    const harvests = await Harvest.find({ user: req.user._id })
      .populate("crop", "cropName")
      .sort({ harvestDate: -1 })
      .limit(5);

    const total = harvests.reduce((sum, h) => sum + h.totalValue, 0);

    res.json({
      topic: "harvests",
      message: strings.harvestsIntro(harvests.length, total),
      items: harvests.map(strings.harvestItem),
      quickReplies: strings.quickReplies.filter((q) => q !== "harvests"),
      quickReplyLabels: strings.quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant harvests error:", error);
    res.status(500).json({ message: "Error fetching harvest data" });
  }
};

// @route   GET /api/assistant/summary
const getSummaryAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const strings = t[lang];
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [activeCrops, expenseAgg, harvestAgg] = await Promise.all([
      Crop.countDocuments({ user: userId, status: "active" }),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Harvest.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: "$totalValue" } } },
      ]),
    ]);

    const summary = {
      activeCrops,
      totalExpenses: expenseAgg[0]?.total || 0,
      totalHarvestValue: harvestAgg[0]?.total || 0,
    };

    res.json({
      topic: "summary",
      message: strings.summaryIntro(summary),
      items: [
        {
          label: lang === "tl" ? "Aktibong Pananim" : "Active Crops",
          detail: String(summary.activeCrops),
        },
        {
          label: lang === "tl" ? "Kabuuang Gastos" : "Total Expenses",
          detail: `₱${Number(summary.totalExpenses).toLocaleString()}`,
        },
        {
          label: lang === "tl" ? "Kita sa Ani" : "Harvest Value",
          detail: `₱${Number(summary.totalHarvestValue).toLocaleString()}`,
        },
      ],
      quickReplies: strings.quickReplies.filter((q) => q !== "summary"),
      quickReplyLabels: strings.quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant summary error:", error);
    res.status(500).json({ message: "Error fetching summary data" });
  }
};

// @route   POST /api/assistant/chat
const chatWithAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      const errMessage = lang === "tl" 
        ? "Kinakailangan mong ilagay ang iyong GEMINI_API_KEY sa backend .env file para gumana ako." 
        : "You need to add your GEMINI_API_KEY to the backend .env file to use the AI chatbot.";
      return res.json({
        topic: "chat",
        message: errMessage,
        items: [],
        quickReplies: t[lang].quickReplies,
        quickReplyLabels: t[lang].quickReplyLabels,
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Fetch broad context so AI knows what's going on
    const [activeCropsCount, expenseAgg, harvestAgg] = await Promise.all([
      Crop.countDocuments({ user: userId, status: "active" }),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Harvest.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: "$totalValue" } } },
      ]),
    ]);

    const activeCrops = await Crop.find({ user: userId, status: "active" })
      .select("cropName variety expectedHarvestDate")
      .limit(10); // cap to limit prompt size

    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalHarvestValue = harvestAgg[0]?.total || 0;

    const farmContext = `You are "Farmer Guide", a friendly and helpful AI assistant for the Smart Farm Assistant app.
The user is talking to you. You are completely fluent in both English and Tagalog/Filipino.
You should naturally reply in the same language the user speaks to you. If they ask you to speak in Tagalog, strictly do so.
Keep your responses short, conversational, and very easy to read on a mobile device. Break your text into small paragraphs. Use emojis naturally.

Here is the current live data about the user's farm:
- Active Crops Count: ${activeCropsCount}
- Active Crops Details: ${activeCrops.map(c => c.cropName + (c.variety ? ` (${c.variety})` : '')).join(', ') || 'None'}
- Total Expenses: ₱${totalExpenses.toLocaleString()}
- Total Harvest Value: ₱${totalHarvestValue.toLocaleString()}
- User's name: ${req.user.name || "Farmer"}

Answer the user's question directly using this context. If they ask a general farming question, answer it concisely. If their question is unrelated to farming or their farm data, playfully steer them back to farming topics.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = farmContext + "\n\nUser Question:\n" + message;

    const aiRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      topic: "chat",
      message: aiRes.text,
      items: [],
      // Refresh quick replies so they remain available after chat
      quickReplies: t[lang].quickReplies,
      quickReplyLabels: t[lang].quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant chat error:", error);
    res.status(500).json({ message: "Error communicating with AI" });
  }
};

module.exports = {
  getGreeting,
  getCropsAssistant,
  getActivitiesAssistant,
  getExpensesAssistant,
  getHarvestsAssistant,
  getSummaryAssistant,
  chatWithAssistant,
};
