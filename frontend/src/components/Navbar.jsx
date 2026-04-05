import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { yjsStore } from '../features/collaboration/yjsStore';
import { useLayoutStore } from '../store/layoutStore';
import { useExecutionStore } from '../features/execution/executionStore';
import { processFolderUpload } from '../utils/folderUpload';
import { downloadProject } from '../utils/downloadProject';
import { useEditorStore } from '../store/useEditorStore';
import useAuthStore from '../store/useAuthStore';

function Navbar({ onSave, saveStatus, onRun }) {
    const { 
      sidebarOpen, toggleSidebar, 
      previewOpen, togglePreview, 
      consoleOpen, toggleConsole,
      chatOpen, toggleChat
    } = useLayoutStore();

    const { isRunning } = useExecutionStore();
    const { openFile } = useEditorStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
      const updateAwareness = () => {
        if (yjsStore.awareness) {
           const states = Array.from(yjsStore.awareness.getStates().values());
           setActiveUsers(states);
        } else {
           setActiveUsers([]);
        }
      };
      
      const interval = setInterval(updateAwareness, 2000);
      return () => clearInterval(interval);
    }, []);

    const handleUploadClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = async (e) => {
      await processFolderUpload(e, yjsStore.doc, yjsStore, openFile);
      e.target.value = null; 
    };

    const renderSaveStatus = () => {
      if (saveStatus === "saving") return <span className="text-gray-500 text-[10px] uppercase font-bold animate-pulse">Saving...</span>;
      if (saveStatus === "saved") return <span className="text-[#4caf50] text-[10px] uppercase font-bold tracking-widest">Saved</span>;
      if (saveStatus === "error") return <span className="text-red-500 text-[10px] uppercase font-bold">Error</span>;
      return null;
    };

    const renderActiveUsers = () => {
      return (
        <div className="flex items-center -space-x-2 mr-4">
          {activeUsers.slice(0, 3).map((u, i) => (
            <div 
              key={i} 
              className="w-7 h-7 rounded-full border-2 border-[#0e0e12] flex items-center justify-center text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-110 hover:z-10"
              style={{ backgroundColor: u.user?.color || '#ff9249' }}
              title={u.user?.name || `User ${i+1}`}
            >
              {(u.user?.name || `U${i+1}`).charAt(0).toUpperCase()}
            </div>
          ))}
          {activeUsers.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-[#19191e] border-2 border-[#0e0e12] flex items-center justify-center text-[9px] font-bold text-gray-400">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="h-14 bg-[#0e0e12cc] backdrop-blur-md flex items-center justify-between px-6 border-b border-[#ffffff08] z-50 sticky top-0">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#ff9249] to-[#ff7b04] rounded-lg flex items-center justify-center font-bold text-[#0e0e12] text-sm shadow-[0_0_15px_rgba(255,146,73,0.2)] transition-transform group-hover:scale-105">
            C
          </div>
          <span className="text-[#fcf8fe] text-sm font-bold tracking-tight font-[Space_Grotesk] hidden sm:block">
            Collab<span className="text-[#ff9249]">Code</span>
          </span>
        </div>
  
        {/* Layout Controls */}
        <div className="flex items-center gap-1.5 ml-8">
          <button 
            onClick={toggleSidebar} 
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border ${sidebarOpen ? 'bg-[#ff924915] border-[#ff924944] text-[#ff9249]' : 'bg-transparent border-transparent text-[#acaab0] hover:text-[#fcf8fe]'}`}
          >
            Sidebar
          </button>
          <button 
            onClick={togglePreview} 
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border ${previewOpen ? 'bg-[#ff924915] border-[#ff924944] text-[#ff9249]' : 'bg-transparent border-transparent text-[#acaab0] hover:text-[#fcf8fe]'}`}
          >
            Preview
          </button>
          {previewOpen && (
            <button 
              onClick={toggleConsole} 
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border ${consoleOpen ? 'bg-[#ff924915] border-[#ff924944] text-[#ff9249]' : 'bg-transparent border-transparent text-[#acaab0] hover:text-[#fcf8fe]'}`}
            >
              Console
            </button>
          )}
          <button 
            onClick={toggleChat} 
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border ${chatOpen ? 'bg-[#ff924915] border-[#ff924944] text-[#ff9249]' : 'bg-transparent border-transparent text-[#acaab0] hover:text-[#fcf8fe]'}`}
          >
            Chat
          </button>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3 ml-auto">
          
          <div className="hidden md:block">
            {renderSaveStatus()}
          </div>

          <div className="w-[1px] h-4 bg-[#ffffff11] mx-2 hidden md:block"></div>

          {renderActiveUsers()}

          <input 
            type="file" 
            ref={fileInputRef} 
            webkitdirectory="true" 
            multiple 
            className="hidden" 
            onChange={handleFileChange}
          />
          
          <div className="flex items-center gap-2 bg-[#19191e33] p-1 rounded-xl border border-[#ffffff08]">
            <button 
              onClick={handleUploadClick}
              className="bg-transparent text-[#acaab0] hover:text-[#fcf8fe] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              Upload
            </button>

            <button 
              onClick={onRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${isRunning ? 'bg-[#ff924933] text-[#ff9249] animate-pulse' : 'bg-[#ff9249] text-[#0e0e12] hover:scale-[1.02] shadow-[0_0_15px_rgba(255,146,73,0.2)]'}`}
            >
              {isRunning ? 'Running' : 'Run'}
            </button>

            <button 
              onClick={onSave} 
              className="bg-[#19191e] text-[#fcf8fe] border border-[#ffffff11] px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-[#25252b] transition-all"
            >
              Save
            </button>
            
            <button 
              onClick={() => downloadProject(yjsStore.doc)}
              className="bg-[#ff924911] text-[#ff9249] border border-[#ff924922] px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-[#ff92491a] transition-all"
            >
              Export
            </button>
          </div>
          
          <div className="w-[1px] h-6 bg-[#ffffff11] mx-2"></div>

          <div className="flex items-center gap-3 pl-2">
            {user?.avatar ? (
              <img src={user.avatar} className="w-8 h-8 rounded-full border border-[#ff924944] p-[1px]" alt="avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff9249] to-[#ff7b04] flex items-center justify-center text-[#0e0e12] font-black text-xs shadow-inner">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="text-[#acaab0] hover:text-red-400 text-[10px] font-bold uppercase tracking-tighter transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }
  
export default Navbar;