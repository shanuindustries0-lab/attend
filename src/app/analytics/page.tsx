import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsDashboard() {
  const supabase = await createClient();

  // Get date range for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDateStr = thirtyDaysAgo.toISOString().split("T")[0];
  const endDateStr = today.toISOString().split("T")[0];

  // Fetch all attendance for the last month
  const { data: attendanceData } = await supabase
    .from("attendance")
    .select("employee_id, status, employees(name_en)")
    .gte("attendance_date", startDateStr)
    .lte("attendance_date", endDateStr);

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDay = 0;
  const absenceLedger: Record<string, { name: string; count: number }> = {};

  attendanceData?.forEach((record) => {
    if (record.status === "present") totalPresent++;
    if (record.status === "half_day") totalHalfDay++;
    if (record.status === "absent") {
      totalAbsent++;

      // Track frequent absentees
      const empName = record.employees?.name_en || "Unknown";
      if (!absenceLedger[record.employee_id]) {
        absenceLedger[record.employee_id] = { name: empName, count: 0 };
      }
      absenceLedger[record.employee_id].count++;
    }
  });

  const totalRecords = totalPresent + totalAbsent + totalHalfDay;
  const attendanceRate =
    totalRecords > 0
      ? Math.round(((totalPresent + totalHalfDay * 0.5) / totalRecords) * 100)
      : 0;

  // Sort employees by highest absences
  const frequentAbsentees = Object.values(absenceLedger)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        30-Day Absenteeism Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 uppercase">
            Health Score
          </h2>
          <p
            className={`text-3xl font-bold mt-2 ${attendanceRate > 85 ? "text-green-600" : "text-amber-600"}`}
          >
            {attendanceRate}%
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-green-800 uppercase">
            Total Present
          </h2>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {totalPresent}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-yellow-800 uppercase">
            Half Days
          </h2>
          <p className="text-3xl font-bold text-yellow-900 mt-2">
            {totalHalfDay}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-bold text-red-800 uppercase">
            Total Absent
          </h2>
          <p className="text-3xl font-bold text-red-900 mt-2">{totalAbsent}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">
            High Risk: Top 5 Frequent Absentees
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {frequentAbsentees.length > 0 ? (
              frequentAbsentees.map((emp, idx) => (
                <tr key={idx} className="hover:bg-red-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    {emp.count} Days Missed
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-4 text-gray-500 text-center" colSpan={2}>
                  No absences recorded in the last 30 days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
