import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Simple debounce (no external dependency)
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

class YjsStore {
  constructor() {
    this.doc = null;
    this.provider = null;
    this.roomId = null;
    this._saveHandler = null;
  }

  get awareness() {
    return this.provider?.awareness || null;
  }

  async initProject(projectId) {
    const roomId = `project-${projectId}`;

    // Prevent unnecessary re-init
    if (this.roomId === roomId && this.doc) return;

    // 🔥 Clean previous project
    this.destroyProject();

    this.roomId = roomId;
    this.doc = new Y.Doc();

    try {
      // ✅ 1. LOAD FROM DB FIRST (CRITICAL)
      await this.loadProjectFromDB(projectId);
    } catch (e) {
      console.error("❌ Failed to load project:", e);
    }

    // Safety check if user switched project mid-load
    if (this.roomId !== roomId) return;

    // ✅ 2. THEN CONNECT WEBSOCKET
    this.provider = new WebsocketProvider(
      "ws://localhost:5001/yjs",
      roomId,
      this.doc
    );

    this.provider.on("status", (event) => {
      console.log(
        `🔌 WebSocket: ${event.status} (Project: ${projectId})`
      );
    });

    // ✅ 3. AUTO-SAVE SETUP (SAFE + DEBOUNCED)
    this._saveHandler = debounce(() => {
      this.saveProjectToDB(projectId);
    }, 1000);

    this.doc.on("update", this._saveHandler);
  }

  async loadProjectFromDB(projectId) {
    if (!this.doc) return;

    try {
      const res = await fetch(
        `http://localhost:5001/project/${projectId}/load`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await res.json();

      // ✅ FIXED CONDITION (no data.success)
      if (data.ydoc) {
        const binaryString = atob(data.ydoc);

        const bytes = Uint8Array.from(
          binaryString,
          (c) => c.charCodeAt(0)
        );

        // ✅ APPLY UPDATE BEFORE WEBSOCKET
        Y.applyUpdate(this.doc, bytes);

        console.log(`✅ Loaded project ${projectId} from DB`);
      } else {
        console.log(`⚠️ No saved data for project ${projectId}`);
      }
    } catch (err) {
      console.error("❌ Load error:", err);
    }
  }

  async saveProjectToDB(projectId) {
    if (!this.doc) return;

    try {
      const update = Y.encodeStateAsUpdate(this.doc);

      // ✅ FIXED KEY NAME
      const ydoc = Array.from(update);

      await fetch(
        `http://localhost:5001/project/${projectId}/save`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ ydoc }),
        }
      );

      console.log(`💾 Auto-saved project ${projectId}`);
    } catch (err) {
      console.error("❌ Save error:", err);
    }
  }

  getOrCreateText(fileId) {
    if (!this.doc || !fileId) return null;
    return this.doc.getText(fileId);
  }

  destroyProject() {
    // 🔥 Clean autosave listener
    if (this.doc && this._saveHandler) {
      this.doc.off("update", this._saveHandler);
      this._saveHandler = null;
    }

    // 🔥 Destroy provider
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }

    // 🔥 Destroy doc
    if (this.doc) {
      this.doc.destroy();
      this.doc = null;
    }

    this.roomId = null;
  }
}

export const yjsStore = new YjsStore();