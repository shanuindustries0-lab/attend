"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  markDailyStatus,
  toggleDailyHoliday,
} from "@/app/actions/dailyAttendance";

type Employee = {
  id: string;
  name_en: string;
  name_hi: string;
  category_id: string;
  category_name: string;
  employee_code?: string;
};
type Category = { id: string; name_en: string };

interface Props {
  selectedDate: string;
  employees: Employee[];
  categories: Category[];
  initialAttendance: Record<string, string>;
  isHolidayInitially: boolean;
}

export default function DailyAttendanceClient({
  selectedDate,
  employees,
  categories,
  initialAttendance,
  isHolidayInitially,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [attendance, setAttendance] =
    useState<Record<string, string>>(initialAttendance);
  const [isHoliday, setIsHoliday] = useState(isHolidayInitially);

  const handleHolidayToggle = async () => {
    const newVal = !isHoliday;
    setIsHoliday(newVal); // Optimistic UI update
    await toggleDailyHoliday(selectedDate, newVal);
  };

  const handleMark = async (empId: string, status: string) => {
    const newStatus = attendance[empId] === status ? "not_marked" : status;
    setAttendance((prev) => ({ ...prev, [empId]: newStatus }));
    await markDailyStatus(empId, selectedDate, newStatus);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name_en.toLowerCase().includes(search.toLowerCase()) ||
        emp.name_hi.includes(search) ||
        (emp.employee_code &&
          emp.employee_code.toLowerCase().includes(search.toLowerCase()));
      return (
        matchesSearch &&
        (categoryFilter === "all" || emp.category_id === categoryFilter)
      );
    });
  }, [employees, search, categoryFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between">
        {/* DATE PICKER & HOLIDAY BUTTON */}
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              e.target.value &&
              router.push(`/attendance?date=${e.target.value}`)
            }
            className="p-2 border rounded outline-none focus:border-blue-500"
          />

          <button
            onClick={handleHolidayToggle}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
              isHoliday
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent"
            }`}
          >
            {isHoliday ? "★ Marked as Holiday" : "Mark as Holiday"}
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en}
              </option>
            ))}
          </select>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full p-2 border rounded outline-none focus:border-blue-500"
            />
            {showSuggestions &&
              search.length >= 2 &&
              filteredEmployees.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                  {filteredEmployees.slice(0, 5).map((emp) => (
                    <li
                      key={emp.id}
                      className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      onMouseDown={() => {
                        setSearch(emp.name_en);
                        setShowSuggestions(false);
                      }}
                    >
                      {emp.name_en}{" "}
                      {emp.employee_code && `(${emp.employee_code})`}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </div>

      {/* ATTENDANCE GRID */}
      <div className="bg-white rounded-lg shadow-sm border divide-y">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className={`flex flex-col sm:flex-row justify-between p-4 gap-4 transition-all ${isHoliday ? "bg-purple-50/40 opacity-70" : "hover:bg-gray-50"}`}
          >
            <div>
              <div className="font-medium text-gray-900">{emp.name_en}</div>
              <div className="text-xs text-gray-500">
                {emp.name_hi} • {emp.category_name}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isHoliday}
                onClick={() => handleMark(emp.id, "present")}
                className={`px-6 py-2 rounded font-bold text-sm transition-colors ${attendance[emp.id] === "present" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} ${isHoliday ? "cursor-not-allowed opacity-50" : ""}`}
              >
                P
              </button>
              <button
                disabled={isHoliday}
                onClick={() => handleMark(emp.id, "half_day")}
                className={`px-6 py-2 rounded font-bold text-sm transition-colors ${attendance[emp.id] === "half_day" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} ${isHoliday ? "cursor-not-allowed opacity-50" : ""}`}
              >
                HD
              </button>
              <button
                disabled={isHoliday}
                onClick={() => handleMark(emp.id, "absent")}
                className={`px-6 py-2 rounded font-bold text-sm transition-colors ${attendance[emp.id] === "absent" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} ${isHoliday ? "cursor-not-allowed opacity-50" : ""}`}
              >
                AB
              </button>
            </div>
          </div>
        ))}
        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No employees found.
          </div>
        )}
      </div>
    </div>
  );
}
