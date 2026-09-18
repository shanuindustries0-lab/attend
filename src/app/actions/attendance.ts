"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "./audit";

export type AttendanceStatus = "present" | "absent" | "half_day" | "not_marked";

export async function setAttendanceRecord(
  employeeId: string,
  dateStr: string,
  nextStatus: AttendanceStatus,
  expectedOldStatus: AttendanceStatus,
) {
  try {
    const supabase = await createClient();

    if (nextStatus === "not_marked") {
      const { error, count } = await supabase
        .from("attendance")
        .delete({ count: "exact" })
        .match({
          employee_id: employeeId,
          attendance_date: dateStr,
          status: expectedOldStatus,
        });

      if (error || count === 0) throw new Error("Conflict detected.");
      await logAudit(
        "REMOVE_ATTENDANCE",
        "attendance",
        employeeId,
        expectedOldStatus,
        "not_marked",
      );
      return { success: true };
    }

    if (expectedOldStatus === "not_marked") {
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          employee_id: employeeId,
          attendance_date: dateStr,
          status: nextStatus,
        })
        .select()
        .single();

      if (error) throw new Error("Conflict detected.");
      await logAudit(
        "MARK_ATTENDANCE",
        "attendance",
        data.id,
        "not_marked",
        nextStatus,
      );
      return { success: true, data };
    }

    const { data, error } = await supabase
      .from("attendance")
      .update({ status: nextStatus })
      .match({
        employee_id: employeeId,
        attendance_date: dateStr,
        status: expectedOldStatus,
      })
      .select()
      .single();

    if (error || !data) throw new Error("Conflict detected.");
    await logAudit(
      "UPDATE_ATTENDANCE",
      "attendance",
      data.id,
      expectedOldStatus,
      nextStatus,
    );
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        "Conflict detected: Another admin modified this record. Please refresh.",
    };
  }
}
