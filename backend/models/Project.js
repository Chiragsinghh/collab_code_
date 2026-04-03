const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Untitled Project"
    },
    ydoc: {
      type: Buffer, 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);