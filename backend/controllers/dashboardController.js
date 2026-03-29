const mongoose = require("mongoose");
const Crop = require("../models/Crop");
const Expense = require("../models/Expense");
const Activity = require("../models/Activity");
const Harvest = require("../models/Harvest");

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    // Cast to ObjectId so aggregation $match works correctly
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const today = new Date();
    const next14Days = new Date();
    next14Days.setDate(today.getDate() + 14);

    const activeCropsCount = await Crop.countDocuments({
      user: userId,
      status: "active",
    });

    const expenseAgg = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
        },
      },
    ]);

    const harvestAgg = await Harvest.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalHarvestValue: { $sum: "$totalValue" },
        },
      },
    ]);

    const recentActivities = await Activity.find({ user: userId })
      .populate("crop", "cropName plotName")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const latestExpenses = await Expense.find({ user: userId })
      .populate("crop", "cropName plotName")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Crops with harvest date within next 14 days
    const upcomingHarvests = await Crop.find({
      user: userId,
      status: "active",
      expectedHarvestDate: { $gte: today, $lte: next14Days },
    })
      .sort({ expectedHarvestDate: 1 })
      .limit(5);

    res.status(200).json({
      summary: {
        activeCrops: activeCropsCount,
        totalExpenses: expenseAgg[0]?.totalExpenses || 0,
        totalHarvestValue: harvestAgg[0]?.totalHarvestValue || 0,
        upcomingHarvestsCount: upcomingHarvests.length,
      },
      recentActivities,
      latestExpenses,
      upcomingHarvests,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error while loading dashboard" });
  }
};

module.exports = { getDashboard };