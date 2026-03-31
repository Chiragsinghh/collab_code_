export function exportProject(doc) {
  if (!doc) return null;

  try {
    const fileTreeYMap = doc.getMap("fileTree");
    const rootNode = fileTreeYMap.get("root");

    if (!rootNode) return null;

    // Recursive walk extracting JSON nodes out of internal Y.Types
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

    // Recursively collect all unique fileIds to extract Text
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

export async function saveProject(doc, projectId) {
  const data = exportProject(doc);
  
  if (!data) {
    console.warn("Save aborted: No data extracted from document.");
    return false;
  }

  try {
    const response = await fetch(`http://localhost:5001/project/${projectId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log("✅ Project snapshot saved successfully to backend!");
      return true;
    } else {
      console.error("❌ Failed to save project:", result.error || "Unknown Error");
      return false;
    }
  } catch (err) {
    console.error("❌ API Request Error saving project:", err);
    return false;
  }
}
