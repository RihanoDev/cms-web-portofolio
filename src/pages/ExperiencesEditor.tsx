import React, { useState, useEffect } from "react";
import RichTextEditor from "../components/RichTextEditor";
import UuidGenerator from "../components/UuidGenerator";
import MetadataViewer from "../components/MetadataViewer";
import MediaUploader from "../components/MediaUploader";
import { getExperiences, saveExperiences, deleteExperience as apiDeleteExperience } from "../services/content";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import LangToggle, { getTranslation, setTranslation } from "../components/LangToggle";

// Tag interface for relational data
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Experience type matching backend API
export interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string; // Format: "YYYY-MM-DD"
  endDate?: string | null; // Format: "YYYY-MM-DD", nullable
  current: boolean;
  description: string;
  responsibilities: string[]; // Keep as array for flexibility (stored as JSON)
  technologies: Tag[]; // Relational data (many-to-many with tags)
  companyUrl?: string;
  logoUrl?: string;
  metadata?: Record<string, any>; // Flexible metadata (stored as JSONB)
  createdAt: string;
  updatedAt: string;
}

// Request types for creating/updating
export interface CreateExperienceRequest {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  responsibilities: string[];
  technologyIds?: number[]; // Preferred: use existing tag IDs
  technologyNames?: string[]; // Alternative: create new tags from names
  companyUrl?: string;
  logoUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateExperienceRequest {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  responsibilities?: string[];
  technologyIds?: number[]; // Preferred: use existing tag IDs
  technologyNames?: string[]; // Alternative: create new tags from names
  companyUrl?: string;
  logoUrl?: string;
  metadata?: Record<string, any>;
}

// Card component for consistent UI
const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700/50">
    {title && (
      <div className="border-b border-slate-700 px-6 py-4">
        <h3 className="font-semibold text-white m-0">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default function ExperiencesEditor() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'id'>('en');
  const [saving, setSaving] = useState(false);
  const [savingIndex, setSavingIndex] = useState<number | null>(null); // per-experience save
  const [savedIndex, setSavedIndex] = useState<number | null>(null);   // per-experience success flash
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // Load experiences on component mount
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        
        const apiExperiences = await getExperiences();
        
        setExperiences(apiExperiences as unknown as Experience[]);
      } catch (error) {
        
        setExperiences([]);
      }
    };

    loadExperiences();
  }, []);

  // Create a new experience with defaults
  const addNewExperience = () => {
    const newExperience: Experience = {
      id: 0,  // 0 = belum tersimpan ke DB (baru)
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      responsibilities: [],
      technologies: [],
      companyUrl: "",
      logoUrl: "",
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExperiences((prev) => [...prev, newExperience]);
    setEditingIndex(experiences.length);
  };

  // Update experience field
  const updateExperienceField = (index: number, field: keyof Experience, value: any) => {
    setExperiences((prev) => prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)));
  };

  // Delete experience (Triggers Modal)
  const deleteExperience = (index: number) => {
    setDeleteTargetIndex(index);
    setDeleteModalOpen(true);
  };

  const confirmDeleteExperience = async () => {
    if (deleteTargetIndex === null) return;

    const experience = experiences[deleteTargetIndex];

    // If it's saved in backend, call delete API
    if (experience.id && experience.id > 0) {
      setIsDeleting(true);
      try {
        await apiDeleteExperience(experience.id);
      } catch (err: any) {
        
        setError("Failed to delete experience. Please try again.");
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
    setExperiences((prev) => prev.filter((_, i) => i !== deleteTargetIndex));
    if (editingIndex === deleteTargetIndex) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > deleteTargetIndex) {
      setEditingIndex(editingIndex - 1);
    }

    setDeleteModalOpen(false);
    setDeleteTargetIndex(null);
  };

  // Toggle editing state
  const toggleEdit = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  // Save a single experience by its array index
  const saveOneExperience = async (index: number) => {
    const experience = experiences[index];
    if (!experience) return;

    if (!experience.title?.trim()) {
      alert('Pekerjaan (Title) harus diisi.');
      return;
    }
    if (!experience.company?.trim()) {
      alert('Nama perusahaan (Company) harus diisi.');
      return;
    }
    if (!experience.startDate?.trim()) {
      alert('Tanggal mulai (Start Date) harus diisi.');
      return;
    }

    const token = localStorage.getItem('cms_token');
    if (!token) {
      alert('No authentication token found. Please log in.');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
      return;
    }

    setSavingIndex(index);
    try {
      const [saved] = await saveExperiences([experience as any]);
      setExperiences(prev => prev.map((e, i) => i === index ? { ...e, ...saved } as Experience : e));
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 3000);
    } catch (err: any) {
      
      alert(`Gagal menyimpan "${experience.title || experience.company}": ${err?.message || 'Unknown error'}`);
    } finally {
      setSavingIndex(null);
    }
  };

  // Save all experiences
  const saveAllExperiences = async () => {
    setSaving(true);
    try {
      // Check for auth token
      const token = localStorage.getItem('cms_token');
      if (!token) {
        alert("You need to log in first.");
        window.location.href = '/login';
        return;
      }

      // Validate all experiences
      for (const exp of experiences) {
        if (!exp.title?.trim() || !exp.company?.trim() || !exp.startDate?.trim()) {
          alert(`Experience "${exp.title || exp.company || 'Baru'}" belum lengkap. Judul, Perusahaan, dan Tanggal Mulai wajib diisi.`);
          setSaving(false);
          return;
        }
      }

      // Call API to save experiences
      
      await saveExperiences(experiences as any);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      
      alert(`Failed to save experiences: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Add responsibility
  const addResponsibility = (index: number) => {
    const exp = experiences[index];
    updateExperienceField(index, "responsibilities", [...exp.responsibilities, ""]);
  };

  // Update responsibility
  const updateResponsibility = (expIndex: number, respIndex: number, value: string) => {
    const exp = experiences[expIndex];
    const newResponsibilities = [...exp.responsibilities];
    newResponsibilities[respIndex] = value;
    updateExperienceField(expIndex, "responsibilities", newResponsibilities);
  };

  // Remove responsibility
  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const exp = experiences[expIndex];
    const newResponsibilities = exp.responsibilities.filter((_, i) => i !== respIndex);
    updateExperienceField(expIndex, "responsibilities", newResponsibilities);
  };

  // Add technology
  const addTechnology = (index: number) => {
    const exp = experiences[index];
    const newTag: Tag = { id: 0, name: "", slug: "" }; // New empty tag
    updateExperienceField(index, "technologies", [...exp.technologies, newTag]);
  };

  // Update technology
  const updateTechnology = (expIndex: number, techIndex: number, value: string) => {
    const exp = experiences[expIndex];
    const newTechnologies = [...exp.technologies];
    newTechnologies[techIndex] = { ...newTechnologies[techIndex], name: value, slug: value.toLowerCase().replace(/\s+/g, "-") };
    updateExperienceField(expIndex, "technologies", newTechnologies);
  };

  // Remove technology
  const removeTechnology = (expIndex: number, techIndex: number) => {
    const exp = experiences[expIndex];
    const newTechnologies = exp.technologies.filter((_, i) => i !== techIndex);
    updateExperienceField(expIndex, "technologies", newTechnologies);
  };

  // Filter experiences based on search term
  const filteredExperiences = experiences.filter(
    (exp) => (exp.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (exp.company?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (exp.location?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
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
          <p className="font-semibold text-sm">Experience berhasil dihapus!</p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Experience</h1>
          <p className="text-slate-400">Manage your professional work experience entries</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={addNewExperience} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Experience
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search experiences..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      {/* Experiences List */}
      <div className="space-y-4">
        {filteredExperiences.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-slate-300 mb-2">No work experiences yet</h3>
              <p className="text-slate-500 mb-4">Get started by adding your first work experience entry.</p>
              <button onClick={addNewExperience} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Add Your First Experience
              </button>
            </div>
          </Card>
        ) : (
          filteredExperiences.map((experience, index) => {
            const originalIndex = experiences.findIndex((exp) => exp === experience);
            const isEditing = editingIndex === originalIndex;

            return (
              <Card key={originalIndex}>
                {/* Experience Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {experience.title || "New Experience"}
                      {experience.company && <span className="text-slate-400"> at {experience.company}</span>}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {experience.location && `${experience.location} • `}
                      {experience.startDate && experience.endDate
                        ? `${experience.startDate} - ${experience.endDate}`
                        : experience.startDate && experience.current
                          ? `${experience.startDate} - Present`
                          : experience.startDate || "No dates set"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => toggleEdit(originalIndex)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title={isEditing ? "Collapse" : "Edit"}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={isEditing ? "M5 15l7-7 7 7" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}
                        ></path>
                      </svg>
                    </button>

                    <button onClick={() => deleteExperience(originalIndex)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors" title="Delete experience">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Brief preview when collapsed */}
                {!isEditing && (
                  <div className="space-y-3">
                    {experience.description && <div className="text-slate-300 line-clamp-2" dangerouslySetInnerHTML={{ __html: experience.description.substring(0, 150) + "..." }} />}

                    {experience.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {experience.technologies.slice(0, 5).map((tech, idx) => (
                          <span key={tech.id || idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md">
                            {tech.name}
                          </span>
                        ))}
                        {experience.technologies.length > 5 && <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-md">+{experience.technologies.length - 5} more</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed editor when expanded */}
                {isEditing && (
                  <div className="mt-5 space-y-6">
                    {/* Language Toggle */}
                    <LangToggle activeLang={activeLang} onChange={setActiveLang} />
                    {/* UUID Generator */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Experience ID</label>
                      <UuidGenerator value={experience.id.toString()} onChange={(value) => updateExperienceField(originalIndex, "id", parseInt(value) || 0)} />
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Job Title * {activeLang === 'id' && <span className="text-blue-400">(ID)</span>}</label>
                        {activeLang === 'en' ? (
                          <input
                            type="text"
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Software Engineer"
                            value={experience.title}
                            onChange={(e) => updateExperienceField(originalIndex, "title", e.target.value)}
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full bg-slate-700/50 border border-blue-500/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Judul Pekerjaan (Indonesia)"
                            value={getTranslation(experience.metadata, 'id', 'title', '')}
                            onChange={(e) => updateExperienceField(originalIndex, "metadata", setTranslation(experience.metadata, 'id', 'title', e.target.value))}
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Company *</label>
                        <input
                          type="text"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tech Company Inc."
                          value={experience.company}
                          onChange={(e) => updateExperienceField(originalIndex, "company", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Location</label>
                        <input
                          type="text"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Jakarta, Indonesia"
                          value={experience.location || ""}
                          onChange={(e) => updateExperienceField(originalIndex, "location", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Company URL</label>
                        <input
                          type="url"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://company.com"
                          value={experience.companyUrl || ""}
                          onChange={(e) => updateExperienceField(originalIndex, "companyUrl", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Start Date *</label>
                        <input
                          type="month"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={experience.startDate}
                          onChange={(e) => updateExperienceField(originalIndex, "startDate", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">End Date</label>
                        <input
                          type="month"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          value={experience.endDate || ""}
                          disabled={experience.current}
                          onChange={(e) => updateExperienceField(originalIndex, "endDate", e.target.value)}
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                            checked={experience.current}
                            onChange={(e) => {
                              updateExperienceField(originalIndex, "current", e.target.checked);
                              if (e.target.checked) {
                                updateExperienceField(originalIndex, "endDate", "");
                              }
                            }}
                          />
                          <span className="text-sm text-slate-300">Currently working here</span>
                        </label>
                      </div>
                    </div>

                    {/* Company Logo */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Company Logo URL</label>
                      <div className="space-y-2">
                        {experience.logoUrl ? (
                          <div className="flex items-center gap-3">
                            <img src={experience.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-slate-600 bg-slate-700/50 p-1" />
                            <div className="flex-1">
                              <input
                                type="url"
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://company.com/logo.png"
                                value={experience.logoUrl || ""}
                                onChange={(e) => updateExperienceField(originalIndex, "logoUrl", e.target.value)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => updateExperienceField(originalIndex, "logoUrl", "")}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="url"
                              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://company.com/logo.png"
                              value={experience.logoUrl || ""}
                              onChange={(e) => updateExperienceField(originalIndex, "logoUrl", e.target.value)}
                            />
                            <div className="mt-2">
                              <MediaUploader
                                folder={`experiences/${experience.id}`}
                                images={[]}
                                onAdd={(img) => updateExperienceField(originalIndex, "logoUrl", img.url)}
                                onUpdate={() => { }}
                                onRemove={() => { }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Job Description {activeLang === 'id' && <span className="text-blue-400">(ID)</span>}</label>
                      {activeLang === 'en' ? (
                        <RichTextEditor value={experience.description} onChange={(val) => updateExperienceField(originalIndex, "description", val)} placeholder="Describe your role, achievements, and key responsibilities..." />
                      ) : (
                        <RichTextEditor
                          value={getTranslation(experience.metadata, 'id', 'description', '')}
                          onChange={(val) => updateExperienceField(originalIndex, "metadata", setTranslation(experience.metadata, 'id', 'description', val))}
                          placeholder="Deskripsikan peran, pencapaian, dan tanggung jawab utama (Bahasa Indonesia)..."
                        />
                      )}
                    </div>
                    {/* Responsibilities */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-medium text-slate-400">Key Responsibilities</label>
                        <button onClick={() => addResponsibility(originalIndex)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors">
                          + Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {experience.responsibilities.map((resp, respIndex) => (
                          <div key={respIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Key responsibility or achievement"
                              value={resp}
                              onChange={(e) => updateResponsibility(originalIndex, respIndex, e.target.value)}
                            />
                            <button onClick={() => removeResponsibility(originalIndex, respIndex)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                        {experience.responsibilities.length === 0 && <p className="text-slate-500 text-sm italic">No responsibilities added yet.</p>}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-medium text-slate-400">Technologies & Tools</label>
                        <button onClick={() => addTechnology(originalIndex)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors">
                          + Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {experience.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Technology, framework, or tool"
                              value={tech.name}
                              onChange={(e) => updateTechnology(originalIndex, techIndex, e.target.value)}
                            />
                            <button onClick={() => removeTechnology(originalIndex, techIndex)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                        {experience.technologies.length === 0 && <p className="text-slate-500 text-sm italic">No technologies added yet.</p>}
                      </div>
                    </div>

                    {/* Metadata Viewer - Show separation between relational vs metadata */}
                    <div>
                      <MetadataViewer
                        metadata={{
                          relationalData: {
                            id: experience.id,
                            title: experience.title,
                            company: experience.company,
                            location: experience.location,
                            current: experience.current,
                            technologies: experience.technologies.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
                          },
                          jsonStoredData: {
                            responsibilities: experience.responsibilities || [],
                            description: experience.description ? experience.description.substring(0, 100) + "..." : "",
                          },
                          flexibleMetadata: experience.metadata || {},
                          urls: {
                            companyUrl: experience.companyUrl,
                            logoUrl: experience.logoUrl,
                          },
                          timeline: {
                            startDate: experience.startDate,
                            endDate: experience.endDate,
                            period: `${experience.startDate} - ${experience.current ? "Present" : experience.endDate || ""}`,
                          },
                        }}
                        title="Experience Data Architecture"
                        className="mt-4"
                      />

                      {/* Info about data storage strategy */}
                      <div className="mt-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                        <h6 className="text-xs font-semibold text-blue-400 mb-2">Data Storage Strategy:</h6>
                        <div className="text-xs space-y-1 text-slate-300">
                          <div>
                            • <span className="text-green-400">Relational Tables</span>: ID, title, company, technologies (indexed for search)
                          </div>
                          <div>
                            • <span className="text-yellow-400">JSON Columns</span>: responsibilities, metadata (flexible data)
                          </div>
                          <div>
                            • <span className="text-purple-400">Many-to-Many</span>: experience_technologies table (optimal for queries)
                          </div>
                        </div>
                      </div>
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
                        {savedIndex === originalIndex && (
                          <span className="text-green-400 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Tersimpan!
                          </span>
                        )}
                        <button
                          onClick={() => saveOneExperience(originalIndex)}
                          disabled={savingIndex === originalIndex}
                          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors ${savingIndex === originalIndex
                            ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                            }`}
                        >
                          {savingIndex === originalIndex ? (
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
                              {!experience.id || experience.id === 0 ? 'Simpan Experience Baru' : 'Simpan Perubahan'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Experience"
        itemName={deleteTargetIndex !== null && experiences[deleteTargetIndex] ? experiences[deleteTargetIndex].company || 'New Experience' : ''}
        onConfirm={confirmDeleteExperience}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTargetIndex(null);
        }}
        isDeleting={isDeleting}
      />
    </div >
  );
}
