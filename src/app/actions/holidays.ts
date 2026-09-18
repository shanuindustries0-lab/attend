"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "./audit";
import { revalidatePath } from "next/cache";

export async function markHoliday(
  dateStr: string,
  title?: string,
  description?: string,
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("holidays")
      .upsert(
        { holiday_date: dateStr, title, description },
        { onConflict: "holiday_date" },
      )
      .select()
      .single();

    if (error) throw error;
    await logAudit("MARK_HOLIDAY", "holiday", data.id, null, data);
    revalidatePath("/attendance");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to mark holiday." };
  }
}

export async function removeHoliday(dateStr: string) {
  try {
    const supabase = await createClient();
    const { data: oldData } = await supabase
      .from("holidays")
      .select("id, title")
      .eq("holiday_date", dateStr)
      .single();
    if (!oldData) return { success: true };

    const { error } = await supabase
      .from("holidays")
      .delete()
      .eq("holiday_date", dateStr);
    if (error) throw error;

    await logAudit("REMOVE_HOLIDAY", "holiday", oldData.id, oldData, null);
    revalidatePath("/attendance");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove holiday." };
  }
}
