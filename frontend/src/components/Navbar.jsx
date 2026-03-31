import { yjsStore } from '../features/collaboration/yjsStore';
import { saveProject } from '../features/collaboration/exportProject';

function Navbar({ usersOnline, onRun }) {
    const handleSave = () => {
      if (yjsStore.doc && yjsStore.roomId) {
        saveProject(yjsStore.doc, yjsStore.roomId);
      } else {
        console.warn("Save aborted: No active Y.Doc or Room ID.");
      }
    };

    return (
      <div style={{ height: '48px', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', backgroundColor: '#6c63ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>C</div>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>CollabCode</span>
        </div>
  
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#aaa', fontSize: '12px' }}>{usersOnline} online</span>
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
  
  export default Navbar