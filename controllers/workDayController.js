const WorkDay = require("../models/workDayModel");
const Workplace = require("../models/workplaceModel");

const getAllWorkDays = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const workdays = await WorkDay.find({
      userId: req.user._id,
      ...dateFilter,
    })
      .populate("workplaceId", "name color dailyWage")
      .sort({ date: -1 });

    res.status(200).json(workdays);
  } catch (error) {
    console.error("Error getting workdays:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const createWorkDay = async (req, res) => {
  try {
    const { workplaceId, date, wageOnThatDay } = req.body;

    if (!workplaceId || !date) {
      return res.status(400).json({ error: "Workplace and date are required" });
    }

    const workplace = await Workplace.findOne({
      _id: workplaceId,
      userId: req.user._id,
    });

    if (!workplace) {
      return res.status(404).json({ error: "Workplace not found" });
    }

    const workDate = new Date(date);
    if (isNaN(workDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (workDate > today) {
      return res
        .status(400)
        .json({ error: "Cannot create entries for future dates" });
    }

    const finalWage =
      wageOnThatDay !== undefined ? Number(wageOnThatDay) : workplace.dailyWage;

    if (finalWage < 0) {
      return res.status(400).json({ error: "Wage cannot be less than 0" });
    }

    const newWorkDay = new WorkDay({
      userId: req.user._id,
      workplaceId,
      date: workDate,
      wageOnThatDay: finalWage,
    });

    await newWorkDay.save();

    const populatedWorkDay = await WorkDay.findById(newWorkDay._id).populate(
      "workplaceId",
      "name color dailyWage"
    );

    res.status(201).json({
      message: "Workday created successfully",
      workday: populatedWorkDay,
    });
  } catch (error) {
    console.error("Error creating workday:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "A record for this date already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

const updateWorkDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { workplaceId, wageOnThatDay } = req.body;

    if (!workplaceId) {
      return res.status(400).json({ error: "Workplace is required" });
    }

    const workday = await WorkDay.findOne({ _id: id, userId: req.user._id });
    if (!workday) {
      return res.status(404).json({ error: "Workday not found" });
    }

    const workplace = await Workplace.findOne({
      _id: workplaceId,
      userId: req.user._id,
    });
    if (!workplace) {
      return res.status(404).json({ error: "Workplace not found" });
    }

    const finalWage =
      wageOnThatDay !== undefined ? Number(wageOnThatDay) : workplace.dailyWage;

    if (finalWage < 0) {
      return res.status(400).json({ error: "Wage cannot be less than 0" });
    }

    const updatedWorkDay = await WorkDay.findByIdAndUpdate(
      id,
      { workplaceId, wageOnThatDay: finalWage },
      { new: true }
    ).populate("workplaceId", "name color dailyWage");

    res.status(200).json({
      message: "Workday updated successfully",
      workday: updatedWorkDay,
    });
  } catch (error) {
    console.error("Error updating workday:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteWorkDay = async (req, res) => {
  try {
    const { id } = req.params;
    const workday = await WorkDay.findOne({ _id: id, userId: req.user._id });

    if (!workday) {
      return res.status(404).json({ error: "Workday not found" });
    }

    await WorkDay.findByIdAndDelete(id);

    res.status(200).json({ message: "Workday deleted successfully" });
  } catch (error) {
    console.error("Error deleting workday:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getThisMonthStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const workdays = await WorkDay.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("workplaceId", "name color dailyWage")
      .sort({ date: -1 });

    res.status(200).json({
      workdays,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
  } catch (error) {
    console.error("Error getting this month stats:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAllWorkDays,
  createWorkDay,
  updateWorkDay,
  deleteWorkDay,
  getThisMonthStats,
};
