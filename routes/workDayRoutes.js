const express = require("express");
const router = express.Router();
const {
  getAllWorkDays,
  createWorkDay,
  updateWorkDay,
  deleteWorkDay,
  getThisMonthStats,
} = require("../controllers/workDayController");
const authMiddleware = require("../middleware/authMiddleware");

// Tüm yolları middleware ile koru
router.use(authMiddleware);

// Route'ları tanımla
router.route("/").get(getAllWorkDays).post(createWorkDay);
router.get("/stats/this-month", getThisMonthStats);
router.route("/:id").put(updateWorkDay).delete(deleteWorkDay);

module.exports = router;
