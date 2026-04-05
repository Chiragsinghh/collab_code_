import { useMemo, useRef, useCallback, useEffect } from "react";
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

// ✅ CHAT SYSTEM
import ChatPanel from "../features/chat/ChatPanel";
import { useChatStore } from "../features/chat/useChatStore";

// ✅ LAYOUT STORE
import { useLayoutStore } from "../store/layoutStore";

// ✅ EDITOR STORE (for Empty State)
import { useEditorStore } from "../store/useEditorStore";

export default function EditorPage() {
  useFileCollaboration();
  const { id: projectId } = useParams();

  const doc = yjsStore.doc;
  const { runCode } = useExecutionStore();
  const { activeFileId } = useEditorStore();

  const {
    sidebarOpen,
    previewOpen,
    sidebarWidth,
    previewWidth,
    setSidebarWidth,
    setPreviewWidth,
    chatOpen
  } = useLayoutStore();

  const sidebarRef = useRef(null);
  const previewRef = useRef(null);
  const iframeBlockerRef = useRef(null);

  const saveStatus = useAutoSave(doc, projectId);

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

  // ✅ GLOBAL KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, runCode]);

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
    <div className="h-screen flex flex-col bg-[#0e0e12] relative overflow-hidden">
      
      {/* Iframe Blocker for dragging */}
      <div 
        ref={iframeBlockerRef} 
        className="absolute inset-0 z-[10000] hidden cursor-col-resize"
      />

      <Navbar onSave={handleSave} saveStatus={saveStatus} onRun={runCode} />

      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR (File Explorer) */}
        <div 
          ref={sidebarRef}
          className={`flex-shrink-0 overflow-hidden bg-[#131317] transition-[width] duration-75 ${sidebarOpen ? '' : 'w-0'}`}
          style={{ width: sidebarOpen ? `${sidebarWidth}px` : "0px" }}
        >
          <div className="h-full flex flex-col">
            <FileExplorer />
          </div>
        </div>

        {/* SIDEBAR RESIZER */}
        {sidebarOpen && (
          <div
            onMouseDown={handleSidebarDrag}
            className="w-1 cursor-col-resize bg-transparent hover:bg-[#ff9249] transition-colors z-10"
          />
        )}

        {/* MAIN EDITOR AREA */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-[300px] bg-[#0e0e12]">
          {activeFileId ? (
            <>
              <Tabs />
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 min-w-0 h-full">
                  <EditorView />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-[#ff924911] rounded-2xl flex items-center justify-center mb-6 border border-[#ff924922]">
                <span className="text-4xl">🚀</span>
              </div>
              <h2 className="text-2xl font-bold font-[Space_Grotesk] text-[#fcf8fe] mb-2 uppercase tracking-tighter">Ready for Ignition</h2>
              <p className="text-[#acaab0] text-sm max-w-xs leading-relaxed">Select a file from the explorer or create a new one to start your session.</p>
            </div>
          )}
        </div>

        {/* PREVIEW RESIZER */}
        {previewOpen && (
          <div
            onMouseDown={handlePreviewDrag}
            className="w-1 cursor-col-resize bg-transparent hover:bg-[#ff9249] transition-colors z-10"
          />
        )}

        {/* PREVIEW PANEL */}
        <div 
          ref={previewRef}
          className={`flex-shrink-0 flex flex-col bg-[#131317] border-l border-[#ffffff08] transition-[width] duration-75 ${previewOpen ? '' : 'w-0'}`}
          style={{ width: previewOpen ? `${previewWidth}px` : "0px" }}
        >
          <PreviewPanel iframeBlockerRef={iframeBlockerRef} />
        </div>

        {/* CHAT PANEL */}
        <div 
          className={`flex-shrink-0 overflow-hidden bg-[#131317] border-l border-[#ffffff08] transition-[width] duration-75 ${chatOpen ? 'w-[320px]' : 'w-0'}`}
        >
          <div className="h-full w-[320px]">
            <ChatPanel />
          </div>
        </div>

      </div>
    </div>
  );
}