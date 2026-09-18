"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleDailyHoliday(date: string, isHoliday: boolean) {
  const supabase = await createClient();

  if (isHoliday) {
    // Add to holidays table
    await supabase.from("holidays").upsert(
      {
        holiday_date: date,
        title: "Company Holiday",
        description: "Marked via Daily Attendance",
      },
      { onConflict: "holiday_date" },
    );
  } else {
    // Remove from holidays table
    await supabase.from("holidays").delete().eq("holiday_date", date);
  }
}

export async function markDailyStatus(
  employeeId: string,
  date: string,
  status: string,
) {
  const supabase = await createClient();

  if (status === "not_marked") {
    await supabase
      .from("attendance")
      .delete()
      .match({ employee_id: employeeId, attendance_date: date });
  } else {
    await supabase.from("attendance").upsert(
      {
        employee_id: employeeId,
        attendance_date: date,
        status,
      },
      { onConflict: "employee_id, attendance_date" },
    );
  }
}
