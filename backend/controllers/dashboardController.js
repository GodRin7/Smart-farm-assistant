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
    today.setHours(0, 0, 0, 0);
    const next14Days = new Date(today);
    next14Days.setDate(today.getDate() + 14);
    next14Days.setHours(23, 59, 59, 999);

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

    // Crops with harvest date within next 14 days (including overdue crops)
    const upcomingHarvests = await Crop.find({
      user: userId,
      status: "active",
      expectedHarvestDate: { $lte: next14Days },
    })
      .sort({ expectedHarvestDate: 1 })
      .limit(5);

    // ANALYTICS ENGINE
    const cropAnalyticsRaw = await Crop.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: "expenses",
          localField: "_id",
          foreignField: "crop",
          as: "cropExpenses"
        }
      },
      {
        $lookup: {
          from: "harvests",
          localField: "_id",
          foreignField: "crop",
          as: "cropHarvests"
        }
      },
      {
        $lookup: {
          from: "activities",
          localField: "_id",
          foreignField: "crop",
          as: "cropActivities"
        }
      },
      {
        $project: {
          cropName: 1,
          plotName: 1,
          status: 1,
          expectedHarvestDate: 1,
          totalExpenses: { $sum: "$cropExpenses.amount" },
          totalHarvestValue: { $sum: "$cropHarvests.totalValue" },
          activityCount: { $size: "$cropActivities" },
          latestActivity: { $max: "$cropActivities.date" }
        }
      }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const next5Days = new Date();
    next5Days.setDate(next5Days.getDate() + 5);

    let mostActiveCropId = null;
    let maxActivities = -1;

    const cropAnalytics = cropAnalyticsRaw.map(crop => {
      const netEstimate = (crop.totalHarvestValue || 0) - (crop.totalExpenses || 0);
      
      let needsAttention = false;
      let attentionReason = [];
      
      // Activity rule
      if (!crop.latestActivity || new Date(crop.latestActivity) < sevenDaysAgo) {
        needsAttention = true;
        attentionReason.push("inactive7");
      }
      
      // Harvest rule
      if (crop.expectedHarvestDate && new Date(crop.expectedHarvestDate) <= next5Days) {
        needsAttention = true;
        attentionReason.push("harvestAppr");
      }

      if (crop.activityCount > maxActivities) {
        maxActivities = crop.activityCount;
        mostActiveCropId = crop._id.toString();
      }

      return {
        _id: crop._id,
        cropName: crop.cropName,
        plotName: crop.plotName,
        status: crop.status,
        totalExpenses: crop.totalExpenses || 0,
        totalHarvestValue: crop.totalHarvestValue || 0,
        netEstimate,
        activityCount: crop.activityCount,
        needsAttention: crop.status === "active" ? needsAttention : false,
        attentionReason: crop.status === "active" ? attentionReason : []
      };
    });

    const refinedAnalytics = cropAnalytics.map(crop => ({
      ...crop,
      isMostActive: crop._id.toString() === mostActiveCropId && maxActivities > 0
    }));

    const cropsNeedingAttention = refinedAnalytics.filter(c => c.needsAttention);

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
      analytics: {
        cropAnalytics: refinedAnalytics,
        cropsNeedingAttention
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error while loading dashboard" });
  }
};

module.exports = { getDashboard };