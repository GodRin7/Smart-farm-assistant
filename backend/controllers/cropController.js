const Crop = require("../models/Crop");

// @desc    Get all crops of logged-in user
// @route   GET /api/crops
// @access  Private
const getCrops = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    const crops = await Crop.find(filter).sort({ createdAt: -1 });

    res.status(200).json(crops);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching crops" });
  }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Private
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json(crop);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching crop" });
  }
};

// @desc    Create crop
// @route   POST /api/crops
// @access  Private
const createCrop = async (req, res) => {
  try {
    const {
      cropName,
      variety,
      plotName,
      area,
      areaUnit,
      plantedDate,
      expectedHarvestDate,
      estimatedRevenue,
      notes,
    } = req.body;

    if (!cropName || !plantedDate || !expectedHarvestDate) {
      return res.status(400).json({
        message: "Crop name, planted date, and expected harvest date are required",
      });
    }

    const crop = await Crop.create({
      user: req.user._id,
      cropName,
      variety,
      plotName,
      area,
      areaUnit,
      plantedDate,
      expectedHarvestDate,
      estimatedRevenue,
      notes,
    });

    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating crop" });
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    const updatedCrop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedCrop);
  } catch (error) {
    res.status(500).json({ message: "Server error while updating crop" });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    await crop.deleteOne();

    res.status(200).json({ message: "Crop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting crop" });
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
};