"use client"; 
import { deleteEmployee } from "@/app/actions/employees";
import { useState } from "react";

export default function RemoveEmployeeButton({
  employeeId,
}: {
  employeeId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 1. Show the browser warning popup
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this employee? This action cannot be undone.",
    );

    // 2. If they click "OK", delete the employee
    if (confirmDelete) {
      setIsDeleting(true);
      const result = await deleteEmployee(employeeId);

      if (!result.success) {
        alert("Could not delete. " + result.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`px-3 py-1 text-sm font-medium text-white rounded-md transition-colors ${
        isDeleting
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700"
      }`}
    >
      {isDeleting ? "Removing..." : "Remove"}
    </button>
  );
}
