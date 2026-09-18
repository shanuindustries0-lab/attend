"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmployeeReportCard from "./EmployeeReportCard";
import { calculateWeeklyAttendance } from "@/services/attendanceCalculator";
import { AttendanceStatus } from "@/app/actions/attendance";

type Category = { id: string; name_en: string; name_hi: string };
type Employee = {
  id: string;
  name_en: string;
  name_hi: string;
  category_id: string;
  employee_code?: string;
  category_name: string;
  daily_salary?: number;
};
type AttendanceRecord = {
  employee_id: string;
  attendance_date: string;
  status: AttendanceStatus;
};
type HolidayRecord = {
  holiday_date: string;
  title: string;
  description: string;
};

interface Props {
  rangeDates: string[];
  employees: Employee[];
  categories: Category[];
  attendanceData: AttendanceRecord[];
  holidays: HolidayRecord[];
}

export default function ReportsDashboard({
  rangeDates,
  employees,
  categories,
  attendanceData,
  holidays,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");

  const startDate = rangeDates[0];
  const endDate = rangeDates[rangeDates.length - 1];

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (!value) return;
    const newStart = type === "start" ? value : startDate;
    const newEnd = type === "end" ? value : endDate;
    router.push(`/reports?start=${newStart}&end=${newEnd}`);
  };

  const filteredEmployees = useMemo(() => {
    if (selectedCategoryId === "all") return employees;
    return employees.filter((emp) => emp.category_id === selectedCategoryId);
  }, [employees, selectedCategoryId]);

  useEffect(() => {
    if (filteredEmployees.length > 0) {
      setSelectedEmpId(filteredEmployees[0].id);
    } else {
      setSelectedEmpId("");
    }
  }, [filteredEmployees]);

  const holidayMap = useMemo(() => {
    const map: Record<string, { title: string }> = {};
    holidays.forEach((h) => {
      map[h.holiday_date] = { title: h.title };
    });
    return map;
  }, [holidays]);

  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    attendanceData.forEach((a) => {
      map[`${a.employee_id}_${a.attendance_date}`] = a.status;
    });
    return map;
  }, [attendanceData]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  const reportData = useMemo(() => {
    if (!selectedEmployee) return null;

    const empAttendance: Record<string, AttendanceStatus> = {};
    rangeDates.forEach((date) => {
      const key = `${selectedEmployee.id}_${date}`;
      if (attendanceMap[key]) empAttendance[date] = attendanceMap[key];
    });

    const currentKolkataDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    return calculateWeeklyAttendance(
      rangeDates,
      empAttendance,
      holidayMap,
      currentKolkataDate,
    );
  }, [selectedEmployee, rangeDates, attendanceMap, holidayMap]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col lg:flex-row items-center gap-6 justify-between">
        {/* Date Range Selectors */}
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="w-full lg:w-40">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm"
            />
          </div>
          <div className="w-full lg:w-40">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm"
            />
          </div>
        </div>

        {/* Employee & Category Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Filter Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-72">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              disabled={filteredEmployees.length === 0}
            >
              {filteredEmployees.length === 0 ? (
                <option value="">No employees found</option>
              ) : (
                filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name_en}{" "}
                    {emp.employee_code ? `(${emp.employee_code})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {selectedEmployee && reportData ? (
        <EmployeeReportCard
          employee={selectedEmployee}
          rangeDates={rangeDates} // Update prop name in EmployeeReportCard if necessary
          reportData={reportData}
        />
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No employee selected or data unavailable.
        </div>
      )}
    </div>
  );
}
