const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    themePreference: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    languagePreference: {
      type: String,
      enum: ["en", "tl"],
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);