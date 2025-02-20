import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProductsTable } from "@/components/products/ProductsTable"
import { NewProductButton } from "@/components/products/NewProductButton"
import { ManageCategoriesButton } from "@/components/products/ManageCategoriesButton"
import { Product } from "@/types"

type Category = {
  id: string
  name: string
}

type Subcategory = {
  id: string
  name: string
  parent_id: string
}

export default async function ProductsPage() {
  const supabase = await createClient()

  // Fetch products with category and subcategory data
  const { data: productsData } = await supabase
    .from("products")
    .select(`
      *,
      category:categories!category_id(id, name),
      subcategory:categories!subcategory_id(id, name)
    `)
    .order("name", { ascending: true })

  // Fetch categories (parent categories only)
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .is("parent_id", null)
    .eq("is_deleted", false)
    .order("name", { ascending: true })

  // Fetch subcategories
  const { data: subcategoriesData } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .not("parent_id", "is", null)
    .eq("is_deleted", false)
    .order("name", { ascending: true })

  // Ensure we have arrays even if the queries return null
  const products = (productsData ?? []) as Product[]
  const categories = (categoriesData ?? []) as Category[]
  const subcategories = (subcategoriesData ?? []) as Subcategory[]

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Products"
        description="Manage your warehouse products"
      >
        <div className="flex gap-2">
          <NewProductButton />
          <ManageCategoriesButton />
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