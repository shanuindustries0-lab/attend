"use client";

import { useState } from "react";
import { createCategory, updateCategory } from "@/app/actions/categories";

type Category = {
  id: string;
  name_en: string;
  name_hi: string;
  is_active: boolean;
};

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newEnName, setNewEnName] = useState("");
  const [newHiName, setNewHiName] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnNameBlur = async () => {
    if (newEnName && !newHiName) {
      const { suggestHindiTransliteration } =
        await import("@/app/actions/transliteration");
      const suggestion = await suggestHindiTransliteration(newEnName);
      if (suggestion) setNewHiName(suggestion);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnName || !newHiName) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const result = await createCategory(newEnName, newHiName);
    if (result.success && result.data) {
      setCategories([...categories, result.data]);
      setNewEnName("");
      setNewHiName("");
      setStatusMessage({
        type: "success",
        text: "Category created successfully.",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: result.error || "Failed to create category.",
      });
    }
    setIsSubmitting(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === id ? { ...cat, is_active: !currentStatus } : cat,
    );
    setCategories(updatedCategories);

    const result = await updateCategory(id, { is_active: !currentStatus });
    if (!result.success) {
      setCategories(categories);
      setStatusMessage({
        type: "error",
        text: "Failed to update category status. Retry.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Manage Categories
      </h2>

      <form
        onSubmit={handleCreate}
        className="flex flex-col md:flex-row gap-4 mb-8 items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name (English)
          </label>
          <input
            type="text"
            value={newEnName}
            onChange={(e) => setNewEnName(e.target.value)}
            onBlur={handleEnNameBlur}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name (Hindi)
          </label>
          <input
            type="text"
            value={newHiName}
            onChange={(e) => setNewHiName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-hindi"
            required
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "+ Add Category"}
        </button>
      </form>

      {statusMessage && (
        <div
          className={`p-3 mb-6 rounded text-sm ${statusMessage.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center justify-between p-4 border rounded-md transition-colors ${category.is_active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200 opacity-75"}`}
          >
            <div>
              <p className="font-medium text-gray-900">{category.name_en}</p>
              <p className="text-sm text-gray-500 font-hindi">
                {category.name_hi}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs px-2 py-1 rounded-full ${category.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}
              >
                {category.is_active ? "Active" : "Disabled"}
              </span>
              <button
                onClick={() =>
                  handleToggleActive(category.id, category.is_active)
                }
                className={`text-sm font-medium ${category.is_active ? "text-red-600 hover:text-red-800" : "text-blue-600 hover:text-blue-800"}`}
              >
                {category.is_active ? "Disable" : "Restore"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
