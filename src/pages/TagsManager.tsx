import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Tag, getTags, createTag, updateTag, deleteTag } from "../services/content";
import ConfirmActionModal from "../components/ConfirmActionModal";

interface ExtendedTag extends Tag {
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const TagsManager: React.FC = () => {
  const [tags, setTags] = useState<ExtendedTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({ name: "", description: "" });
  const [editingTag, setEditingTag] = useState<ExtendedTag | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "primary" as "primary" | "danger" | "success",
    confirmText: "Confirm",
    action: () => { }
  });

  const hideHighlight = () => setTimeout(() => setHighlightedId(null), 2000);

  // Fetch all tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tags");
      const tagsData = response.data.data || [];
      // Ensure all tags have the necessary properties for ExtendedTag
      const extendedTags = tagsData.map((tag: any) => ({
        ...tag,
        createdAt: tag.createdAt || tag.created_at || new Date().toISOString(),
        updatedAt: tag.updatedAt || tag.updated_at || new Date().toISOString(),
      }));
      setTags(extendedTags);
      setError(null);
    } catch (err) {

      setError("Failed to load tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTags();
  }, []);

  // Create new tag
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    setModalOpen(false);
    setConfirmModal({
      isOpen: true,
      title: "Create Tag",
      message: `Are you sure you want to create tag "${newTag.name}"?`,
      type: "success",
      confirmText: "Create",
      action: async () => {
        try {
          setLoading(true);
          const response = await api.post("/tags", newTag);
          setNewTag({ name: "", description: "" });
          await fetchTags();
          if (response.data && response.data.data && response.data.data.id) {
            setHighlightedId(response.data.data.id);
            hideHighlight();
          } else if (response.data && response.data.id) {
            setHighlightedId(response.data.id);
            hideHighlight();
          }
          setError(null);
        } catch (err) {
          setError("Failed to create tag. Please try again.");
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Update existing tag
  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag?.name?.trim()) return;

    const tagId = editingTag.id;
    setModalOpen(false);
    setConfirmModal({
      isOpen: true,
      title: "Update Tag",
      message: `Are you sure you want to update tag "${editingTag.name}"?`,
      type: "primary",
      confirmText: "Update",
      action: async () => {
        try {
          setLoading(true);
          await api.put(`/tags/${tagId}`, editingTag);
          setEditingTag(null);
          await fetchTags();
          setHighlightedId(tagId);
          hideHighlight();
          setError(null);
        } catch (err) {
          setError("Failed to update tag. Please try again.");
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Delete a tag
  const handleDeleteTag = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Tag",
      message: `Are you sure you want to delete tag "${name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      action: async () => {
        try {
          setLoading(true);
          await api.delete(`/tags/${id}`);
          await fetchTags();
          setError(null);
        } catch (err) {
          setError("Failed to delete tag. Please try again.");
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Open modal for editing
  const openEditModal = (tag: ExtendedTag) => {
    setEditingTag({ ...tag });
    setModalOpen(true);
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingTag(null);
    setNewTag({ name: "", description: "" });
    setModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tag Management</h1>
        <button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-200">
          Add New Tag
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading && !modalOpen && !confirmModal.isOpen ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No tags found. Create your first tag!
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-500 ${highlightedId === tag.id ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{tag.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tag.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{tag.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{tag.description || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(tag.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(tag)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 focus:outline-none">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteTag(tag.id, tag.name)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 focus:outline-none">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingTag ? "Edit Tag" : "Create New Tag"}</h2>
            <form onSubmit={editingTag ? handleUpdateTag : handleCreateTag}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editingTag ? editingTag.name : newTag.name}
                  onChange={(e) => (editingTag ? setEditingTag({ ...editingTag, name: e.target.value }) : setNewTag({ ...newTag, name: e.target.value }))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={editingTag ? editingTag.description || "" : newTag.description}
                  onChange={(e) => (editingTag ? setEditingTag({ ...editingTag, description: e.target.value }) : setNewTag({ ...newTag, description: e.target.value }))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center">
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {editingTag ? "Update Tag" : "Create Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        actionType={confirmModal.type}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isLoading={loading}
      />
    </div>
  );
};

export default TagsManager;
