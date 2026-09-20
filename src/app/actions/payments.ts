"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function markAsPaid(
  employeeId: string,
  startDate: string,
  endDate: string,
  amount: number,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").upsert(
    {
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate,
      amount,
    },
    { onConflict: "employee_id, start_date, end_date" },
  );

  return { success: !error, error: error?.message };
}



export async function checkPaymentStatus(
  employeeIds: string[],
  startDate: string,
  endDate: string,
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("employee_id")
    .in("employee_id", employeeIds)
    .eq("start_date", startDate)
    .eq("end_date", endDate);

  const paidMap: Record<string, boolean> = {};
  data?.forEach((p) => {
    paidMap[p.employee_id] = true;
  });
  return paidMap;
}

export async function unmarkAsPaid(
  empId: string,
  startDate: string,
  endDate: string,
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Use the renamed admin client which accepts the URL and Key arguments
    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);

   const { error } = await supabase
     .from("payments")
     .delete()
     .eq("employee_id", empId)
     .eq("start_date", startDate)
     .eq("end_date", endDate);

    if (error) throw error;
    return { success: true };
  } catch (e) {
    const error = e as Error; 
    console.error("Unmark error:", error);
    return { success: false, error: error.message };
  }
}
