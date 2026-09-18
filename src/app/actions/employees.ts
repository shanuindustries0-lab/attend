"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEmployee(formData: FormData) {
  const supabase = await createClient();

  const name_en = formData.get("name_en") as string;
  const name_hi = formData.get("name_hi") as string;
  const category_id = formData.get("category_id") as string;
  const employee_code = formData.get("employee_code") as string;
  const joining_date = formData.get("joining_date") as string;
  const daily_salary = Number(formData.get("daily_salary")) || 0; // New salary field

  const { error } = await supabase.from("employees").insert({
    name_en,
    name_hi,
    category_id,
    employee_code: employee_code || null,
    joining_date,
    daily_salary,
    is_active: true,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/employees");
  revalidatePath("/weekly-review");
  return { success: true };
}

export async function updateEmployeeSalary(
  employeeId: string,
  newSalary: number,
) {
  const supabase = await createClient();
  await supabase
    .from("employees")
    .update({ daily_salary: newSalary })
    .eq("id", employeeId);

  revalidatePath("/employees");
  revalidatePath("/weekly-review");
  revalidatePath("/reports");
}
