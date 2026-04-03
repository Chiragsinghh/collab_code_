import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

class YjsStore {
  constructor() {
    this.doc = null;
    this.provider = null;
    this.roomId = null;
  }

  get awareness() {
    return this.provider?.awareness || null;
  }

  async initProject(projectId) {
    const roomId = `project-${projectId}`;
    if (this.roomId === roomId && this.doc) return;

    // Clean up old project bindings before connecting new
    this.destroyProject();

    this.roomId = roomId;
    this.doc = new Y.Doc();
    
    // 1. Fetch saved update from backend
    // 2. Apply update: Y.applyUpdate(ydoc, savedData)
    // 3. Connect WebSocket provider strictly after DB loaded
    try {
      await this.loadProjectFromDB(projectId);
    } catch (e) {
      console.error("❌ Failed to load project database initial state:", e);
    }

    // Safety check just in case user clicked away before load finished
    if (this.roomId !== roomId) return; 

    // Single global provider strictly confined to this project
    this.provider = new WebsocketProvider(
      `ws://localhost:5001/yjs`, 
      roomId,
      this.doc
    );

    this.provider.on("status", (event) => {
      console.log(`🔌 Yjs Websocket status: ${event.status} (Project: ${projectId})`);
    });
  }

  async loadProjectFromDB(projectId) {
    if (!this.doc) return;

    const res = await fetch(`http://localhost:5001/project/${projectId}/load`);
    const data = await res.json();
    
    if (data.success && data.ydoc) {
      // Decode base64 exactly as instructed
      const binaryString = atob(data.ydoc);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      Y.applyUpdate(this.doc, bytes);
      console.log(`✅ Project ${projectId} loaded perfectly from DB`);
    } else {
       console.log(`⚠️ Project ${projectId} loaded empty from DB`);
    }
  }

  async saveProjectToDB(projectId) {
    if (!this.doc) return;

    // 1. Encode native Yjs stream globally
    const update = Y.encodeStateAsUpdate(this.doc);
    
    // 2. Convert directly to Javascript Array natively as requested
    const ydocArray = Array.from(update);

    await fetch(`http://localhost:5001/project/${projectId}/save`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ ydocArray })
    });
  }

  getOrCreateText(fileId) {
    if (!this.doc || !fileId) return null;
    return this.doc.getText(fileId);
  }

  destroyProject() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }
    if (this.doc) {
      this.doc.destroy();
      this.doc = null;
    }
    this.roomId = null;
  }
}

export const yjsStore = new YjsStore();