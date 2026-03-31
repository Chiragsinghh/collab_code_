const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    fileTree: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // We utilize a native Mongoose Map dictating key (fileId) to value (String code)
    files: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);