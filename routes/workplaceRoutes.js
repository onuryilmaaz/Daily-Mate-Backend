const express = require("express");
const router = express.Router();
const {
  createWorkplace,
  getActiveWorkplaces,
  getAllWorkplaces,
  updateWorkplace,
  deleteWorkplace,
  toggleWorkplace,
} = require("../controllers/workplaceController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all routes with middleware
router.use(authMiddleware);

// Define routes
router.route("/").get(getActiveWorkplaces).post(createWorkplace);
router.get("/all", getAllWorkplaces);
router.patch("/:id/toggle", toggleWorkplace);
router.route("/:id").put(updateWorkplace).delete(deleteWorkplace);

module.exports = router;
