export function exportProject(doc) {
    if (!doc) return null;
  
    const fileTree = doc.getMap("fileTree");
    const filesMap = doc.getMap("files");
  
    const files = {};
  
    // Extract all Y.Text content
    filesMap.forEach((yText, fileId) => {
      files[fileId] = yText.toString();
    });
  
    return {
      fileTree: fileTree.toJSON(),
      files,
    };
  }