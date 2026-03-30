import { useState } from 'react'

const defaultFiles = [
  { id: 1, name: 'index.html', language: 'html', content: `<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>Start coding here...</p>
  </body>
</html>` },
  { id: 2, name: 'style.css', language: 'css', content: `body {
  font-family: sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

h1 {
  color: #6c63ff;
}` },
  { id: 3, name: 'script.js', language: 'javascript', content: `// Your JavaScript here
console.log('Hello from CollabCode!')

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded!')
})` },
]

function FileExplorer({ activeFile, onFileSelect, onFilesChange }) {
  const [files, setFiles] = useState(defaultFiles)
  const [isAdding, setIsAdding] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const getFileIcon = (name) => {
    if (name.endsWith('.html')) return { icon: 'H', color: '#e34c26' }
    if (name.endsWith('.css'))  return { icon: 'C', color: '#264de4' }
    if (name.endsWith('.js'))   return { icon: 'J', color: '#f7df1e' }
    if (name.endsWith('.jsx'))  return { icon: 'R', color: '#61dafb' }
    if (name.endsWith('.ts'))   return { icon: 'T', color: '#3178c6' }
    if (name.endsWith('.json')) return { icon: '{', color: '#ffa500' }
    return { icon: 'F', color: '#aaa' }
  }

  const getLanguage = (name) => {
    if (name.endsWith('.html'))             return 'html'
    if (name.endsWith('.css'))              return 'css'
    if (name.endsWith('.js'))               return 'javascript'
    if (name.endsWith('.jsx'))              return 'javascript'
    if (name.endsWith('.ts'))               return 'typescript'
    if (name.endsWith('.json'))             return 'json'
    return 'plaintext'
  }

  const addFile = () => {
    const trimmed = newFileName.trim()
    if (!trimmed) return
    const name = trimmed.includes('.') ? trimmed : trimmed + '.html'
    const newFile = {
      id: Date.now(),
      name,
      language: getLanguage(name),
      content: ''
    }
    const updated = [...files, newFile]
    setFiles(updated)
    onFilesChange(updated)
    onFileSelect(newFile)
    setNewFileName('')
    setIsAdding(false)
  }

  const deleteFile = (e, fileId) => {
    e.stopPropagation()
    if (files.length === 1) return
    const updated = files.filter(f => f.id !== fileId)
    setFiles(updated)
    onFilesChange(updated)
    if (activeFile?.id === fileId) onFileSelect(updated[0])
  }

  return (
    <div style={{
      width: '200px',
      backgroundColor: '#1e1e2e',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>

      {/* Header */}
      <div style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: '1px solid #333',
        backgroundColor: '#1a1a2e'
      }}>
        <span style={{ color: '#aaa', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Files
        </span>
        <button
          onClick={() => setIsAdding(true)}
          title="New file"
          style={{
            background: 'none',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            padding: '0 2px'
          }}
        >
          +
        </button>
      </div>

      {/* File list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {files.map((file) => {
          const { icon, color } = getFileIcon(file.name)
          const isActive = activeFile?.id === file.id
          return (
            <div
              key={file.id}
              onClick={() => onFileSelect(file)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#2a2a4a' : 'transparent',
                borderLeft: isActive ? '2px solid #6c63ff' : '2px solid transparent',
                transition: 'background 0.1s',
                group: true
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#252535' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {/* File type icon */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                backgroundColor: color + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: color,
                flexShrink: 0
              }}>
                {icon}
              </div>

              {/* File name */}
              <span style={{
                color: isActive ? '#fff' : '#ccc',
                fontSize: '13px',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {file.name}
              </span>

              {/* Delete button */}
              {files.length > 1 && (
                <span
                  onClick={(e) => deleteFile(e, file.id)}
                  title="Delete file"
                  style={{
                    color: '#555',
                    fontSize: '14px',
                    lineHeight: 1,
                    padding: '0 2px',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff6584'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}
                >
                  ×
                </span>
              )}
            </div>
          )
        })}

        {/* New file input */}
        {isAdding && (
          <div style={{ padding: '6px 12px' }}>
            <input
              autoFocus
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addFile()
                if (e.key === 'Escape') { setIsAdding(false); setNewFileName('') }
              }}
              onBlur={() => { if (!newFileName.trim()) setIsAdding(false) }}
              placeholder="filename.html"
              style={{
                width: '100%',
                backgroundColor: '#2d2d4e',
                border: '1px solid #6c63ff',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}
      </div>

    </div>
  )
}

export { defaultFiles }
export default FileExplorer