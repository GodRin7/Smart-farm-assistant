const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const Crop = require("../models/Crop");
const Activity = require("../models/Activity");
const Expense = require("../models/Expense");
const Harvest = require("../models/Harvest");

let aiClient = null;

const callGeminiAPI = async (userMsg, userId) => {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) return null;
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // Gather farm context
  try {
    const [activeCrops, expAgg, harvAgg] = await Promise.all([
      Crop.countDocuments({ user: userId, status: "active" }),
      Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Harvest.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: "$totalValue" } } }])
    ]);
    const expenses = expAgg[0]?.total || 0;
    const harvests = harvAgg[0]?.total || 0;

    const systemInstruction = `You are Mang Mando, a wise, deeply experienced Filipino farmer serving as an RPG assistant.
- You must reply cheerfully in authentic conversational Taglish (Tagalog mixed with farming English terms) natively.
- Address the user warmly as "kaibigan" or "partner".
- Provide extremely brief, highly concise answers (1 to 2 short sentences ONLY) as you are speaking in a small game dialogue box.
- Never use markdown styling like asterisks or bolding. Use plain text.
- Here is the user's current farm context: They have ${activeCrops} active crops, ₱${expenses} total expenses, and ₱${harvests} crop harvest value.
- Answer their direct question based on real-world farming knowledge or their farm context. 
- IMPORTANT: If they ask you General Knowledge questions (like math, science, history, programming, etc.) completely unrelated to farming, YOU MUST STILL ANSWER THEM accurately and enthusiastically while keeping your Mang Mando farmer persona! Do not ever refuse to answer.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemInstruction}\n\nUser Question: ${userMsg}`,
    });
    return response.text;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return null;
  }
};


// ─── Bilingual string library ───────────────────────────────────────────────
const t = {
  en: {
    greeting: (name) =>
      `Kumusta${name ? " " + name : ""}! Ako si Mang Mando. Magandang araw para sa bukid! What can I help you check on today?`,

    // Crops
    cropsIntro: (count) =>
      count === 0
        ? "Aba, looks like the soil is resting. Wala tayong active crops sproutin' right now."
        : `Aba'y tignan mo nga naman! We've got ${count} active crop field${count !== 1 ? "s" : ""} growing strong out there.`,
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
        ? "Wala pa tayong bagong activities lately. No recent farm chores recorded yet."
        : `Sure thing, kaibigan! Heto ang ${count} most recent chores we've been busy with on the farm.`,
    activityItem: (act) => ({
      label: act.activityType.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      detail: `${act.crop?.cropName || "Unknown crop"} · ${new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    }),

    // Expenses
    expensesIntro: (total) =>
      total === 0
        ? "Nakakaluwag-luwag tayo! No expenses recorded yet. Just make sure to log 'em when you buy supplies."
        : `Ayon sa ating listahan, our recent farm expenses total to exactly ₱${Number(total).toLocaleString()}.`,
    expenseItem: (exp) => ({
      label: `${exp.category.replace(/\b\w/g, (c) => c.toUpperCase())} — ₱${Number(exp.amount).toLocaleString()}`,
      detail: `${exp.crop?.cropName || "Unknown crop"} · ${new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    }),

    // Harvests
    harvestsIntro: (count, total) =>
      count === 0
        ? "Wala pa tayong harvests yet. But don't you worry, konting tiyaga pa!"
        : `Biyaya! We have ${count} harvest record${count !== 1 ? "s" : ""} brought in, giving us a total value of ₱${Number(total).toLocaleString()}.`,
    harvestItem: (h) => ({
      label: `${h.crop?.cropName || "Unknown"} — ₱${Number(h.totalValue).toLocaleString()}`,
      detail: `${h.quantity} ${h.unit} · ${new Date(h.harvestDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    }),

    // Summary
    summaryIntro: (s) =>
      `Tingnan natin! We've got ${s.activeCrops} active crop${s.activeCrops !== 1 ? "s" : ""} growing. ` +
      `Gumastos tayo ng mga ₱${Number(s.totalExpenses).toLocaleString()} so far, ` +
      `and our harvests have brought in a fine ₱${Number(s.totalHarvestValue).toLocaleString()}!`,

    // Upcoming Harvests
    upcomingHarvestsIntro: (count) =>
      count === 0
        ? "Chineck ko sa kalendaryo. Wala tayong aanihin in the next two weeks. Keep watering!"
        : `Ihanda na ang mga kaing! We have ${count} crop${count !== 1 ? "s" : ""} approaching harvest time very soon!`,
    upcomingHarvestItem: (crop) => ({
      label: `${crop.cropName}${crop.plotName ? " — " + crop.plotName : ""}`,
      detail: `Expected: ${new Date(crop.expectedHarvestDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      badge: "soon",
    }),

    // Highest Expenses
    highestExpenseIntro: (count) =>
       count === 0 ? "Kulang pa ang records natin to do the math yet." : "Naku po, here are the crops that are eating up the biggest chunk of our budget:",
    highestExpenseItem: (crop) => ({
      label: `${crop.cropName || "Unknown"} — ₱${Number(crop.totalExpenses).toLocaleString()}`,
      detail: `${crop.expenseCount} expense records total`,
    }),

    fallbackMessage: "Pasensya na kaibigan, medyo mahina na ang pandinig ko! Could you try asking me about your 'crops', 'expenses', 'highest expenses', 'upcoming harvests', or 'activities'?",

    // Quick replies
    quickReplies: ["crops", "activities", "expenses", "upcoming_harvests", "highest_expenses"],
    quickReplyLabels: {
      crops: "🌱 Active Crops",
      activities: "🗓 Recent Activities",
      expenses: "💸 Recent Expenses",
      upcoming_harvests: "🌾 Upcoming Harvests",
      highest_expenses: "🔥 Highest Expenses",
    },
  },

  tl: {
    greeting: (name) =>
      `Kumusta, kaibigan${name ? " " + name : ""}! Ako si Mang Mando, ang iyong gabay. Magandang araw para pumunta sa bukid! Ano ang matutulong ko sa'yo ngayon?`,

    // Crops
    cropsIntro: (count) =>
      count === 0
        ? "Aba, mukhang nagpapahinga pa ang ating lupa. Wala tayong aktibong pananim sa ngayon."
        : `Magandang balita! Mayroon tayong ${count} aktibong pananim na masigabong tumutubo sa bukid ngayon.`,
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
        ? "Wala pa tayong naitalang bagong pinagkaabalahan sa bukid kailan lang."
        : `Narito ang ${count} sa mga pinakahuling gawain na pinagpawisan natin sa bukid!`,
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
        ? "Nakakaluwag-luwag tayo! Wala pa tayong naitalang gastos. Mag-ingat sa pagbili ng supplies, ah!"
        : `Ayon sa ating listahan, ang mga kamakailang gastos natin sa bukid ay pumalo sa ₱${Number(total).toLocaleString()}.`,
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
        ? "Wala pa tayong naaaning pananim. Konting tiyaga pa, kaibigan!"
        : `Napakagandang balita! May ${count} talaan tayo ng ani na may kabuuang halagang ₱${Number(total).toLocaleString()}. Biyaya!`,
    harvestItem: (h) => ({
      label: `${h.crop?.cropName || "Hindi kilala"} — ₱${Number(h.totalValue).toLocaleString()}`,
      detail: `${h.quantity} ${h.unit} · ${new Date(h.harvestDate).toLocaleDateString("fil-PH", { month: "short", day: "numeric", year: "numeric" })}`,
    }),

    // Summary
    summaryIntro: (s) =>
      `Tingnan natin! Mayroon tayong ${s.activeCrops} aktibong pananim sa kasalukuyan. ` +
      `Naglabas tayo ng ₱${Number(s.totalExpenses).toLocaleString()} na puhunan, ` +
      `ngunit kumita naman tayo ng ₱${Number(s.totalHarvestValue).toLocaleString()} mula sa ating mga ani!`,

    // Upcoming Harvests
    upcomingHarvestsIntro: (count) =>
      count === 0
        ? "Chineck ko ang kalendaryo natin, mukhang wala tayong aanihin sa susunod na dalawang linggo. Patuloy lang sa pagdidilig!"
        : `Ihanda na ang mga kaing! Mayroon tayong ${count} pananim na napakalapit nang anihin!`,
    upcomingHarvestItem: (crop) => ({
      label: `${crop.cropName}${crop.plotName ? " — " + crop.plotName : ""}`,
      detail: `Inaasahan: ${new Date(crop.expectedHarvestDate).toLocaleDateString("fil-PH", { month: "short", day: "numeric" })}`,
      badge: "lapit na",
    }),

    // Highest Expenses
    highestExpenseIntro: (count) =>
       count === 0 ? "Kulang pa ang ating listahan para malaman ko kung aling tanim ang pinakamagastos." : "Naku po, narito ang mga pananim na pinakamalaki ang kinain sa budget natin:",
    highestExpenseItem: (crop) => ({
      label: `${crop.cropName || "Hindi kilala"} — ₱${Number(crop.totalExpenses).toLocaleString()}`,
      detail: `May ${crop.expenseCount} na tala ng gastos`,
    }),

    fallbackMessage: "Medyo mahina na ang pandinig ko, kaibigan! Subukan mo kayang itanong ang tungkol sa iyong 'pananim', 'gastos', 'malaking gastos', 'parating na ani', o mga 'aktibidad'?",

    // Quick replies
    quickReplies: ["crops", "activities", "expenses", "upcoming_harvests", "highest_expenses"],
    quickReplyLabels: {
      crops: "🌱 Mga Aktibong Pananim",
      activities: "🗓 Kamakailang Aktibidad",
      expenses: "💸 Kamakailang Gastos",
      upcoming_harvests: "🌾 Parating na Ani",
      highest_expenses: "🔥 Pinakamalaking Gastos",
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

// @route   GET /api/assistant/upcoming-harvests
const getUpcomingHarvestsAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const strings = t[lang];
    const today = new Date();
    const next14Days = new Date();
    next14Days.setDate(today.getDate() + 14);

    const crops = await Crop.find({
      user: req.user._id,
      status: "active",
      expectedHarvestDate: { $gte: today, $lte: next14Days },
    })
      .sort({ expectedHarvestDate: 1 })
      .limit(5);

    res.json({
      topic: "upcoming_harvests",
      message: strings.upcomingHarvestsIntro(crops.length),
      items: crops.map(strings.upcomingHarvestItem),
      quickReplies: strings.quickReplies.filter((q) => q !== "upcoming_harvests"),
      quickReplyLabels: strings.quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant upcoming harvests error:", error);
    res.status(500).json({ message: "Error fetching upcoming harvests data" });
  }
};

// @route   GET /api/assistant/highest-expenses
const getHighestExpensesAssistant = async (req, res) => {
  try {
    const lang = getLang(req);
    const strings = t[lang];
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const expenseAgg = await Expense.aggregate([
      { $match: { user: userId, crop: { $ne: null } } },
      { $group: { _id: "$crop", totalExpenses: { $sum: "$amount" }, expenseCount: { $sum: 1 } } },
      { $sort: { totalExpenses: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "crops",
          localField: "_id",
          foreignField: "_id",
          as: "cropDetails"
        }
      },
      { $unwind: "$cropDetails" }
    ]);

    const items = expenseAgg.map(agg => 
      strings.highestExpenseItem({
        cropName: agg.cropDetails.cropName,
        totalExpenses: agg.totalExpenses,
        expenseCount: agg.expenseCount
      })
    );

    res.json({
      topic: "highest_expenses",
      message: strings.highestExpenseIntro(items.length),
      items,
      quickReplies: strings.quickReplies.filter((q) => q !== "highest_expenses"),
      quickReplyLabels: strings.quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant highest expenses error:", error);
    res.status(500).json({ message: "Error fetching highest expenses data" });
  }
};

// @route   POST /api/assistant/chat
const chatWithAssistant = async (req, res) => {
  try {
    let lang = getLang(req);
    const { message } = req.body;
    const lowerMsg = (message || "").toLowerCase();

    // Auto-detect language toggle dynamically
    const tlWords = /(pinakamalaki|gastos|bayad|parating|lapit|ani|anihin|tanim|pananim|gawa|ginawa|buod|lahat|kumusta|kamusta|salamat|tulong|ano|meron)/;
    const enWords = /(highest|big|expensive|cost|upcoming|soon|harvest|crop|plant|active|activity|recent|summary|overall|hello|thanks|thank)/;
    
    if (tlWords.test(lowerMsg) && !enWords.test(lowerMsg)) {
      lang = "tl"; 
      req.query.lang = "tl"; // Override UI string propagation
    } else if (enWords.test(lowerMsg) && !tlWords.test(lowerMsg)) {
      lang = "en";
      req.query.lang = "en";
    }

    // Intent routing via broadened rules
    if (/(hello|hi|hey|kumusta|kamusta|musta|gandang araw|good morning|morning|afternoon|evening)/.test(lowerMsg)) {
      return await getGreeting(req, res);
    }

    if (/(thank|salamat|ty|thanks)/.test(lowerMsg)) {
      return res.json({
        topic: "thanks",
        message: lang === "tl" ? "Walang anuman, kaibigan! May iba pa ba akong maitutulong?" : "Walang anuman, kaibigan! Anything else I can do for ya?",
        items: [],
        quickReplies: t[lang].quickReplies,
        quickReplyLabels: t[lang].quickReplyLabels,
      });
    }

    if (/(help|tulong|ano pwede|what can you|whatdo)/.test(lowerMsg)) {
      const msg = lang === "tl" 
        ? "Nandito ako para tulungan ka! Pwede mo akong tanungin tungkol sa iyong mga pananim, gastos, o mga aanihin. Subukan mong i-click ang mga buttons sa baba!"
        : "Nandito ako to lend a hand! You can ask me about your crops, expenses, or upcoming harvests. Try clicking the choice buttons below!";
      return res.json({
        topic: "help",
        message: msg,
        items: [],
        quickReplies: t[lang].quickReplies,
        quickReplyLabels: t[lang].quickReplyLabels,
      });
    }

    if (/(highest|pinakamalaki|mahal|pinaka mahal|big expense|laki ng gastos|pinakamagastos|malaki|laki|huge|mataas)/.test(lowerMsg)) {
      return await getHighestExpensesAssistant(req, res);
    }
    if (/(expense|gastos|bayad|cost|bili|presyo|pera|magkano|spend|spent)/.test(lowerMsg)) {
      return await getExpensesAssistant(req, res);
    }
    if (/(upcoming|parating|soon|lapit|harvest|ani|aanihin|kukunin|pitas|anihan)/.test(lowerMsg)) {
      return await getUpcomingHarvestsAssistant(req, res);
    }
    if (/(crop|tanim|pananim|plant|active|bunga|halaman|tatanim)/.test(lowerMsg)) {
      return await getCropsAssistant(req, res);
    }
    if (/(activity|aktibidad|gawa|ginawa|recent|huli|chores|trabaho)/.test(lowerMsg)) {
      return await getActivitiesAssistant(req, res);
    }
    if (/(summary|buod|overall|lahat|kabuuan|total)/.test(lowerMsg)) {
      return await getSummaryAssistant(req, res);
    }

    // Unrecognized intent -> Send to Gemini
    const geminiReply = await callGeminiAPI(message, req.user._id);
    const fallbackStr = geminiReply || t[lang].fallbackMessage;

    res.json({
      topic: "fallback",
      message: fallbackStr,
      items: [],
      // Refresh quick replies
      quickReplies: t[lang].quickReplies,
      quickReplyLabels: t[lang].quickReplyLabels,
    });
  } catch (error) {
    console.error("Assistant chat error:", error);
    res.status(500).json({ message: "Error processing the chat" });
  }
};

module.exports = {
  getGreeting,
  getCropsAssistant,
  getActivitiesAssistant,
  getExpensesAssistant,
  getHarvestsAssistant,
  getSummaryAssistant,
  getUpcomingHarvestsAssistant,
  getHighestExpensesAssistant,
  chatWithAssistant,
};
