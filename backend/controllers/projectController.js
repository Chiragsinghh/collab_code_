const Project = require("../models/Project");
const Y = require("yjs");

// ✅ Helper to check access
const hasAccess = (project, userId) => {
  if (project.isPublic) return true;
  if (project.owner?.toString() === userId.toString()) return true;
  return project.collaborators.some(c => c.user.toString() === userId.toString());
};

const canEdit = (project, userId) => {
  if (project.owner?.toString() === userId.toString()) return true;
  return project.collaborators.some(c => c.user.toString() === userId.toString() && c.role === "editor");
};

exports.saveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const ydocArray = req.body.ydocArray || req.body.ydoc;
    if (!ydocArray || !Array.isArray(ydocArray)) {
      return res.status(400).json({ error: "Missing or invalid ydoc parameter" });
    }

    const incomingUpdate = Buffer.from(ydocArray);
    let project = await Project.findById(id);

    if (!project) {
      // Create new project with current user as owner
      project = new Project({ 
        _id: id, 
        ydoc: incomingUpdate,
        owner: userId,
        name: req.body.name || "Untitled Project"
      });
      await project.save();
      return res.json({ success: true, message: "Project created and saved" });
    }

    // Check edit permission
    if (!canEdit(project, userId)) {
      return res.status(403).json({ error: "No edit permission for this project" });
    }

    // CRDT MERGE
    const doc = new Y.Doc();
    if (project.ydoc && project.ydoc.length > 0) {
      Y.applyUpdate(doc, project.ydoc);
    }
    Y.applyUpdate(doc, incomingUpdate);

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
    const userId = req.user._id;

    let project = await Project.findById(id);

    if (!project) {
      return res.status(200).json({ success: true, ydoc: null });
    }

    // Check access permission
    if (!hasAccess(project, userId)) {
      return res.status(403).json({ error: "Access denied. You are not a collaborator." });
    }

    res.status(200).json({
      success: true,
      name: project.name,
      ydoc: project.ydoc ? project.ydoc.toString("base64") : null
    });
  } catch (error) {
    console.error("❌ Error loading project:", error);
    res.status(500).json({ success: false, error: "Failed to load project snapshot" });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { "collaborators.user": userId }
      ]
    }).select("name updatedAt isPublic").sort("-updatedAt");

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { id, name } = req.body;
    const userId = req.user._id;

    const project = new Project({
      _id: id,
      name: name || "Untitled Project",
      owner: userId
    });

    await project.save();
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
};
