import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { yjsStore } from '../features/collaboration/yjsStore';
import { useLayoutStore } from '../store/layoutStore';
import { useExecutionStore } from '../features/execution/executionStore';
import { processFolderUpload } from '../utils/folderUpload';
import { useEditorStore } from '../store/useEditorStore';
import useAuthStore from '../store/useAuthStore';

function Navbar({ onSave, saveStatus, onRun }) {
    const { 
      sidebarOpen, toggleSidebar, 
      previewOpen, togglePreview, 
      consoleOpen, toggleConsole 
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

    const getButtonStyle = (isActive) => ({
      backgroundColor: isActive ? '#444' : 'transparent',
      color: isActive ? '#fff' : '#aaa',
      border: '1px solid #444',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    });

    const renderSaveStatus = () => {
      if (saveStatus === "saving") return <span style={{ color: "#aaa" }}>Saving...</span>;
      if (saveStatus === "saved") return <span style={{ color: "#4caf50" }}>Saved</span>;
      if (saveStatus === "error") return <span style={{ color: "#f48771" }}>Error</span>;
      return null;
    };

    const renderActiveUsers = () => {
      if (activeUsers.length === 0) return <span style={{ color: '#aaa', fontSize: '12px' }}>1 online</span>;

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {activeUsers.slice(0, 3).map((u, i) => (
            <div 
              key={i} 
              style={{
                width: '20px', height: '20px', borderRadius: '50%', 
                backgroundColor: u.user?.color || '#6c63ff', border: '1px solid #1a1a2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 'bold'
              }}
              title={u.user?.name || `User ${i+1}`}
            >
              {(u.user?.name || `U${i+1}`).charAt(0).toUpperCase()}
            </div>
          ))}
          {activeUsers.length > 3 && (
            <span style={{ color: '#aaa', fontSize: '12px', marginLeft: '4px' }}>+{activeUsers.length - 3}</span>
          )}
        </div>
      );
    };

    return (
      <div style={{ height: '48px', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ width: '28px', height: '28px', backgroundColor: '#6c63ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>C</div>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>CollabCode</span>
        </div>
  
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', marginRight: '20px' }}>
          <button onClick={toggleSidebar} style={getButtonStyle(sidebarOpen)}>🗂 Sidebar</button>
          <button onClick={togglePreview} style={getButtonStyle(previewOpen)}>🌐 Preview</button>
          {previewOpen && (
            <button onClick={toggleConsole} style={getButtonStyle(consoleOpen)}>🖥 Console</button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <div style={{ fontSize: "12px", marginRight: "10px" }}>
            {renderSaveStatus()}
          </div>

          {renderActiveUsers()}

          <input 
            type="file" 
            ref={fileInputRef} 
            webkitdirectory="true" 
            multiple 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
          <button 
            onClick={handleUploadClick}
            style={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #444', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
          >
            Upload Folder
          </button>

          <button 
            onClick={onRun}
            disabled={isRunning}
            style={{
              backgroundColor: isRunning ? '#388e3c' : '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          <button 
            onClick={onSave} 
            style={{ backgroundColor: '#2d88ff', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
          >
            Save Project
          </button>
          
          <div style={{ width: '1px', height: '20px', backgroundColor: '#333', margin: '0 8px' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user?.avatar ? (
              <img src={user.avatar} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="avatar" />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '12px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }
  
export default Navbar;