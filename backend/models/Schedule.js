const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      default: null,
    },
    taskType: {
      type: String,
      enum: ["watering", "fertilizing", "spraying", "weeding", "harvesting", "other"],
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    repeatType: {
      type: String,
      enum: ["none", "daily", "weekly", "biweekly"],
      default: "none",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
