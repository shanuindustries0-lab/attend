"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "./audit";
import { revalidatePath } from "next/cache";

export async function createCategory(nameEn: string, nameHi: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({ name_en: nameEn, name_hi: nameHi })
      .select()
      .single();

    if (error) throw error;

    await logAudit("CREATE_CATEGORY", "category", data.id, null, data);
    revalidatePath("/categories");

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: "Failed to create category. Please try again.",
    };
  }
}

export async function updateCategory(
  id: string,
  updates: { name_en?: string; name_hi?: string; is_active?: boolean },
) {
  try {
    const supabase = await createClient();
    const { data: oldData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logAudit(
      updates.is_active === false ? "DISABLE_CATEGORY" : "UPDATE_CATEGORY",
      "category",
      id,
      oldData,
      data,
    );
    revalidatePath("/categories");

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to update category." };
  }
}
