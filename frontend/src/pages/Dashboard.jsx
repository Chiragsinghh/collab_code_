import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import useAuthStore from "../store/useAuthStore";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/project/my");
      setProjects(data.projects);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    const id = uuidv4().slice(0, 8);
    const name = prompt("Project Name:", "New Project");
    if (!name) return;

    try {
      await api.post("/project/create", { id, name });
      navigate(`/editor/${id}`);
    } catch (err) {
      alert("Failed to create project");
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#0f0f1b', color: '#fff', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome, {user?.name || 'Developer'}</h1>
            <p style={{ color: '#aaa' }}>Manage your collaborative projects</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={createNewProject}
              style={{ padding: '10px 20px', backgroundColor: '#6c63ff', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + New Project
            </button>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#aaa', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {projects.map((project) => (
              <div 
                key={project._id} 
                style={{ backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '12px', border: '1px solid #333', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => navigate(`/editor/${project._id}`)}
              >
                <div style={{ width: '40px', height: '40px', backgroundColor: '#6c63ff22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '20px' }}>
                  📁
                </div>
                <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>{project.name}</h3>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: project.isPublic ? '#4caf50' : '#aaa', backgroundColor: project.isPublic ? '#4caf5022' : '#333', padding: '2px 8px', borderRadius: '4px' }}>
                    {project.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span style={{ color: '#6c63ff', fontSize: '14px', fontWeight: 'bold' }}>Open →</span>
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: '#1a1a2e', borderRadius: '12px', border: '1px dashed #444' }}>
                <p style={{ color: '#666' }}>No projects yet. Create your first one!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}