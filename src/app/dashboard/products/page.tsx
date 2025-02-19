import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProductsTable } from "@/components/products/ProductsTable"
import { NewProductSheet } from "@/components/products/NewProductSheet"
import { ManageCategoriesDialog } from "@/components/products/ManageCategoriesDialog"

export default async function ProductsPage() {
  const supabase = await createClient()

  // Fetch products with category and subcategory data
  const { data: products = [] } = await supabase
    .from("products")
    .select(`
      *,
      category:categories!category_id(id, name),
      subcategory:categories!subcategory_id(id, name)
    `)
    .order("name", { ascending: true })

  // Fetch categories (parent categories only)
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name")
    .is("parent_id", null)
    .eq("is_deleted", false)
    .order("name", { ascending: true })

  // Fetch subcategories
  const { data: subcategories = [] } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .not("parent_id", "is", null)
    .eq("is_deleted", false)
    .order("name", { ascending: true })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Products"
        description="Manage your warehouse products"
      >
        <div className="flex gap-2">
          <NewProductSheet 
            categories={categories.map(c => c.name)} 
            subcategories={subcategories.map(s => s.name)} 
          />
          <ManageCategoriesDialog 
            existingCategories={categories.map(c => c.name)} 
            existingSubcategories={subcategories.map(s => s.name)} 
          />
        </div>
      </DashboardHeader>
      <ProductsTable 
        products={products} 
        categories={categories}
        subcategories={subcategories}
      />
    </DashboardShell>
  )
} 