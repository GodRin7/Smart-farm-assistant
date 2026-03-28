const Activity = require("../models/Activity");
const Crop = require("../models/Crop");

// @desc    Get all activities of logged-in user
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const { crop, activityType } = req.query;

    const filter = { user: req.user._id };

    if (crop) filter.crop = crop;
    if (activityType) filter.activityType = activityType;

    const activities = await Activity.find(filter)
      .populate("crop", "cropName plotName")
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching activities" });
  }
};

// @desc    Create activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
  try {
    const { crop, activityType, date, notes } = req.body;

    if (!crop || !date) {
      return res.status(400).json({
        message: "Crop and date are required",
      });
    }

    const cropExists = await Crop.findOne({
      _id: crop,
      user: req.user._id,
    });

    if (!cropExists) {
      return res.status(404).json({ message: "Selected crop not found" });
    }

    const activity = await Activity.create({
      user: req.user._id,
      crop,
      activityType,
      date,
      notes,
    });

    const populatedActivity = await Activity.findById(activity._id).populate(
      "crop",
      "cropName plotName"
    );

    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating activity" });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    await activity.deleteOne();

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting activity" });
  }
};

module.exports = {
  getActivities,
  createActivity,
  deleteActivity,
};