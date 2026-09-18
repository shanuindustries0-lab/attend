import { createClient } from "@/lib/supabase/server";
import CategoryManager from "@/components/categories/CategoryManager";

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Fetch initial data securely on the server
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <CategoryManager initialCategories={categories || []} />
    </div>
  );
}
