import React, { memo } from "react";
import { AttendanceStatus } from "@/app/actions/attendance";

interface CellProps {
  employeeId: string;
  dateStr: string;
  status: AttendanceStatus;
  isHoliday: boolean;
  isLocked: boolean;
  onMark: (empId: string, date: string) => void;
}

const AttendanceCell = memo(function AttendanceCell({
  employeeId,
  dateStr,
  status,
  isHoliday,
  isLocked,
  onMark,
}: CellProps) {
  if (isHoliday) {
    return (
      <div className="w-full h-12 flex items-center justify-center text-xs font-bold text-purple-400 select-none bg-purple-50/50">
        HOLIDAY
      </div>
    );
  }

  const getStatusDisplay = (s: AttendanceStatus) => {
    switch (s) {
      case "present":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">
            P
          </span>
        );
      case "absent":
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
            A
          </span>
        );
      case "half_day":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold text-sm">
            HD
          </span>
        );
      default:
        return <span className="text-gray-300 text-sm">NM</span>;
    }
  };

  return (
    <button
      onClick={() => onMark(employeeId, dateStr)}
      disabled={isLocked}
      className={`w-full h-12 flex items-center justify-center rounded transition-all touch-manipulation 
        ${isLocked ? "cursor-not-allowed bg-gray-50" : "hover:bg-gray-100 active:scale-95"}`}
    >
      {getStatusDisplay(status)}
    </button>
  );
});

export default AttendanceCell;
