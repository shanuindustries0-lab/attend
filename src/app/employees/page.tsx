import { createClient } from "@/lib/supabase/server";
import EmployeeManager from "@/components/employees/EmployeeManager";

export default async function EmployeesPage() {
  const supabase = await createClient();

  // Fetch both employees and categories in parallel for speed
  const [{ data: employees }, { data: categories }] = await Promise.all([
    supabase.from("employees").select("*").order("name_en"),
    supabase.from("categories").select("*").order("name_en"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Manage Employees
      </h1>
      <EmployeeManager
        initialEmployees={employees || []}
        categories={categories || []}
      />
    </div>
  );
}
