import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import Navbar from './components/Navbar'
import Chat from './components/Chat'
import FileExplorer from './components/FileExplorer'
import { io } from 'socket.io-client'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import { WebContainer } from '@webcontainer/api'

const socket = io("http://localhost:5001")

let webcontainerInstance = null
let webcontainerPromise = null

const bootWebContainer = async () => {
  if (webcontainerInstance) return webcontainerInstance

  if (!webcontainerPromise) {
    webcontainerPromise = WebContainer.boot().then((instance) => {
      webcontainerInstance = instance
      return instance
    })
  }

  return webcontainerPromise
}

function App() {
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [roomId] = useState("react-room")
  const [usersOnline, setUsersOnline] = useState(1)
  const [terminalOutput, setTerminalOutput] = useState("Booting...\n")
  const [serverUrl, setServerUrl] = useState(null)

  const editorRef = useRef(null)
  const providerRef = useRef(null)
  const docRef = useRef(new Y.Doc())
  const bindingRef = useRef(null)
  const wcRef = useRef(null)

  // ✅ Boot container
  useEffect(() => {
    bootWebContainer().then(async (instance) => {
      wcRef.current = instance

      // 🔥 CREATE REACT PROJECT FILES
      const files = {
        "package.json": {
          file: {
            contents: JSON.stringify({
              name: "react-app",
              private: true,
              version: "0.0.0",
              scripts: {
                dev: "vite"
              },
              dependencies: {
                react: "^18.2.0",
                "react-dom": "^18.2.0"
              },
              devDependencies: {
                vite: "^5.0.0"
              }
            })
          }
        },
        "index.html": {
          file: {
            contents: `
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.jsx"></script>
  </body>
</html>`
          }
        },
        "main.jsx": {
          file: {
            contents: `
import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return <h1>Hello React 🚀</h1>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`
          }
        }
      }

      await instance.mount(files)

      setTerminalOutput("Installing dependencies...\n")

      const install = await instance.spawn("npm", ["install"])

      install.output.pipeTo(new WritableStream({
        write(data) {
          setTerminalOutput(prev => prev + data)
        }
      }))

      await install.exit

      setTerminalOutput(prev => prev + "\nStarting dev server...\n")

      const dev = await instance.spawn("npm", ["run", "dev"])

      dev.output.pipeTo(new WritableStream({
        write(data) {
          setTerminalOutput(prev => prev + data)
        }
      }))

      instance.on("server-ready", (port, url) => {
        setServerUrl(url)
      })
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e' }}>
      
      <Navbar usersOnline={usersOnline} onRun={() => {}} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Terminal */}
        <div style={{ width: '30%', background: '#000', color: '#0f0', padding: '10px', overflowY: 'auto' }}>
          <pre>{terminalOutput}</pre>
        </div>

        {/* React Preview */}
        <div style={{ flex: 1 }}>
          {serverUrl ? (
            <iframe src={serverUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <div style={{ color: '#fff', padding: '20px' }}>Starting server...</div>
          )}
        </div>

        <Chat socket={socket} roomId={roomId} />
      </div>
    </div>
  )
}

export default App