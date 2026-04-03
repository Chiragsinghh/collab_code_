const express = require("express");
const { saveProject, loadProject, getUserProjects, createProject } = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All project routes are now protected
router.use(protect);

router.get("/my", getUserProjects);
router.post("/create", createProject);
router.post("/:id/save", saveProject);
router.get("/:id/load", loadProject);

module.exports = router;
