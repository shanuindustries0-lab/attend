"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Checks if a specific date is currently locked.
 * Returns true if locked, false if unlocked.
 */
export async function checkLockStatus(date: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("attendance_locks")
    .select("lock_date")
    .eq("lock_date", date)
    .single();

  return !!data;
}

/**
 * Toggles the lock status for a given date.
 */
export async function toggleAttendanceLock(date: string, isLocked: boolean) {
  const supabase = await createClient();

  try {
    if (isLocked) {
      // Lock the date by adding it to the database
      const { error } = await supabase
        .from("attendance_locks")
        .upsert({ lock_date: date }, { onConflict: "lock_date" });

      if (error) throw error;
    } else {
      // Unlock the date by removing it from the database
      const { error } = await supabase
        .from("attendance_locks")
        .delete()
        .eq("lock_date", date);

      if (error) throw error;
    }

    // Clear the Next.js cache for the attendance page to reflect the new lock status instantly
    revalidatePath("/attendance");

    return { success: true };
  } catch (error: any) {
    console.error("Lock Toggle Error:", error.message);
    return { success: false, error: error.message };
  }
}
