import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  Folder,
  Plus,
  ChevronRight,
  Search,
  Filter,
  Users,
  Calendar,
  MoreVertical,
  Activity,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Settings,
  X
} from 'lucide-react';
import { projectsAPI } from '../../utils/apiClient';
import './Projects.css';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', repositoryUrl: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsAPI.getAll();
        setProjects(response.data || []);
        if (response.data?.length > 0) {
          setSelectedProject(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleCreateProject = () => {
    showToast("Opening architectural setup wizard...", "info");
  };

  const handleManageAll = () => {
    showToast("Synchronizing component lifecycle...", "info");
  };

  const handleEditClick = () => {
    setEditFormData({
      title: selectedProject.title,
      description: selectedProject.description || '',
      repositoryUrl: selectedProject.repositoryUrl || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.update(selectedProject._id, editFormData);

      // Update local state
      const updatedProjects = projects.map(p =>
        p._id === selectedProject._id ? { ...p, ...editFormData } : p
      );
      setProjects(updatedProjects);
      setSelectedProject({ ...selectedProject, ...editFormData });

      setIsEditModalOpen(false);
      showToast('Repository updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating project:', error);
      showToast('Failed to update repository.', 'error');
    }
  };

  if (loading) return <div className="projects-loading">Accessing project repositories...</div>;

  return (
    <div className="projects-page-professional">
      <div className="projects-sidebar-professional">
        <div className="sidebar-header-projects">
          <h2><Folder size={20} /> Repositories</h2>
          {user.designation === 'Manager' && (
            <button className="btn-icon-minimal" onClick={handleCreateProject}><Plus size={18} /></button>
          )}
        </div>
        <div className="search-sidebar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Find project..."
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
          />
        </div>
        <div className="project-list-sidebar">
          {filteredProjects.length === 0 ? (
            <div style={{ padding: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>No repositories found</div>
          ) : (
            filteredProjects.map(p => (
              <div
                key={p._id}
                className={`project-item-sidebar ${selectedProject?._id === p._id ? 'active' : ''}`}
                onClick={() => setSelectedProject(p)}
              >
                <div className="project-item-icon">
                  {p.title.charAt(0).toUpperCase()}
                </div>
                <div className="project-item-info">
                  <div className="title-row">
                    <h3>{p.title}</h3>
                    {p.repositoryUrl && <GitBranch size={10} className="repo-indicator" />}
                  </div>
                  <p>{p.status}</p>
                </div>
                <ChevronRight size={14} className="chevron" />
              </div>
            ))
          )}
        </div>
      </div>

      <main className="projects-main-professional">
        {selectedProject ? (
          <div className="project-detail-container">
            <header className="project-detail-header">
              <div className="header-breadcrumbs">
                <span>Projects</span>
                <ChevronRight size={14} />
                <span className="current">{selectedProject.title}</span>
              </div>
              <div className="header-main-info">
                <h1>{selectedProject.title}</h1>
                <div className="project-status-badge">
                  <Activity size={14} />
                  <span>{selectedProject.status}</span>
                </div>
                {user.designation === 'Manager' && (
                  <button className="btn-edit-minimal" onClick={handleEditClick}>
                    <Settings size={14} />
                    <span>Settings</span>
                  </button>
                )}
              </div>
              <p className="project-desc-professional">{selectedProject.description || 'No system description provided for this repository.'}</p>

              {selectedProject.repositoryUrl && (
                <div className="repo-link-wrapper">
                  <a
                    href={selectedProject.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-repo-link"
                  >
                    <GitBranch size={16} />
                    <span>View Bitbucket Repository</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <div className="project-meta-grid">
                <div className="meta-box">
                  <Users size={18} />
                  <div>
                    <span className="meta-label">Team Members</span>
                    <span className="meta-value">12 Collaborators</span>
                  </div>
                </div>
                <div className="meta-box">
                  <Calendar size={18} />
                  <div>
                    <span className="meta-label">Release Deadline</span>
                    <span className="meta-value">Nov 12, 2024</span>
                  </div>
                </div>
                <div className="meta-box">
                  <CheckCircle2 size={18} />
                  <div>
                    <span className="meta-label">Completion Status</span>
                    <span className="meta-value">68% Finalized</span>
                  </div>
                </div>
              </div>
            </header>

            <section className="project-tasks-section">
              <div className="section-header">
                <h2>Active Components</h2>
                <button className="btn-secondary-minimal" onClick={handleManageAll}>Manage All</button>
              </div>
              <div className="tasks-list-minimal">
                {[1, 2, 3].map(i => (
                  <div key={i} className="task-row-minimal">
                    <div className="task-check-icon"><div className="dot"></div></div>
                    <div className="task-title-minimal">Component Integration Test #{i}</div>
                    <div className="task-assignee">
                      <div className="avatar-stack">
                        <div className="avatar-xs">J</div>
                        <div className="avatar-xs">M</div>
                      </div>
                    </div>
                    <div className="task-due-date">3 days left</div>
                    <button className="btn-icon-minimal" onClick={() => showToast("Accessing component parameters...", "info")}><MoreVertical size={16} /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="no-project-selected">
            <Folder size={64} />
            <h2>Select a repository to view details</h2>
          </div>
        )}
      </main>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-professional card">
            <div className="modal-header">
              <h2>Edit Repository Settings</h2>
              <button className="btn-icon" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateProject} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Repository URL (Bitbucket)</label>
                <input
                  type="url"
                  placeholder="https://bitbucket.org/..."
                  value={editFormData.repositoryUrl}
                  onChange={e => setEditFormData({ ...editFormData, repositoryUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>System Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`toast-container-task ${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <Activity size={20} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default Projects;
