const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getGreeting,
  getCropsAssistant,
  getActivitiesAssistant,
  getExpensesAssistant,
  getHarvestsAssistant,
  getSummaryAssistant,
  chatWithAssistant,
} = require("../controllers/assistantController");

// All assistant routes are protected
// Optional ?lang=en (default) or ?lang=tl (Tagalog/Filipino)
router.get("/greeting",    protect, getGreeting);
router.get("/crops",       protect, getCropsAssistant);
router.get("/activities",  protect, getActivitiesAssistant);
router.get("/expenses",    protect, getExpensesAssistant);
router.get("/harvests",    protect, getHarvestsAssistant);
router.get("/summary",     protect, getSummaryAssistant);
router.post("/chat",       protect, chatWithAssistant);

module.exports = router;
