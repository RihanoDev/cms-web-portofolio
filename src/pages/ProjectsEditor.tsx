import React, { useState, useEffect } from 'react';
import { ContentStore, Project, Category, Tag } from '../services/content';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import CategorySelector from '../components/CategorySelector';
import MediaUploader from '../components/MediaUploader';
import VideoUploader from '../components/VideoUploader';
import UuidGenerator from '../components/UuidGenerator';
import TechnologySelector from '../components/TechnologySelector';
import MetadataViewer from '../components/MetadataViewer';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import LangToggle, { getTranslation, setTranslation } from '../components/LangToggle';
// Card component for consistent UI
const Card = ({ title, children }: { title?: string, children: React.ReactNode }) => (
  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700/50">
    {title && (
      <div className="border-b border-slate-700 px-6 py-4">
        <h3 className="font-semibold text-white m-0">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

// The main project editor component
export default function ProjectsEditor() {
  // State management for projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([
    'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js',
    'Python', 'Django', 'Flask', 'Go', 'Ruby', 'Rails', 'PHP', 'Laravel',
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Docker',
    'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Redis', 'GraphQL', 'REST API', 'Serverless', 'Firebase'
  ]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'id'>('en');
  const [saving, setSaving] = useState(false);
  const [savingIndex, setSavingIndex] = useState<number | null>(null); // per-project save
  const [savedIndex, setSavedIndex] = useState<number | null>(null);   // per-project success flash
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Load projects
      try {
        const loadedProjects = await ContentStore.getProjects();
        setProjects(Array.isArray(loadedProjects) ? loadedProjects : []);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
      }

      // Load categories
      try {
        const loadedCategories = await ContentStore.getCategories();
        setCategories(Array.isArray(loadedCategories) ? loadedCategories : []);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      }

      // Load tags
      try {
        const loadedTags = await ContentStore.getTags();
        setTags(Array.isArray(loadedTags) ? loadedTags : []);
      } catch (error) {
        console.error("Error loading tags:", error);
        setTags([]);
      }
    };

    loadData();
  }, []);

  // Create a new project with defaults
  const addNewProject = () => {
    const projectId = 'temp-' + Date.now(); // Temporary ID to track this project until saved
    const newProject: Project = {
      id: projectId, // Temporary ID until saved to server
      title: '',
      slug: '',
      description: '',
      content: '',
      technologies: [],
      status: 'ongoing',
      categories: [],
      tags: [],
      link: '',
      githubUrl: '',
      demoUrl: '',
      images: [],
      videos: []
    };

    setProjects(prev => [...prev, newProject]);
    // Focus the new project by setting it as the editing project
    setEditingIndex(projects.length);
  };

  // Function to ensure valid token
  const ensureValidToken = async () => {
    const token = localStorage.getItem('cms_token');
    if (!token) {
      setError("No authentication token found. Please log in.");
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return false;
    }

    // We could add token refresh logic here if needed
    return true;
  };

  // Save a single project by its array index
  const saveOneProject = async (index: number) => {
    const project = projects[index];
    if (!project) return;

    if (!project.title?.trim()) {
      setError(`Project must have a title before saving.`);
      return;
    }
    if (!project.slug?.trim()) {
      setError(`Project '${project.title}' needs a slug.`);
      return;
    }

    const token = localStorage.getItem('cms_token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
      return;
    }

    setSavingIndex(index);
    setError(null);
    try {
      const [saved] = await ContentStore.saveProjects([project]);
      // Replace temp project with the real one returned from API
      setProjects(prev => prev.map((p, i) => i === index ? { ...saved } : p));
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 3000);
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(`Failed to save "${project.title}": ${err?.message || 'Unknown error'}`);
    } finally {
      setSavingIndex(null);
    }
  };

  // Save all projects
  const saveProjects = async () => {
    setSaving(true);
    setError(null); // Clear any previous errors

    const currentProjects = Array.isArray(projects) ? projects : [];

    try {
      // Validate projects before saving
      for (const project of currentProjects) {
        if (!project.title?.trim()) {
          setError("All projects must have a title");
          setSaving(false);
          return;
        }
        if (!project.slug?.trim()) {
          setError(`Project '${project.title}' is missing a slug`);
          setSaving(false);
          return;
        }
      }

      // Check if user is logged in first and token is valid
      const isTokenValid = await ensureValidToken();
      if (!isTokenValid) {
        return;
      }

      await ContentStore.saveProjects(currentProjects);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error saving projects:", error);

      // Enhanced error handling with better user feedback
      if (error.message && error.message.includes('Authentication required')) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem('cms_token'); // Clear invalid token
          window.location.href = '/login';
        }, 2000);
      } else if (error.message && error.message.includes('401')) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem('cms_token'); // Clear invalid token
          window.location.href = '/login';
        }, 2000);
      } else if (error.message && error.message.includes('400')) {
        // Bad request - likely validation errors
        setError(`Invalid project data: ${error.message.replace('Error 400: ', '')}`);
      } else if (error.message && error.message.includes('500')) {
        // Server error
        setError(`Server error while saving project. Technical details: ${error.message.replace('Error 500: ', '')}`);
      } else {
        // Generic error with more details if available
        const errorMsg = error.message || "Unknown error";
        setError(`There was a problem saving your projects: ${errorMsg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Update a field on a specific project
  const updateProjectField = (index: number, field: keyof Project, value: any) => {
    setProjects(prev => prev.map((project, i) =>
      i === index ? { ...project, [field]: value } : project
    ));
  };

  // Remove a project (Triggers Modal)
  const removeProject = (index: number) => {
    setDeleteTargetIndex(index);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (deleteTargetIndex === null) return;

    const project = projects[deleteTargetIndex];

    // If it's saved in backend, call delete API
    if (project.id && !project.id.startsWith("temp-")) {
      setIsDeleting(true);
      try {
        await ContentStore.deleteProject(project.id);
      } catch (err: any) {
        console.error("Failed to delete project:", err);
        setError("Failed to delete project. Please try again.");
        setIsDeleting(false);
        setDeleteModalOpen(false);
        setDeleteTargetIndex(null);
        return;
      }
      setIsDeleting(false);
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    }

    // Remove from local state
    setProjects(prev => prev.filter((_, i) => i !== deleteTargetIndex));
    if (editingIndex === deleteTargetIndex) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > deleteTargetIndex) {
      setEditingIndex(editingIndex - 1);
    }

    setDeleteModalOpen(false);
    setDeleteTargetIndex(null);
  };

  // Generate a slug from the title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .trim();
  };

  // Handle title change with automatic slug generation
  const handleTitleChange = (index: number, value: string) => {
    updateProjectField(index, 'title', value);

    // Auto-generate slug from title if slug is empty or matches the previous title's slug
    const project = projects[index];
    const currentSlug = project.slug || '';
    const previousTitle = project.title || '';
    const previousSlug = generateSlug(previousTitle);

    if (!currentSlug || currentSlug === previousSlug) {
      updateProjectField(index, 'slug', generateSlug(value));
    }
  };

  // Filter projects based on search
  const projectsArray = Array.isArray(projects) ? projects : [];
  const filteredProjects = searchTerm.trim() === ''
    ? projectsArray
    : projectsArray.filter(project =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase())) ||
      project.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success message */}
      {showSuccess && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          Projects saved successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
          {error}
        </div>
      )}

      {/* ── Animated delete success toast ── */}
      <div
        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ease-out ${showDeleteSuccess
          ? 'opacity-100 translate-y-0 bg-red-900/90 border-red-500/60 text-red-300'
          : 'opacity-0 -translate-y-4 pointer-events-none bg-red-900/90 border-red-500/60 text-red-300'
          }`}
      >
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm">Project berhasil dihapus!</p>
          <p className="text-xs text-red-400/70">Data telah dihapus dari sistem.</p>
        </div>
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-red-500/50 rounded-b-xl"
          style={{
            width: showDeleteSuccess ? '0%' : '100%',
            transition: showDeleteSuccess ? 'width 3s linear' : 'none',
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Project Management */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Project Management</h3>
                <p className="text-slate-400 text-sm">
                  Add, edit and showcase your portfolio projects with detailed information.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={addNewProject}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Project
                </button>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <div className="text-sm font-medium text-slate-400 mb-3">Project Statistics</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{projectsArray.length}</div>
                    <div className="text-xs text-slate-400">Total Projects</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {projectsArray.filter(p => p.status === 'completed').length}
                    </div>
                    <div className="text-xs text-slate-400">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Project List */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects by title, description, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredProjects.length === 0 && (
              <div className="bg-slate-800 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                {searchTerm ? (
                  <>
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-slate-300">No matching projects</h3>
                    <p className="text-slate-400 mt-1">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-slate-300">No projects yet</h3>
                    <p className="text-slate-400 mt-1">Click the "Add New Project" button to get started</p>
                  </>
                )}
              </div>
            )}

            {filteredProjects.map((project) => {
              const index = projectsArray.findIndex(p => p.id === project.id);
              const isEditing = editingIndex === index;

              return (
                <div
                  key={project.id || index}
                  className={`bg-slate-800/90 rounded-xl overflow-hidden border transition-all shadow-lg ${isEditing
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-slate-700/70 hover:border-slate-600'
                    }`}
                >
                  <div className="p-5">
                    {/* Project header with title and actions */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        {activeLang === 'en' ? (
                          <input
                            id={`project-title-${index}`}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-lg font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="Project Title (EN)"
                            value={project.title || ''}
                            onChange={e => handleTitleChange(index, e.target.value)}
                          />
                        ) : (
                          <input
                            id={`project-title-id-${index}`}
                            className="w-full bg-slate-700/50 border border-blue-500/50 rounded-lg px-4 py-2 text-white text-lg font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="Judul Proyek (ID)"
                            value={getTranslation(project.metadata, 'id', 'title', '')}
                            onChange={e => updateProjectField(index, 'metadata', setTranslation(project.metadata, 'id', 'title', e.target.value))}
                          />
                        )}
                      </div>
                      <div className="flex items-center ml-4 space-x-2">
                        <button
                          onClick={() => setEditingIndex(isEditing ? null : index)}
                          className={`p-2 ${isEditing ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} rounded-lg transition-colors`}
                          aria-label={isEditing ? "Collapse editor" : "Expand editor"}
                          title={isEditing ? "Collapse editor" : "Expand editor"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d={isEditing ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                            ></path>
                          </svg>
                        </button>
                        <button
                          className="p-2 bg-red-500/70 hover:bg-red-500 rounded-lg transition-colors"
                          onClick={() => removeProject(index)}
                          aria-label="Delete project"
                          title="Delete project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Quick info when collapsed */}
                    {!isEditing && (
                      <>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.technologies?.map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-lg"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {project.description && (
                          <div className="mt-3 text-slate-300 text-sm line-clamp-2">
                            {project.description}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap gap-3 text-xs">
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                              </svg>
                              Project Link
                            </a>
                          )}

                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-slate-400 hover:text-slate-300 hover:underline"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                              GitHub
                            </a>
                          )}

                          {project.demoUrl && (
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-green-400 hover:text-green-300 hover:underline"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                              Live Demo
                            </a>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                          <div className="px-2 py-0.5 bg-slate-700/70 rounded-md">
                            {project.status || 'ongoing'}
                          </div>
                          <div>
                            ID: {project.id ? project.id.substring(0, 8) : 'Not set'}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Detailed editor when expanded */}
                    {isEditing && (
                      <div className="mt-5 space-y-6">
                        {/* Language Toggle */}
                        <LangToggle activeLang={activeLang} onChange={setActiveLang} />
                        {/* UUID Generator */}
                        <div>
                          <label htmlFor={`project-uuid-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                            Project ID
                          </label>
                          <UuidGenerator
                            value={project.id || ''}
                            onChange={(value) => updateProjectField(index, 'id', value)}
                          />
                        </div>

                        {/* Slug */}
                        <div>
                          <label htmlFor={`project-slug-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                            Slug (URL Path)
                          </label>
                          <div className="flex items-center">
                            <div className="bg-slate-600/50 px-3 py-2 rounded-l-lg text-slate-400 text-sm">
                              project/
                            </div>
                            <input
                              id={`project-slug-${index}`}
                              type="text"
                              className="flex-1 bg-slate-700/50 border-y border-r border-slate-600 rounded-r-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="project-url-slug"
                              value={project.slug || ''}
                              onChange={(e) => updateProjectField(index, 'slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            />
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label htmlFor={`project-status-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                            Status
                          </label>
                          <select
                            id={`project-status-${index}`}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={project.status || 'ongoing'}
                            onChange={(e) => updateProjectField(index, 'status', e.target.value)}
                          >
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="planning">Planning</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>

                        {/* Technologies */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Technologies Used
                          </label>
                          <TechnologySelector
                            technologies={technologies}
                            selectedTechnologies={project.technologies || []}
                            onChange={(selected: (string | number)[]) => updateProjectField(index, 'technologies', selected)}
                          />
                        </div>

                        {/* Categories */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Categories
                          </label>
                          <CategorySelector
                            categories={categories}
                            selectedCategories={project.categories?.map(cat => cat.id) || []}
                            onChange={(selectedIds) => {
                              const selectedCategories = categories.filter(cat =>
                                selectedIds.includes(cat.id)
                              );
                              updateProjectField(index, 'categories', selectedCategories);
                            }}
                          />
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Tags
                          </label>
                          <TagInput
                            value={project.tags?.map(tag => tag.name) || []}
                            onChange={(tagNames) => {
                              // Convert tag names to tag objects
                              const projectTags = tagNames.map(name => {
                                const existingTag = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
                                if (existingTag) return existingTag;
                                return {
                                  id: -Date.now(), // Temporary negative ID
                                  name,
                                  slug: generateSlug(name)
                                };
                              });
                              updateProjectField(index, 'tags', projectTags);
                            }}
                            suggestions={tags.map(tag => tag.name)}
                          />
                        </div>

                        {/* Short Description */}
                        <div>
                          <label htmlFor={`project-description-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                            Short Description {activeLang === 'id' && <span className="text-blue-400">(ID)</span>}
                          </label>
                          {activeLang === 'en' ? (
                            <textarea
                              id={`project-description-${index}`}
                              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                              placeholder="Brief description of your project..."
                              value={project.description || ''}
                              onChange={(e) => updateProjectField(index, 'description', e.target.value)}
                            />
                          ) : (
                            <textarea
                              id={`project-description-id-${index}`}
                              className="w-full bg-slate-700/50 border border-blue-500/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                              placeholder="Deskripsi singkat proyek (Bahasa Indonesia)..."
                              value={getTranslation(project.metadata, 'id', 'description', '')}
                              onChange={(e) => updateProjectField(index, 'metadata', setTranslation(project.metadata, 'id', 'description', e.target.value))}
                            />
                          )}
                        </div>

                        {/* Links Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Project Link */}
                          <div>
                            <label htmlFor={`project-link-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                              Project Link
                            </label>
                            <input
                              id={`project-link-${index}`}
                              type="text"
                              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://example.com"
                              value={project.link || ''}
                              onChange={(e) => updateProjectField(index, 'link', e.target.value)}
                            />
                          </div>

                          {/* GitHub Link */}
                          <div>
                            <label htmlFor={`project-github-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                              GitHub Repository
                            </label>
                            <input
                              id={`project-github-${index}`}
                              type="text"
                              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://github.com/username/repo"
                              value={project.githubUrl || ''}
                              onChange={(e) => updateProjectField(index, 'githubUrl', e.target.value)}
                            />
                          </div>

                          {/* Demo Link */}
                          <div>
                            <label htmlFor={`project-demo-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                              Live Demo URL
                            </label>
                            <input
                              id={`project-demo-${index}`}
                              type="text"
                              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://demo.example.com"
                              value={project.demoUrl || ''}
                              onChange={(e) => updateProjectField(index, 'demoUrl', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Featured Image */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Featured Image
                          </label>
                          <div className="flex flex-col sm:flex-row gap-4">
                            {project.featuredImageUrl ? (
                              <div className="w-full sm:w-1/3 relative group">
                                <img
                                  src={project.featuredImageUrl}
                                  alt="Featured"
                                  className="w-full h-40 object-cover rounded-lg border border-slate-700"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => updateProjectField(index, 'featuredImageUrl', '')}
                                    className="p-2 bg-red-500 rounded-full"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full sm:w-1/3">
                                <MediaUploader
                                  folder={`projects/${project.id}`}
                                  images={[]}
                                  onAdd={(image) => updateProjectField(index, 'featuredImageUrl', image.url)}
                                  onUpdate={() => { }}
                                  onRemove={() => { }}
                                />
                              </div>
                            )}

                            <div className="w-full sm:w-2/3">
                              <input
                                type="text"
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                                placeholder="Or enter image URL directly"
                                value={project.featuredImageUrl || ''}
                                onChange={(e) => updateProjectField(index, 'featuredImageUrl', e.target.value)}
                              />
                              <p className="mt-2 text-xs text-slate-400">
                                This image will be used as the main image for the project in listings and social shares
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rich Text Content */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Project Details
                          </label>
                          <RichTextEditor
                            value={project.content || ''}
                            onChange={(value) => updateProjectField(index, 'content', value)}
                            placeholder="Write detailed information about your project here..."
                          />
                        </div>

                        {/* Project Images */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Project Images
                          </label>
                          <MediaUploader
                            folder={`projects/${project.id}`}
                            images={project.images || []}
                            onAdd={(image) => {
                              const images = [...(project.images || []), image];
                              updateProjectField(index, 'images', images);
                            }}
                            onUpdate={(imageIndex, updatedImage) => {
                              if (!project.images) return;
                              const images = [...project.images];
                              images[imageIndex] = updatedImage;
                              updateProjectField(index, 'images', images);
                            }}
                            onRemove={(imageIndex) => {
                              if (!project.images) return;
                              const images = project.images.filter((_, i) => i !== imageIndex);
                              updateProjectField(index, 'images', images);
                            }}
                          />
                        </div>

                        {/* Project Videos */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Project Videos or Demos
                          </label>
                          <VideoUploader
                            videos={project.videos || []}
                            onAdd={(video) => {
                              const videos = [...(project.videos || []), video];
                              updateProjectField(index, 'videos', videos);
                            }}
                            onUpdate={(videoIndex, updatedVideo) => {
                              if (!project.videos) return;
                              const videos = [...project.videos];
                              videos[videoIndex] = updatedVideo;
                              updateProjectField(index, 'videos', videos);
                            }}
                            onRemove={(videoIndex) => {
                              if (!project.videos) return;
                              const videos = project.videos.filter((_, i) => i !== videoIndex);
                              updateProjectField(index, 'videos', videos);
                            }}
                          />
                        </div>

                        {/* Metadata Viewer - Show what data is preserved */}
                        <div>
                          <MetadataViewer
                            metadata={{
                              projectData: {
                                id: project.id,
                                title: project.title,
                                slug: project.slug,
                                status: project.status
                              },
                              urls: {
                                thumbnailUrl: project.thumbnailUrl,
                                featuredImageUrl: project.featuredImageUrl,
                                githubUrl: project.githubUrl,
                                liveDemoUrl: project.liveDemoUrl,
                                demoUrl: project.demoUrl
                              },
                              content: {
                                technologies: project.technologies || [],
                                categories: project.categories || [],
                                tags: project.tags || []
                              },
                              media: {
                                images: project.images || [],
                                videos: project.videos || []
                              }
                            }}
                            title="Project Metadata Preview"
                            className="mt-4"
                          />
                        </div>
                        {/* Bottom Save Button */}
                        <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between gap-3">
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                          >
                            ✕ Collapse
                          </button>

                          <div className="flex items-center gap-3">
                            {savedIndex === index && (
                              <span className="text-green-400 text-sm flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                Tersimpan!
                              </span>
                            )}
                            <button
                              onClick={() => saveOneProject(index)}
                              disabled={savingIndex === index}
                              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors ${savingIndex === index
                                ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                }`}
                            >
                              {savingIndex === index ? (
                                <>
                                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Menyimpan...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                  </svg>
                                  {project.id?.startsWith('temp-') ? 'Simpan Project Baru' : 'Simpan Perubahan'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length > 0 && (
            <div className="mt-4 text-sm text-slate-400">
              Showing {filteredProjects.length} of {projectsArray.length} projects
              {searchTerm && <span> matching "{searchTerm}"</span>}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Project"
        itemName={deleteTargetIndex !== null && projectsArray[deleteTargetIndex] ? projectsArray[deleteTargetIndex].title || 'Untitled Project' : ''}
        onConfirm={confirmDeleteProject}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTargetIndex(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}

