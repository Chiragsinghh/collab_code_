const express = require("express");
const { saveProject, loadProject } = require("../controllers/projectController");

const router = express.Router();

router.post("/:id/save", saveProject);
router.get("/:id/load", loadProject);

module.exports = router;
