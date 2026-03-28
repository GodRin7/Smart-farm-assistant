const Expense = require("../models/Expense");
const Crop = require("../models/Crop");

// @desc    Get all expenses of logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { crop, category } = req.query;

    const filter = { user: req.user._id };

    if (crop) filter.crop = crop;
    if (category) filter.category = category;

    const expenses = await Expense.find(filter)
      .populate("crop", "cropName plotName")
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching expenses" });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { crop, category, amount, date, notes } = req.body;

    if (!crop || !amount || !date) {
      return res.status(400).json({
        message: "Crop, amount, and date are required",
      });
    }

    const cropExists = await Crop.findOne({
      _id: crop,
      user: req.user._id,
    });

    if (!cropExists) {
      return res.status(404).json({ message: "Selected crop not found" });
    }

    const expense = await Expense.create({
      user: req.user._id,
      crop,
      category,
      amount,
      date,
      notes,
    });

    const populatedExpense = await Expense.findById(expense._id).populate(
      "crop",
      "cropName plotName"
    );

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating expense" });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting expense" });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
};