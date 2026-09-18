"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEmployee(formData: FormData) {
  const supabase = await createClient();

  const data = {
    name_en: formData.get("name_en"),
    name_hi: formData.get("name_hi"),
    category_id: formData.get("category_id"),
    employee_code: formData.get("employee_code") || null,
    daily_salary: Number(formData.get("daily_salary")),
    joining_date: formData.get("joining_date"),
    is_active: true,
  };

  try {
    const { error } = await supabase.from("employees").insert(data);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/weekly-review");
    revalidatePath("/employees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEmployeeSalary(
  employeeId: string,
  daily_salary: number,
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("employees")
      .update({ daily_salary })
      .eq("id", employeeId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/weekly-review");
    revalidatePath("/employees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEmployee(employeeId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/weekly-review");
    revalidatePath("/employees");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete employee:", error.message);
    return { success: false, error: error.message };
  }
}
