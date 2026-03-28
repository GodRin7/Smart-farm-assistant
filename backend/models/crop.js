const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
      default: "",
    },
    plotName: {
      type: String,
      trim: true,
      default: "",
    },
    area: {
      type: Number,
      default: 0,
    },
    areaUnit: {
      type: String,
      enum: ["sqm", "hectare"],
      default: "sqm",
    },
    plantedDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: true,
    },
    actualHarvestDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "harvested", "failed"],
      default: "active",
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

module.exports = mongoose.model("Crop", cropSchema);