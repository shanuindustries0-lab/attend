import { createClient } from "@/lib/supabase/server";

export default async function WeeklyPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Establish the anchor date (Either from URL parameter or Today)
  let anchorDate = new Date();
  if (params.date) {
    const parsed = new Date(params.date);
    if (!isNaN(parsed.getTime())) anchorDate = parsed;
  }

  // 2. Calculate the exact Monday to Sunday range
  const day = anchorDate.getDay() || 7;
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() - day + 1);

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  });

  const weekStartDate = weekDates[0];
  const weekEndDate = weekDates[6];

  // 3. Fetch Data for the week
  const [
    { data: employees },
    { data: attendanceData },
    { data: holidayData },
    { data: paymentData },
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name_en, name_hi, daily_salary")
      .eq("is_active", true)
      .order("name_en"),
    supabase
      .from("attendance")
      .select("*")
      .gte("attendance_date", weekStartDate)
      .lte("attendance_date", weekEndDate),
    supabase
      .from("holidays")
      .select("*")
      .gte("holiday_date", weekStartDate)
      .lte("holiday_date", weekEndDate),
    supabase
      .from("payments")
      .select("*")
      .eq("start_date", weekStartDate)
      .eq("end_date", weekEndDate),
  ]);

  // 4. Organize Data Mappings
  const holidays: Record<string, boolean> = {};
  holidayData?.forEach((h) => {
    holidays[h.holiday_date] = true;
  });

  const initialAttendance: Record<string, string> = {};
  attendanceData?.forEach((record) => {
    initialAttendance[`${record.employee_id}_${record.attendance_date}`] =
      record.status;
  });

  const paidMap: Record<string, boolean> = {};
  paymentData?.forEach((p) => {
    paidMap[p.employee_id] = true;
  });

  // 5. Calculate Totals (Only workers with >0 pay)
  let totalPaid = 0;
  let totalRemaining = 0;

  const payrollRows =
    employees?.map((emp) => {
      let presentCount = 0;
      let halfDayCount = 0;

      weekDates.forEach((date) => {
        if (!holidays[date]) {
          const status = initialAttendance[`${emp.id}_${date}`];
          if (status === "present") presentCount++;
          if (status === "half_day") halfDayCount++;
        }
      });

      const dailySalary = Number(emp.daily_salary) || 0;
      const weeklyPay =
        presentCount * dailySalary + halfDayCount * (dailySalary / 2);
      const isPaid = paidMap[emp.id] || false;

      if (weeklyPay > 0) {
        if (isPaid) {
          totalPaid += weeklyPay;
        } else {
          totalRemaining += weeklyPay;
        }
      }

      return { ...emp, weeklyPay, isPaid };
    }) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          Total Weekly Payroll
        </h1>
        <div className="text-sm text-gray-500 font-medium">
          {new Date(weekStartDate).toLocaleDateString("en-GB")} -{" "}
          {new Date(weekEndDate).toLocaleDateString("en-GB")}
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-1">
            Total Paid
          </h2>
          <p className="text-3xl font-bold text-green-900">
            ₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">
            Remaining (Unpaid)
          </h2>
          <p className="text-3xl font-bold text-amber-900">
            ₹
            {totalRemaining.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">
            Grand Total
          </h2>
          <p className="text-3xl font-bold text-blue-900">
            ₹
            {(totalPaid + totalRemaining).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Employee
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Weekly Pay
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payrollRows
              .filter((r) => r.weeklyPay > 0) // Only show workers who earned money this week
              .map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {emp.name_en}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {emp.name_hi}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    ₹
                    {emp.weeklyPay.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {emp.isPaid ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        UNPAID
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
