import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Category, getCategories, createCategory, updateCategory, deleteCategory } from "../services/content";
import ConfirmActionModal from "../components/ConfirmActionModal";

interface ExtendedCategory extends Category {
  description?: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
}

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", parentId: null as number | null });
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);
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

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await api.get("/categories");


      // Check if the data has the expected structure
      const responseData = response.data;
      if (!responseData) {

        setError("Invalid response format from server");
        return;
      }

      // The data might be in response.data.data or directly in response.data
      let categoriesData = [];
      if (responseData.data && Array.isArray(responseData.data)) {
        categoriesData = responseData.data;
      } else if (Array.isArray(responseData)) {
        categoriesData = responseData;
      } else {

        setError("Unexpected data structure in response");
        return;
      }



      // Ensure all categories have the necessary properties for ExtendedCategory
      const extendedCategories = categoriesData.map((cat: any) => ({
        ...cat,
        createdAt: cat.createdAt || cat.created_at || new Date().toISOString(),
        updatedAt: cat.updatedAt || cat.updated_at || new Date().toISOString(),
      }));


      setCategories(extendedCategories);
      setError(null);
    } catch (err: any) {

      setError(`Failed to load categories: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Create new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setModalOpen(false);
    setConfirmModal({
      isOpen: true,
      title: "Create Category",
      message: `Are you sure you want to create category "${newCategory.name}"?`,
      type: "success",
      confirmText: "Create",
      action: async () => {
        try {
          setLoading(true);
          const response = await api.post("/categories", newCategory);
          setNewCategory({ name: "", description: "", parentId: null });
          await fetchCategories();
          if (response.data && response.data.id) {
            setHighlightedId(response.data.id);
            hideHighlight();
          }
          setError(null);
        } catch (err) {
          setError("Failed to create category. Please try again.");
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Update existing category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) return;

    const catId = editingCategory.id;
    setModalOpen(false);
    setConfirmModal({
      isOpen: true,
      title: "Update Category",
      message: `Are you sure you want to update category "${editingCategory.name}"?`,
      type: "primary",
      confirmText: "Update",
      action: async () => {
        try {
          setLoading(true);
          await api.put(`/categories/${catId}`, editingCategory);
          setEditingCategory(null);
          await fetchCategories();
          setHighlightedId(catId);
          hideHighlight();
          setError(null);
        } catch (err) {
          setError("Failed to update category. Please try again.");
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Delete a category
  const handleDeleteCategory = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Category",
      message: `Are you sure you want to delete category "${name}"? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      action: async () => {
        try {
          setLoading(true);
          await api.delete(`/categories/${id}`);
          await fetchCategories();
          setError(null);
        } catch (err) {
          setError("Failed to delete category. Please try again.");
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Open modal for editing
  const openEditModal = (category: ExtendedCategory) => {
    setEditingCategory({ ...category });
    setModalOpen(true);
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingCategory(null);
    setNewCategory({ name: "", description: "", parentId: null });
    setModalOpen(true);
  };

  // Get parent category name
  const getParentCategoryName = (parentId: number | undefined | null) => {
    if (!parentId) return "-";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "-";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Category Management</h1>
        <button onClick={openCreateModal} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-200">
          Add New Category
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading && !modalOpen && !confirmModal.isOpen ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No categories found. Create your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-500 ${highlightedId === category.id ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{category.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{category.description || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getParentCategoryName(category.parentId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(category)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 focus:outline-none">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteCategory(category.id, category.name)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 focus:outline-none">
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
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingCategory ? "Edit Category" : "Create New Category"}</h2>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editingCategory ? editingCategory.name : newCategory.name}
                  onChange={(e) => (editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCategory({ ...newCategory, name: e.target.value }))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={editingCategory ? editingCategory.description || "" : newCategory.description}
                  onChange={(e) => (editingCategory ? setEditingCategory({ ...editingCategory, description: e.target.value }) : setNewCategory({ ...newCategory, description: e.target.value }))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="parentId">
                  Parent Category (Optional)
                </label>
                <select
                  id="parentId"
                  value={editingCategory ? editingCategory.parentId || "" : newCategory.parentId || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    if (editingCategory) {
                      setEditingCategory({ ...editingCategory, parentId: value || undefined });
                    } else {
                      setNewCategory({ ...newCategory, parentId: value });
                    }
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">None</option>
                  {categories
                    .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center">
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {editingCategory ? "Update Category" : "Create Category"}
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

export default CategoriesManager;
