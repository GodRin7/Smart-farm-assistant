const Harvest = require("../models/Harvest");
const Crop = require("../models/Crop");

// @desc    Get all harvests of logged-in user
// @route   GET /api/harvests
// @access  Private
const getHarvests = async (req, res) => {
  try {
    const { crop } = req.query;

    const filter = { user: req.user._id };
    if (crop) filter.crop = crop;

    const harvests = await Harvest.find(filter)
      .populate("crop", "cropName plotName")
      .sort({ harvestDate: -1, createdAt: -1 });

    res.status(200).json(harvests);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching harvests" });
  }
};

// @desc    Create harvest
// @route   POST /api/harvests
// @access  Private
const createHarvest = async (req, res) => {
  try {
    const { crop, harvestDate, quantity, unit, pricePerUnit, notes } = req.body;

    if (!crop || !harvestDate || quantity === undefined || pricePerUnit === undefined) {
      return res.status(400).json({
        message: "Crop, harvest date, quantity, and price per unit are required",
      });
    }

    const cropExists = await Crop.findOne({
      _id: crop,
      user: req.user._id,
    });

    if (!cropExists) {
      return res.status(404).json({ message: "Selected crop not found" });
    }

    const totalValue = Number(quantity) * Number(pricePerUnit);

    const harvest = await Harvest.create({
      user: req.user._id,
      crop,
      harvestDate,
      quantity,
      unit,
      pricePerUnit,
      totalValue,
      notes,
    });

    const populatedHarvest = await Harvest.findById(harvest._id).populate(
      "crop",
      "cropName plotName"
    );

    res.status(201).json(populatedHarvest);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating harvest" });
  }
};

// @desc    Delete harvest
// @route   DELETE /api/harvests/:id
// @access  Private
const deleteHarvest = async (req, res) => {
  try {
    const harvest = await Harvest.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!harvest) {
      return res.status(404).json({ message: "Harvest not found" });
    }

    await harvest.deleteOne();

    res.status(200).json({ message: "Harvest deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting harvest" });
  }
};

module.exports = {
  getHarvests,
  createHarvest,
  deleteHarvest,
};