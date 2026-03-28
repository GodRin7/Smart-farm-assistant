const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Crop",
    },
    activityType: {
      type: String,
      enum: [
        "land_preparation",
        "planting",
        "watering",
        "fertilizing",
        "spraying",
        "weeding",
        "harvesting",
        "others",
      ],
      default: "others",
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);