const Project = require("../models/Project");
const Y = require("yjs");

exports.saveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { ydocArray } = req.body;

    if (!ydocArray || !Array.isArray(ydocArray)) {
      return res.status(400).json({ error: "Missing or invalid ydocArray parameter" });
    }

    // Safely interpret generic array into Buffer natively
    const incomingUpdate = Buffer.from(ydocArray);

    let project = await Project.findById(id);

    if (!project) {
      project = new Project({ _id: id, ydoc: incomingUpdate });
      await project.save();
      return res.json({ success: true });
    }

    // Yjs merge strategy: NEVER replace blindly. CRDT enforces sequential logical merges.
    const doc = new Y.Doc();
    if (project.ydoc && project.ydoc.length > 0) {
      Y.applyUpdate(doc, project.ydoc);
    }
    
    Y.applyUpdate(doc, incomingUpdate);

    // Save strictly as binary payload representing complete synchronous CRDT state
    project.ydoc = Buffer.from(Y.encodeStateAsUpdate(doc));
    await project.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ error: "Failed to save project" });
  }
};

exports.loadProject = async (req, res) => {
  try {
    const { id } = req.params;
    let project = await Project.findById(id);

    if (!project) {
      return res.status(200).json({ success: true, ydoc: null });
    }

    res.status(200).json({
      success: true,
      ydoc: project.ydoc ? project.ydoc.toString("base64") : null
    });
  } catch (error) {
    console.error("❌ Error loading project:", error);
    res.status(500).json({ success: false, error: "Failed to load project snapshot" });
  }
};
