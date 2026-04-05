import { useState } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { yjsStore } from "../collaboration/yjsStore";
import * as Y from "yjs";

export default function FileNode({ node, level = 0 }) {
  if (!node) return null;

  const { openFile, activeFileId } = useEditorStore();
  const isActive = activeFileId === node.id;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(node.name || "");

  // 🔍 Find Yjs node
  const findYNode = (yNode, id) => {
    if (yNode.get("id") === id) return yNode;

    const children = yNode.get("children");
    if (!children) return null;

    for (let child of children.toArray()) {
      const found = findYNode(child, id);
      if (found) return found;
    }

    return null;
  };

  // 📁 Get root Yjs tree
  const ydoc = yjsStore.doc;
  const yMap = ydoc.getMap("fileTree");
  const root = yMap.get("root");

  // ➕ Add file/folder
  const addNode = (parentId, type) => {
    const parent = findYNode(root, parentId);
    if (!parent) return;

    const newNode = new Y.Map();
    const id = crypto.randomUUID();

    newNode.set("id", id);
    newNode.set("name", type === "file" ? "untitled.js" : "new_folder");
    newNode.set("type", type);
    newNode.set("isExpanded", false);

    if (type === "folder") {
      newNode.set("children", new Y.Array());
    }

    const children = parent.get("children");
    children.push([newNode]);

    if (type === "file") {
      yjsStore.getOrCreateText(id);
    }
  };

  // ❌ Delete node
  const deleteNode = (id) => {
    const removeNodeFromTree = (yNode, id) => {
      const children = yNode.get("children");
      if (!children) return false;

      const arr = children.toArray();
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].get("id") === id) {
          children.delete(i, 1);
          return true;
        }
        if (removeNodeFromTree(arr[i], id)) return true;
      }
      return false;
    };
    removeNodeFromTree(root, id);
  };

  // ✏️ Rename
  const renameNode = (id, newName) => {
    const target = findYNode(root, id);
    if (!target) return;
    target.set("name", newName);
  };

  // 📂 Toggle folder
  const toggleFolder = (id) => {
    const target = findYNode(root, id);
    if (!target) return;
    const current = target.get("isExpanded");
    target.set("isExpanded", !current);
  };

  const handleRename = () => {
    if (name.trim() === "") return;
    renameNode(node.id, name);
    setIsEditing(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (node.type === "folder") {
      toggleFolder(node.id);
    } else {
      openFile(node.id);
    }
  };

  const getIndent = () => level * 12 + 12;

  return (
    <div className="flex flex-col">
      {/* Node Row */}
      <div
        className={`group flex items-center gap-2 cursor-pointer py-1 relative pr-4 transition-colors duration-150 ${isActive ? 'bg-[#ff924915] text-[#ff9249]' : 'text-[#acaab0] hover:bg-[#ffffff04] hover:text-[#fcf8fe]'}`}
        style={{ paddingLeft: `${getIndent()}px` }}
        onClick={handleClick}
      >
        {/* Active Indicator Line */}
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#ff9249] shadow-[0_0_8px_#ff9249]"></div>}

        {/* Icon */}
        <span className="flex-shrink-0">
          {node.type === "folder" ? (
             <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${node.isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
             </svg>
          ) : (
             <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
          )}
        </span>

        {/* Rename Input or Name */}
        {isEditing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsEditing(false);
            }}
            autoFocus
            className="text-[12px] bg-[#19191e] border border-[#ff924944] text-[#fcf8fe] outline-none px-1 py-0 rounded focus:ring-1 focus:ring-[#ff9249aa] w-full max-w-[140px]"
          />
        ) : (
          <span className={`text-[12px] font-medium truncate ${isActive ? 'font-bold' : ''}`}>
            {node.name || "untitled"}
          </span>
        )}

        {/* Action Buttons (Visible on Hover) */}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.type === "folder" && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); addNode(node.id, "file"); }}
                className="p-1 hover:bg-[#ffffff11] rounded text-[#acaab0] hover:text-[#ff9249] transition-colors"
                title="Add File"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </>
          )}
          {node.id !== "root" && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="p-1 hover:bg-[#ffffff11] rounded text-[#acaab0] hover:text-[#ff9249] transition-colors"
                title="Rename"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                className="p-1 hover:bg-red-500/20 rounded text-[#acaab0] hover:text-red-400 transition-colors"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Children Container */}
      {node.type === "folder" && node.isExpanded && (
        <div className="flex flex-col">
          {node.children?.map((child) => (
            <FileNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}