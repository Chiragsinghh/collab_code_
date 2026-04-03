import { yjsStore } from '../features/collaboration/yjsStore';
import { saveProject } from '../features/collaboration/exportProject';
import { useLayoutStore } from '../store/layoutStore';

function Navbar({ usersOnline, onRun }) {
    const { 
      sidebarOpen, toggleSidebar, 
      previewOpen, togglePreview, 
      consoleOpen, toggleConsole 
    } = useLayoutStore();

    const handleSave = () => {
      if (yjsStore.doc && yjsStore.roomId) {
        saveProject(yjsStore.doc, yjsStore.roomId);
      } else {
        console.warn("Save aborted: No active Y.Doc or Room ID.");
      }
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

    return (
      <div style={{ height: '48px', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          <span style={{ color: '#aaa', fontSize: '12px' }}>{usersOnline || 1} online</span>
          <button 
            onClick={onRun}
            style={{
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Run (Node / Preview)
          </button>
          <button 
            onClick={handleSave} 
            style={{ backgroundColor: '#2d88ff', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
          >
            Save Project
          </button>
          <button style={{ backgroundColor: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>Share Room</button>
        </div>
      </div>
    )
  }
  
export default Navbar;