import { createClient } from "@/lib/supabase/server";
import AttendanceClientWrapper from "./AttendanceClientWrapper";

// In Next.js 15, searchParams must be awaited
export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Establish the anchor date (Either from URL parameter or Today)
  let anchorDate = new Date();
  if (params.date) {
    const parsed = new Date(params.date);
    if (!isNaN(parsed.getTime())) anchorDate = parsed;
  }

  // 2. Calculate the exact Monday to Sunday range for the selected date
  const day = anchorDate.getDay() || 7; // Convert Sunday (0) to 7
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() - day + 1);

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    // Avoid timezone drift by extracting exact local YYYY-MM-DD
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  });

  const weekStartDate = weekDates[0];
  const weekEndDate = weekDates[6];

  // 3. Fetch all relational data for THIS specific week
  const [
    { data: employees },
    { data: attendanceData },
    { data: holidayData },
    { data: lockData },
  ] = await Promise.all([
    // FIX: Added daily_salary to this select statement
    supabase
      .from("employees")
      .select("id, name_en, name_hi, employee_code, daily_salary")
      .eq("is_active", true)
      .order("name_en"),
    supabase
      .from("attendance")
      .select("*")
      .gte("attendance_date", weekStartDate)
      .lte("attendance_date", weekEndDate),
    supabase
      .from("holidays")
      .select("*")
      .gte("holiday_date", weekStartDate)
      .lte("holiday_date", weekEndDate),
    supabase
      .from("attendance_locks")
      .select("is_locked")
      .eq("week_start_date", weekStartDate)
      .single(),
  ]);

  // 4. Format the dictionaries for the client
  const initialAttendance: Record<string, any> = {};
  attendanceData?.forEach((record) => {
    initialAttendance[`${record.employee_id}_${record.attendance_date}`] =
      record.status;
  });

  const holidays: Record<string, any> = {};
  holidayData?.forEach((record) => {
    holidays[record.holiday_date] = {
      title: record.title,
      description: record.description,
    };
  });

  const isLocked = lockData?.is_locked || false;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Weekly Attendance Review
      </h1>
      <AttendanceClientWrapper
        weekDates={weekDates}
        employees={employees || []}
        initialAttendance={initialAttendance}
        holidays={holidays}
        initialIsLocked={isLocked}
      />
    </div>
  );
}
