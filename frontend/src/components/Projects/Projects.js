import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ProjectModal from './ProjectModal';
import TaskModal from './TaskModal';
import { getUser } from '../../utils/auth';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
   const [users, setUsers] = useState([]);
  const currentUser = getUser();
  const avatarUrl = currentUser?.avatarUrl || '/Header_pic.jpg';

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (currentUser?.role === 'admin') {
        const res = await api.get('/auth/users');
        setUsers(res.data);
      } else if (currentUser) {
        setUsers([currentUser]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleProjectClick = async (project) => {
    setSelectedProject(project);
    await fetchTasks(project._id);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleCreateTask = () => {
    if (!selectedProject) return;
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      if (selectedProject) {
        await fetchTasks(selectedProject._id);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleModalClose = () => {
    setShowProjectModal(false);
    setShowTaskModal(false);
    setEditingProject(null);
    setEditingTask(null);
    fetchProjects();
    if (selectedProject) {
      fetchTasks(selectedProject._id);
    }
  };

  if (loading) {
    return <div className="projects-loading">Loading projects...</div>;
  }

  return (
    <div className="projects">
      <div className="projects-container">
        <div className="projects-header">
          <h1>My Projects</h1>
          <div className="projects-profile">
            <div className="projects-avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
            <div>
              <p className="label">Signed in</p>
              <p className="value">{currentUser?.username}</p>
              <span className={`pill ${currentUser?.role === 'admin' ? 'pill-warn' : ''}`}>{currentUser?.role}</span>
            </div>
          </div>
          <button onClick={handleCreateProject} className="btn-primary">
            + New Project
          </button>
        </div>

        <div className="projects-layout">
          <div className="projects-sidebar">
            <h2>Projects ({projects.length})</h2>
            {projects.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet. Create your first project!</p>
              </div>
            ) : (
              <div className="projects-list">
                {projects.map(project => (
                  <div
                    key={project._id}
                    className={`project-item ${selectedProject?._id === project._id ? 'active' : ''}`}
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="project-item-content">
                      <h3>{project.title}</h3>
                      <p>{project.description || 'No description'}</p>
                      <div className="project-item-meta">
                        <span className={`status-badge status-${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="project-item-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        className="btn-icon"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="btn-icon"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="projects-main">
            {selectedProject ? (
              <>
                <div className="project-detail-header">
                  <div>
                    <h2>{selectedProject.title}</h2>
                    <p>{selectedProject.description || 'No description'}</p>
                    <div className="project-detail-meta">
                      <span className={`status-badge status-${selectedProject.status}`}>
                        {selectedProject.status}
                      </span>
                      <span className={`priority-badge priority-${selectedProject.priority}`}>
                        {selectedProject.priority}
                      </span>
                    </div>
                  </div>
                  <button onClick={handleCreateTask} className="btn-primary">
                    + New Task
                  </button>
                </div>

                <div className="tasks-section">
                  <h3>Tasks ({tasks.length})</h3>
                  {tasks.length === 0 ? (
                    <div className="empty-state">
                      <p>No tasks yet. Create your first task!</p>
                    </div>
                  ) : (
                    <div className="tasks-list">
                      {tasks.map(task => (
                        <div key={task._id} className="task-item">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={async (e) => {
                              try {
                                await api.put(`/tasks/${task._id}`, {
                                  ...task,
                                  status: e.target.checked ? 'completed' : 'todo'
                                });
                                await fetchTasks(selectedProject._id);
                              } catch (error) {
                                console.error('Error updating task:', error);
                              }
                            }}
                          />
                          <div className="task-content">
                            <h4 className={task.status === 'completed' ? 'completed' : ''}>
                              {task.title}
                            </h4>
                            <p>{task.description || 'No description'}</p>
                            <div className="task-meta">
                              <span className={`status-badge status-${task.status}`}>
                                {task.status}
                              </span>
                              <span className={`priority-badge priority-${task.priority}`}>
                                {task.priority}
                              </span>
                            {task.assigneeId && (
                              <span className="assignee-chip">
                                Assigned to {task.assigneeId.username || 'User'}
                              </span>
                            )}
                            </div>
                          </div>
                          <div className="task-actions">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="btn-icon"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="btn-icon"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a project to view its tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={handleModalClose}
        />
      )}

      {showTaskModal && selectedProject && (
        <TaskModal
          task={editingTask}
          projectId={selectedProject._id}
          users={users}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Projects;

