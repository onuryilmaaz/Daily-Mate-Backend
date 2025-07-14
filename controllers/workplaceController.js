const Workplace = require("../models/workplaceModel");

// Create a new workplace
const createWorkplace = async (req, res) => {
  try {
    const { name, dailyWage, color } = req.body;

    if (!name || !dailyWage) {
      return res
        .status(400)
        .json({ error: "Name and daily wage are required" });
    }
    if (dailyWage < 0) {
      return res.status(400).json({ error: "Wage cannot be less than 0" });
    }

    const newWorkplace = new Workplace({
      userId: req.user._id,
      name: name.trim(),
      dailyWage: Number(dailyWage),
      color: color || "#3B82F6",
      isActive: true,
    });

    await newWorkplace.save();
    res.status(201).json({
      message: "Workplace created successfully",
      workplace: newWorkplace,
    });
  } catch (error) {
    console.error("Error creating workplace:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get only active workplaces for a user
const getActiveWorkplaces = async (req, res) => {
  try {
    const workplaces = await Workplace.find({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });
    res.status(200).json(workplaces);
  } catch (error) {
    console.error("Error getting active workplaces:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all workplaces for a user (active and inactive)
const getAllWorkplaces = async (req, res) => {
  try {
    const workplaces = await Workplace.find({ userId: req.user._id }).sort({
      isActive: -1,
      createdAt: -1,
    });
    res.status(200).json(workplaces);
  } catch (error) {
    console.error("Error getting all workplaces:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a workplace
const updateWorkplace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dailyWage, color, isActive } = req.body;

    const workplace = await Workplace.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!workplace) {
      return res.status(404).json({ error: "Workplace not found" });
    }

    if (name) workplace.name = name.trim();
    if (dailyWage) workplace.dailyWage = Number(dailyWage);
    if (color) workplace.color = color;
    if (isActive !== undefined) workplace.isActive = isActive;

    const updatedWorkplace = await workplace.save();

    res.status(200).json({
      message: "Workplace updated successfully",
      workplace: updatedWorkplace,
    });
  } catch (error) {
    console.error("Error updating workplace:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a workplace
const deleteWorkplace = async (req, res) => {
  try {
    const { id } = req.params;
    // Note: Add logic here to handle associated workdays if necessary
    const workplace = await Workplace.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!workplace) {
      return res.status(404).json({ error: "Workplace not found" });
    }

    res.status(200).json({ message: "Workplace deleted successfully" });
  } catch (error) {
    console.error("Error deleting workplace:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Toggle workplace active status
const toggleWorkplace = async (req, res) => {
  try {
    const { id } = req.params;

    const workplace = await Workplace.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!workplace) {
      return res.status(404).json({ error: "Workplace not found" });
    }

    // Toggle the isActive status
    workplace.isActive = !workplace.isActive;
    const updatedWorkplace = await workplace.save();

    const statusText = updatedWorkplace.isActive ? "Aktif" : "Pasif";

    res.status(200).json({
      message: `İş yeri durumu başarıyla güncellendi. Yeni durum: ${statusText}`,
      workplace: updatedWorkplace,
    });
  } catch (error) {
    console.error("Error toggling workplace:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createWorkplace,
  getActiveWorkplaces,
  getAllWorkplaces,
  updateWorkplace,
  deleteWorkplace,
  toggleWorkplace,
};
