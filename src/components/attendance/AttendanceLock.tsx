"use client";

import { useState } from "react";
import { toggleAttendanceLock as toggleLock } from "@/app/actions/locks";
import { formatShortDate } from "@/lib/dateUtils";

interface Props {
  weekStartDate: string;
  initialIsLocked: boolean;
  onLockChange: (isLocked: boolean) => void;
}

export default function AttendanceLock({
  weekStartDate,
  initialIsLocked,
  onLockChange,
}: Props) {
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    if (
      isLocked &&
      !window.confirm(
        "Unlock this week? Edits will be enabled and this action will be audited.",
      )
    )
      return;
    if (
      !isLocked &&
      !window.confirm(
        "Lock this week? Normal attendance editing will be disabled.",
      )
    )
      return;

    setIsSubmitting(true);
    const newStatus = !isLocked;

    setIsLocked(newStatus);
    onLockChange(newStatus);

    const result = await toggleLock(weekStartDate, newStatus);
    if (!result.success) {
      setIsLocked(!newStatus);
      onLockChange(!newStatus);
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-4 rounded-lg border transition-colors ${isLocked ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}
    >
      <div>
        <p className="text-sm font-semibold text-gray-700">
          Week of {formatShortDate(weekStartDate)}
        </p>
        <p
          className={`text-xs font-bold uppercase tracking-wider ${isLocked ? "text-amber-700" : "text-gray-500"}`}
        >
          Attendance: {isLocked ? "LOCKED" : "UNLOCKED"}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isSubmitting}
        className={`px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50 ${isLocked ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}`}
      >
        {isLocked ? "Unlock Week" : "Lock Week"}
      </button>
    </div>
  );
}
