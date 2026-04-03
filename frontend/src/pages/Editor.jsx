import { useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";

import FileExplorer from "../features/filesystem/FileExplorer";
import Tabs from "../features/editor/Tabs";
import EditorView from "../features/editor/EditorView";
import useFileCollaboration from "../features/collaboration/useFileCollaboration";

import Navbar from "../components/Navbar";
import { yjsStore } from "../features/collaboration/yjsStore";

// ✅ AUTO-SAVE
import { useAutoSave } from "../features/autosave/useAutoSave";

// ✅ EXECUTION ENGINE
import PreviewPanel from "../features/execution/PreviewPanel";
import { useExecutionStore } from "../features/execution/executionStore";

// ✅ LAYOUT STORE
import { useLayoutStore } from "../store/layoutStore";

export default function EditorPage() {
  useFileCollaboration();
  const { id: projectId } = useParams(); // 🔥 Use strictly raw ID to prevent prefix collisions

  const doc = yjsStore.doc;
  const { runCode } = useExecutionStore();

  const {
    sidebarOpen,
    previewOpen,
    sidebarWidth,
    previewWidth,
    setSidebarWidth,
    setPreviewWidth
  } = useLayoutStore();

  const sidebarRef = useRef(null);
  const previewRef = useRef(null);
  const iframeBlockerRef = useRef(null); // Used to block iframe pointer events during drag

  // ✅ AUTO SAVE HOOK - Uses precise raw ID mappings
  const saveStatus = useAutoSave(doc, projectId);

  // ✅ MANUAL SAVE (STABLE) - Directly invokes global integrated store system
  const handleSave = useMemo(() => {
    return async () => {
      try {
        await yjsStore.saveProjectToDB(projectId);
        console.log("✅ Project saved manually bypassing HTTP overhead.");
      } catch (err) {
        console.error("❌ Save failed:", err);
      }
    };
  }, [projectId]);

  // --- RESIZE LOGIC ---
  const handleSidebarDrag = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarRef.current ? sidebarRef.current.offsetWidth : sidebarWidth;

    if (iframeBlockerRef.current) iframeBlockerRef.current.style.display = "block";

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(150, startWidth + (moveEvent.clientX - startX));
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    };

    const onMouseUp = (upEvent) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
      if (iframeBlockerRef.current) iframeBlockerRef.current.style.display = "none";
      
      const finalWidth = Math.max(150, startWidth + (upEvent.clientX - startX));
      setSidebarWidth(finalWidth);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
  }, [sidebarWidth, setSidebarWidth]);

  const handlePreviewDrag = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = previewRef.current ? previewRef.current.offsetWidth : previewWidth;

    if (iframeBlockerRef.current) iframeBlockerRef.current.style.display = "block";

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(300, startWidth - (moveEvent.clientX - startX));
      if (previewRef.current) {
        previewRef.current.style.width = `${newWidth}px`;
      }
    };

    const onMouseUp = (upEvent) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
      if (iframeBlockerRef.current) iframeBlockerRef.current.style.display = "none";

      const finalWidth = Math.max(300, startWidth - (upEvent.clientX - startX));
      setPreviewWidth(finalWidth);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
  }, [previewWidth, setPreviewWidth]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      
      {/* Invisible overlay for iframe protection during drag */}
      <div 
        ref={iframeBlockerRef} 
        style={{ position: "absolute", inset: 0, zIndex: 9999, display: "none", cursor: "col-resize" }}
      />

      {/* 🔥 NAVBAR */}
      <Navbar onSave={handleSave} saveStatus={saveStatus} onRun={runCode} />

      {/* 🔥 MAIN LAYOUT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* SIDEBAR */}
        <div 
          ref={sidebarRef}
          style={{ 
            width: sidebarOpen ? `${sidebarWidth}px` : "0px", 
            display: sidebarOpen ? "block" : "none",
            flexShrink: 0, overflow: "hidden",
            borderRight: "1px solid #333", backgroundColor: "#1e1e1e"
          }}
        >
          <FileExplorer />
        </div>

        {/* SIDEBAR RESIZER */}
        {sidebarOpen && (
          <div
            onMouseDown={handleSidebarDrag}
            style={{
              width: "4px",
              cursor: "col-resize",
              backgroundColor: "transparent",
              transition: "background-color 0.2s",
              zIndex: 10
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#007acc")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          />
        )}

        {/* EDITOR */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 300 }}>
          <Tabs />
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
              <EditorView />
            </div>
          </div>
        </div>

        {/* PREVIEW RESIZER */}
        {previewOpen && (
          <div
            onMouseDown={handlePreviewDrag}
            style={{
              width: "4px",
              cursor: "col-resize",
              backgroundColor: "transparent",
              transition: "background-color 0.2s",
              zIndex: 10
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#007acc")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          />
        )}

        {/* PREVIEW */}
        <div 
          ref={previewRef}
          style={{ 
            width: previewOpen ? `${previewWidth}px` : "0px", 
            display: previewOpen ? "flex" : "none",
            flexDirection: "column",
            flexShrink: 0,
            borderLeft: "1px solid #333", backgroundColor: "#fff" 
          }}
        >
          <PreviewPanel iframeBlockerRef={iframeBlockerRef} />
        </div>

      </div>
    </div>
  );
}