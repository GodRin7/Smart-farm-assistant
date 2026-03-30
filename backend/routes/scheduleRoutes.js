const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getSchedules,
  createSchedule,
  toggleSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

router.route("/").get(protect, getSchedules).post(protect, createSchedule);
router.route("/:id/toggle").patch(protect, toggleSchedule);
router.route("/:id").delete(protect, deleteSchedule);

module.exports = router;
