import JSZip from "jszip";
import { saveAs } from "file-saver";
import { yjsStore } from "../features/collaboration/yjsStore";

/**
 * 🌳 Recursively builds the ZIP structure from the Yjs file tree node.
 */
function buildZipFromYTree(node, zipFolder) {
  if (!node) return;

  const type = node.get("type");
  const name = node.get("name");

  if (type === "folder") {
    // 📁 Create a folder in the zip
    const currentFolder = zipFolder.folder(name);
    
    const children = node.get("children");
    if (children) {
      children.toArray().forEach((child) => {
        buildZipFromYTree(child, currentFolder);
      });
    }
  } else if (type === "file") {
    // 📄 Fetch content from Y.Text and add to current folder
    const fileId = node.get("id");
    const text = yjsStore.getOrCreateText(fileId);
    
    if (text) {
      zipFolder.file(name, text.toString());
    }
  }
}

/**
 * ⚡ Main function to start the download process.
 */
export async function downloadProject(doc) {
  if (!doc) {
    console.error("Y.Doc not initialized.");
    return;
  }

  const zip = new JSZip();
  const yMap = doc.getMap("fileTree");
  const root = yMap.get("root");

  if (!root) {
    console.warn("File tree root not found.");
    return;
  }

  // 🧪 The root itself is a folder mapping to "root", 
  // but we want the files INSIDE the root to be at the zip top-level 
  // unless we want a wrapping "project" folder.
  // We'll skip the "root" folder itself and add its children.
  
  const children = root.get("children");
  if (children) {
    children.toArray().forEach((child) => {
      buildZipFromYTree(child, zip);
    });
  }

  // 🔧 Generate blob and trigger download
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "project.zip");
}
