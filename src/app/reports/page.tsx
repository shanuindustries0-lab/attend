import { createClient } from "@/lib/supabase/server";
import ReportsDashboard from "@/components/reports/ReportsDashboard";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Determine Start and End Dates (URL params or Current Week default)
  let startDateStr = params.start;
  let endDateStr = params.end;

  if (!startDateStr || !endDateStr) {
    const today = new Date();
    const day = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Format securely to YYYY-MM-DD
    startDateStr = new Date(
      monday.getTime() - monday.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .split("T")[0];
    endDateStr = new Date(sunday.getTime() - sunday.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  }

  // 2. Generate an array of all dates between start and end
  const rangeDates: string[] = [];
  const currDate = new Date(`${startDateStr}T12:00:00Z`);
  const lastDate = new Date(`${endDateStr}T12:00:00Z`);

  while (currDate <= lastDate) {
    rangeDates.push(currDate.toISOString().split("T")[0]);
    currDate.setDate(currDate.getDate() + 1);
  }

  // 3. Fetch Data for this exact range
  const [
    { data: employees },
    { data: categories },
    { data: attendanceData },
    { data: holidays },
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("*")
      .eq("is_active", true)
      .order("name_en"),
    supabase.from("categories").select("*").order("name_en"),
    supabase
      .from("attendance")
      .select("*")
      .gte("attendance_date", startDateStr)
      .lte("attendance_date", endDateStr),
    supabase
      .from("holidays")
      .select("*")
      .gte("holiday_date", startDateStr)
      .lte("holiday_date", endDateStr),
  ]);

  const categoryMap: Record<string, string> = {};
  categories?.forEach((c) => {
    categoryMap[c.id] = c.name_en;
  });

  const mappedEmployees = (employees || []).map((emp) => ({
    ...emp,
    category_name: categoryMap[emp.category_id] || "Unknown Category",
  }));

  return (
    <div>
      <ReportsDashboard
        rangeDates={rangeDates}
        employees={mappedEmployees}
        categories={categories || []}
        attendanceData={attendanceData || []}
        holidays={holidays || []}
      />
    </div>
  );
}
