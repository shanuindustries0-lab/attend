"use client";

import { useState } from "react";
import { markHoliday, removeHoliday } from "@/app/actions/holidays";
import { formatShortDate } from "@/lib/dateUtils";

interface Props {
  dateStr: string;
  existingHoliday?: { title: string; description: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function HolidayDialog({
  dateStr,
  existingHoliday,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState(existingHoliday?.title || "");
  const [description, setDescription] = useState(
    existingHoliday?.description || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (
      !window.confirm(
        `Are you sure you want to mark ${formatShortDate(dateStr)} as a holiday?`,
      )
    )
      return;
    setIsSubmitting(true);
    const result = await markHoliday(dateStr, title, description);
    if (result.success) onSuccess();
    else {
      alert(result.error);
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (
      !window.confirm(`Remove holiday status for ${formatShortDate(dateStr)}?`)
    )
      return;
    setIsSubmitting(true);
    const result = await removeHoliday(dateStr);
    if (result.success) onSuccess();
    else {
      alert(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Holiday: {formatShortDate(dateStr)}
        </h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Holiday Name (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500"
              placeholder="e.g. Diwali"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          {existingHoliday ? (
            <button
              onClick={handleRemove}
              disabled={isSubmitting}
              className="text-red-600 text-sm font-medium hover:underline"
            >
              Remove Holiday
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Holiday
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
