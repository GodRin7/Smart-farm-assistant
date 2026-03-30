const Schedule = require("../models/Schedule");
const Crop = require("../models/Crop");

// @desc    Get all schedules for logged-in user
// @route   GET /api/schedules
// @access  Private
const getSchedules = async (req, res) => {
  try {
    const { from, to, taskType, done } = req.query;
    const filter = { user: req.user._id };

    if (taskType) filter.taskType = taskType;
    if (done !== undefined) filter.isDone = done === "true";
    if (from || to) {
      filter.scheduledDate = {};
      if (from) filter.scheduledDate.$gte = new Date(from);
      if (to) filter.scheduledDate.$lte = new Date(to);
    }

    const schedules = await Schedule.find(filter)
      .populate("crop", "cropName plotName")
      .sort({ scheduledDate: 1, createdAt: 1 });

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching schedules" });
  }
};

// @desc    Create a schedule task
// @route   POST /api/schedules
// @access  Private
const createSchedule = async (req, res) => {
  try {
    const { crop, taskType, title, scheduledDate, repeatType, notes } = req.body;

    if (!taskType || !scheduledDate) {
      return res.status(400).json({ message: "Task type and scheduled date are required" });
    }

    const schedule = await Schedule.create({
      user: req.user._id,
      crop: crop || null,
      taskType,
      title,
      scheduledDate,
      repeatType: repeatType || "none",
      notes,
    });

    const populated = await schedule.populate("crop", "cropName plotName");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating schedule" });
  }
};

// @desc    Toggle task done/undone
// @route   PATCH /api/schedules/:id/toggle
// @access  Private
const toggleSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    schedule.isDone = !schedule.isDone;
    await schedule.save();

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Server error while toggling schedule" });
  }
};

// @desc    Delete a schedule task
// @route   DELETE /api/schedules/:id
// @access  Private
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    await schedule.deleteOne();
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting schedule" });
  }
};

module.exports = { getSchedules, createSchedule, toggleSchedule, deleteSchedule };
