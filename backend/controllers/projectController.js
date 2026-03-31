const Project = require("../models/Project");

exports.saveProject = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📥 Incoming data:", req.body);

    const updatedProject = await Project.findOneAndUpdate(
      { projectId: id },
      { data: req.body },
      { upsert: true, returnDocument: "after" }
    );

    res.json({
      success: true,
      project: updatedProject,
    });
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ error: "Failed to save project" });
  }
};

exports.loadProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ projectId: id });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project snapshot doesn't exist yet." });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Error loading project:", error);
    res.status(500).json({ success: false, error: "Failed to load project snapshot" });
  }
};
