const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ["seeds", "fertilizer", "pesticide", "labor", "transportation", "irrigation", "others"],
      default: "others",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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

module.exports = mongoose.model("Expense", expenseSchema);