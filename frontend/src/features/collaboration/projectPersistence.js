import * as Y from "yjs";

export function exportProject(doc) {
  if (!doc) return null;

  try {
    const fileTreeYMap = doc.getMap("fileTree");
    const rootNode = fileTreeYMap.get("root");

    if (!rootNode) return null;

    // Securely recursive walk extracting JSON nodes out of internal Y.Types
    const extractNode = (yNode) => {
      if (!yNode) return null;
      const childrenArray = yNode.get("children");
      
      const node = {
        id: yNode.get("id"),
        name: yNode.get("name"),
        type: yNode.get("type"),
        isExpanded: yNode.get("isExpanded") || false
      };

      if (childrenArray) {
        node.children = childrenArray.toArray().map(extractNode).filter(Boolean);
      } else {
        node.children = [];
      }
      return node;
    };

    const treeData = extractNode(rootNode);

    // Recursively collect all unique fileIds to serialize Text dependencies efficiently
    const files = {};
    const collectFiles = (node) => {
      if (node.type === "file" && node.id) {
        const text = doc.getText(node.id);
        files[node.id] = text.toString();
      }
      (node.children || []).forEach(collectFiles);
    };

    collectFiles(treeData);

    return {
      fileTree: treeData,
      files
    };
  } catch (error) {
    console.error("Failed to export project snapshot:", error);
    return null;
  }
}

export function importProject(doc, data) {
  if (!doc || !data || !data.fileTree) return false;

  const fileTreeYMap = doc.getMap("fileTree");

  // SAFETY REQUIREMENT: Must NOT overwrite if document already received sync!
  // If `root` exists locally, it means IndexedDB or WebSocket restored real-time data successfully.
  if (fileTreeYMap.get("root")) {
    console.log("⚠️ Backend load aborted: Yjs document locally populated via IndexedDB or WebSockets.");
    return false;
  }

  try {
    const buildNode = (nodeData) => {
      const yNode = new Y.Map();
      yNode.set("id", nodeData.id);
      yNode.set("name", nodeData.name);
      yNode.set("type", nodeData.type);
      yNode.set("isExpanded", nodeData.isExpanded || false);

      const yChildren = new Y.Array();
      if (nodeData.children && nodeData.children.length > 0) {
        // Correct recursive parsing into newly defined nested arrays safely mapped via CRDT structures
        const childNodes = nodeData.children.map(buildNode);
        yChildren.insert(0, childNodes);
      }
      yNode.set("children", yChildren);

      return yNode;
    };

    const rootYNode = buildNode(data.fileTree);
    fileTreeYMap.set("root", rootYNode);

    Object.entries(data.files || {}).forEach(([fileId, codeString]) => {
      if (typeof codeString === 'string' && codeString.length > 0) {
        const yText = doc.getText(fileId);
        yText.insert(0, codeString);
      }
    });

    console.log("📥 Project snapshot imported securely directly from Backend DB.");
    return true;
  } catch (error) {
    console.error("Error importing project snapshot:", error);
    return false;
  }
}
