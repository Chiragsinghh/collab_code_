import * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";

// Define allowed extensions based on task requirements
const ALLOWED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json"];

function getExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? "." + parts.pop().toLowerCase() : "";
}

export const handleFolderUpload = async (event, ydoc, openFileCallback) => {
  if (!ydoc) {
    console.error("No active Y.Doc to upload into.");
    return;
  }

  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  const yMap = ydoc.getMap("fileTree");
  const root = yMap.get("root");

  if (!root) {
    console.error("Root folder not initialized in Yjs.");
    return;
  }

  ydoc.transact(() => {
    let fileToOpen = null;

    files.forEach((file) => {
      const path = file.webkitRelativePath;
      if (!path) return;

      // Filter out unwanted files
      if (path.includes("node_modules/") || path.includes(".git/") || path.includes(".DS_Store")) {
        return;
      }

      const ext = getExtension(file.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return; // skip binaries and non-text files
      }

      // Read content asynchronously but transaction is sync?
      // Wait, we need to read all files first, then transact.
    });
  });
};

export const processFolderUpload = async (event, ydoc, yjsStore, openFile) => {
  if (!ydoc) return;
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  const yMap = ydoc.getMap("fileTree");
  const root = yMap.get("root");
  if (!root) return;

  // Filter and prepare text files
  const filesToProcess = [];
  for (const file of files) {
    const path = file.webkitRelativePath;
    if (!path || path.includes("node_modules/") || path.includes(".git/") || path.includes(".DS_Store")) {
      continue;
    }
    const ext = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) continue;

    try {
      const content = await file.text();
      filesToProcess.push({ path, content, name: file.name });
    } catch (e) {
      console.warn(`Failed to read file ${file.name}:`, e);
    }
  }

  // Once all files are read, we process them in a single Yjs transaction
  ydoc.transact(() => {
    let entryFileId = null;

    filesToProcess.forEach(({ path, content, name }) => {
      const parts = path.split("/"); // e.g. ["my-folder", "src", "App.js"]
      
      let currentFolder = root;

      // Traverse or create folders
      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        let children = currentFolder.get("children");
        if (!children) {
          children = new Y.Array();
          currentFolder.set("children", children);
        }

        let nextFolder = null;
        for (let j = 0; j < children.length; j++) {
          const child = children.get(j);
          if (child.get("type") === "folder" && child.get("name") === folderName) {
            nextFolder = child;
            break;
          }
        }

        if (!nextFolder) {
          nextFolder = new Y.Map();
          nextFolder.set("id", uuidv4());
          nextFolder.set("name", folderName);
          nextFolder.set("type", "folder");
          nextFolder.set("isExpanded", true);
          nextFolder.set("children", new Y.Array());
          children.push([nextFolder]);
        }

        currentFolder = nextFolder;
      }

      // Add the file
      let children = currentFolder.get("children");
      if (!children) {
        children = new Y.Array();
        currentFolder.set("children", children);
      }

      // Check if file already exists in this folder
      let existingFile = null;
      for (let j = 0; j < children.length; j++) {
        const child = children.get(j);
        if (child.get("type") === "file" && child.get("name") === name) {
          existingFile = child;
          break;
        }
      }

      const fileId = existingFile ? existingFile.get("id") : uuidv4();

      if (!existingFile) {
        const newFile = new Y.Map();
        newFile.set("id", fileId);
        newFile.set("name", name);
        newFile.set("type", "file");
        children.push([newFile]);
      }

      // Insert content
      const ytext = yjsStore.getOrCreateText(fileId);
      if (ytext) {
        ytext.delete(0, ytext.length);
        ytext.insert(0, content);
      }

      // Prioritize entry file to open
      if (["index.html", "main.js", "App.js", "App.jsx"].includes(name)) {
        if (!entryFileId || name === "index.html") {
            entryFileId = fileId;
        }
      } else if (!entryFileId) {
        entryFileId = fileId; // fallback to the first file processed
      }
    });

    if (entryFileId && openFile) {
      openFile(entryFileId);
    }
  });
};
