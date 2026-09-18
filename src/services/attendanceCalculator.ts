import { AttendanceStatus } from "@/app/actions/attendance";

export type DailyRecord = {
  date: string;
  status: AttendanceStatus;
  isHoliday: boolean;
  isFuture: boolean;
  holidayName?: string;
};

export type WeeklyReportData = {
  present: number;
  absent: number;
  halfDay: number;
  notMarked: number;
  holidays: number;
  workingDays: number;
  attendancePercentage: string;
  dailyBreakdown: DailyRecord[];
};

export function calculateWeeklyAttendance(
  weekDates: string[],
  attendanceMap: Record<string, AttendanceStatus>, 
  currentDateStr: string,
): WeeklyReportData {
  const report: WeeklyReportData = {
    present: 0,
    absent: 0,
    halfDay: 0,
    notMarked: 0,
    holidays: 0,
    workingDays: 0,
    attendancePercentage: "N/A",
    dailyBreakdown: [],
  };

  for (const date of weekDates) {
    const isFuture = date > currentDateStr;
    const isHoliday = !!holidayMap[date];
    const rawStatus = attendanceMap[date] || "not_marked";

    report.dailyBreakdown.push({
      date,
      status: rawStatus,
      isHoliday,
      isFuture,
      holidayName: holidayMap[date]?.title,
    });

    if (isHoliday) {
      report.holidays++;
      continue;
    }

    if (isFuture) continue;

    report.workingDays++;

    if (rawStatus === "present") report.present++;
    else if (rawStatus === "absent") report.absent++;
    else if (rawStatus === "half_day") report.halfDay++;
    else if (rawStatus === "not_marked") report.notMarked++;
  }

  if (report.workingDays > 0) {
    const calculatedValue =
      ((report.present + report.halfDay * 0.5) / report.workingDays) * 100;
    report.attendancePercentage = `${calculatedValue.toFixed(2)}%`;
  }

  return report;
}
