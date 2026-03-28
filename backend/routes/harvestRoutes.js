const express = require("express");
const router = express.Router();
const { getHarvests, createHarvest, deleteHarvest } = require("../controllers/harvestController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getHarvests).post(protect, createHarvest);
router.route("/:id").delete(protect, deleteHarvest);

module.exports = router;