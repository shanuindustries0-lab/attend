"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link"; // Added Link import

interface Props {
  currentStartDate: string;
  onSearchChange: (query: string) => void;
  employees: { name_en: string; employee_code?: string }[];
}

export default function AttendanceControls({
  currentStartDate,
  onSearchChange,
  employees,
}: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const navigateWeek = (direction: "prev" | "next") => {
    const d = new Date(currentStartDate);
    d.setDate(d.getDate() + (direction === "prev" ? -7 : 7));
    const targetDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    router.push(`/weekly-review?date=${targetDate}`);
  };

  const handleDateJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) router.push(`/weekly-review?date=${e.target.value}`);
  };

  const suggestions = employees
    .filter(
      (emp) =>
        emp.name_en.toLowerCase().includes(searchInput.toLowerCase()) ||
        (emp.employee_code &&
          emp.employee_code.toLowerCase().includes(searchInput.toLowerCase())),
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Search Bar with Autocomplete Suggestions */}
      <div className="relative w-full md:w-1/3">
        <input
          type="text"
          placeholder="Search employee name or code..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {showSuggestions &&
          searchInput.length >= 2 &&
          suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((emp, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    setSearchInput(emp.name_en);
                    setShowSuggestions(false);
                  }}
                >
                  {emp.name_en}{" "}
                  {emp.employee_code && (
                    <span className="text-gray-400 text-xs ml-1">
                      ({emp.employee_code})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>

      {/* Time Navigation */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <button
          onClick={() => navigateWeek("prev")}
          className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          &larr; Prev Week
        </button>
        <input
          type="date"
          onChange={handleDateJump}
          title="Jump to a specific month or year"
          className="p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        />
        <button
          onClick={() => router.push("/weekly-review")}
          className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => navigateWeek("next")}
          className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          Next Week &rarr;
        </button>

        {/* NEW PAYROLL BUTTON */}
        <Link
          href={`/weekly-payroll?date=${currentStartDate}`}
          className="px-3 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors ml-2"
        >
          View Payroll Report
        </Link>
      </div>
    </div>
  );
}
