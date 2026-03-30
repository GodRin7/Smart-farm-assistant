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
          estimatedRevenue: 1,
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
    const smartAlerts = [];

    const cropAnalytics = cropAnalyticsRaw.map(crop => {
      const netEstimate = (crop.totalHarvestValue || 0) - (crop.totalExpenses || 0);
      
      let needsAttention = false;
      let attentionReason = [];
      
      if (crop.status === "active") {
        // Activity rule
        if (!crop.latestActivity || new Date(crop.latestActivity) < sevenDaysAgo) {
          needsAttention = true;
          attentionReason.push("inactive7");
          smartAlerts.push({
            id: `inact-${crop._id}`,
            type: "warning",
            title: "inactiveAlertTitle",
            message: "inactiveAlertMsg",
            cropName: crop.cropName,
            color: "amber",
            icon: "Clock"
          });
        }
        
        // Harvest rule
        if (crop.expectedHarvestDate) {
          const exp = new Date(crop.expectedHarvestDate);
          if (exp <= next5Days && exp >= today) {
            needsAttention = true;
            attentionReason.push("harvestAppr");
            smartAlerts.push({
              id: `harv-${crop._id}`,
              type: "success",
              title: "harvestAlertTitle",
              message: "harvestAlertMsg",
              cropName: crop.cropName,
              color: "emerald",
              icon: "CheckCircle2"
            });
          } else if (exp < today) {
            needsAttention = true;
            attentionReason.push("overdue");
            smartAlerts.push({
              id: `over-${crop._id}`,
              type: "error",
              title: "overdueAlertTitle",
              message: "overdueAlertMsg",
              cropName: crop.cropName,
              color: "rose",
              icon: "AlertTriangle"
            });
          }
        }

        // Expense Risk Rule
        if (crop.estimatedRevenue > 0 && crop.totalExpenses >= crop.estimatedRevenue * 0.9) {
          smartAlerts.push({
            id: `exp-${crop._id}`,
            type: "error",
            title: "expenseAlertTitle",
            message: "expenseAlertMsg",
            cropName: crop.cropName,
            color: "rose",
            icon: "Banknote"
           });
        }
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
        estimatedRevenue: crop.estimatedRevenue || 0,
        netEstimate,
        activityCount: crop.activityCount,
        needsAttention: crop.status === "active" ? needsAttention : false,
        attentionReason: crop.status === "active" ? attentionReason : []
      };
    });

    // Simulated Weather Alerts
    if (activeCropsCount > 0) {
      const weatherRoll = Math.random();
      if (weatherRoll > 0.85) {
        smartAlerts.push({
          id: `wea-rain-${Date.now()}`,
          type: "warning",
          title: "weatherRainTitle",
          message: "weatherRainMsg",
          cropName: null,
          color: "blue",
          icon: "CloudRain"
        });
      } else if (weatherRoll < 0.15) {
        smartAlerts.push({
          id: `wea-heat-${Date.now()}`,
          type: "warning",
          title: "weatherHeatTitle",
          message: "weatherHeatMsg",
          cropName: null,
          color: "orange",
          icon: "ThermometerSun"
        });
      }
    }

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
      smartAlerts,
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