"use server";

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
