"use client";

import { useState, useMemo } from "react";
import AttendanceLock from "@/components/attendance/AttendanceLock";
import AttendanceGrid from "@/components/attendance/AttendanceGrid";
import AttendanceControls from "@/components/attendance/AttendanceControls";
import { AttendanceStatus } from "@/app/actions/attendance";
interface Props {
  weekDates: string[];
  employees: any[];
  initialAttendance: Record<string, AttendanceStatus>;
  holidays: Record<string, { title: string; description: string }>;
  initialIsLocked: boolean;
}

export default function AttendanceClientWrapper({
  weekDates,
  employees,
  initialAttendance,
  holidays,
  initialIsLocked,
}: Props) {
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [searchQuery, setSearchQuery] = useState("");

  // Instantly filter the 1,000+ employees without hitting the database
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;

    const lowerQuery = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name_en.toLowerCase().includes(lowerQuery) ||
        emp.name_hi.includes(searchQuery) ||
        (emp.employee_code &&
          emp.employee_code.toLowerCase().includes(lowerQuery)),
    );
  }, [employees, searchQuery]);

  return (
    <div className="space-y-4">
      <AttendanceControls
        currentStartDate={weekDates[0]}
        onSearchChange={setSearchQuery}
        employees={employees}
      />

      <AttendanceLock
        weekStartDate={weekDates[0]}
        initialIsLocked={isLocked}
        onLockChange={setIsLocked}
      />

      <AttendanceGrid
        weekDates={weekDates}
        employees={filteredEmployees}
        initialAttendance={initialAttendance}
        holidays={holidays}
        isLocked={isLocked}
      />
    </div>
  );
}
