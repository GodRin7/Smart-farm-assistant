const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Helper to shape the user response (always return language + theme prefs)
const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  themePreference: user.themePreference,
  languagePreference: user.languagePreference,
  ...(token && { token }),
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json(formatUser(user, generateToken(user._id)));
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json(formatUser(user, generateToken(user._id)));
    }

    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error during login" });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(formatUser(req.user));
};

// @desc    Update user preferences (theme, language)
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { themePreference, languagePreference } = req.body || {};

    const allowed = {};
    if (themePreference) allowed.themePreference = themePreference;
    if (languagePreference) allowed.languagePreference = languagePreference;

    if (Object.keys(allowed).length === 0) {
      return res.status(400).json({ message: "No valid preferences provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      allowed,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(formatUser(user));
  } catch (error) {
    console.error("Preferences update error:", error);
    res.status(500).json({ message: error.message || "Server error updating preferences" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updatePreferences,
};