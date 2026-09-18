import { createClient } from "@/lib/supabase/server";
import DailyAttendanceClient from "@/components/attendance/DailyAttendanceClient";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // Default to today in IST timezone if no date is selected
  const selectedDate =
    params.date ||
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  // Fetch all necessary data for the day
  const [
    { data: employees },
    { data: categories },
    { data: attendanceRecords },
    { data: holidayRecord },
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("*")
      .eq("is_active", true)
      .order("name_en"),
    supabase.from("categories").select("*").order("name_en"),
    supabase
      .from("attendance")
      .select("employee_id, status")
      .eq("attendance_date", selectedDate),
    supabase
      .from("holidays")
      .select("holiday_date")
      .eq("holiday_date", selectedDate)
      .single(),
  ]);

  // Map categories to employees
  const categoryMap: Record<string, string> = {};
  categories?.forEach((c) => {
    categoryMap[c.id] = c.name_en;
  });

  const mappedEmployees = (employees || []).map((emp) => ({
    ...emp,
    category_name: categoryMap[emp.category_id] || "Unknown",
  }));

  // Map existing attendance for the UI
  const initialAttendance: Record<string, string> = {};
  attendanceRecords?.forEach((record) => {
    initialAttendance[record.employee_id] = record.status;
  });

  // Check if today is marked as a global holiday
  const isHolidayInitially = !!holidayRecord;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Daily Attendance
      </h1>
      <DailyAttendanceClient
        selectedDate={selectedDate}
        employees={mappedEmployees}
        categories={categories || []}
        initialAttendance={initialAttendance}
        isHolidayInitially={isHolidayInitially}
      />
    </div>
  );
}
