'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { SelectField } from "@/components/ui/select-field"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { 
  Loader2, 
  Upload, 
  X, 
  Link as LinkIcon, 
  Trash2,
  Package,
  DollarSign,
  Boxes,
  Tags,
  Tag,
  Save,
  XCircle
} from "lucide-react"

interface ProductEditPanelProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  subcategories: string[]
}

export function ProductEditPanel({
  product,
  open,
  onOpenChange,
  categories,
  subcategories,
}: ProductEditPanelProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnlimitedStock, setHasUnlimitedStock] = useState(product.stock === -1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url)
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock === -1 ? 0 : product.stock,
    category: product.category,
    subcategory: product.subcategory || "",
    image_url: product.image_url || "",
  })

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error("Please upload an image file.")
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB.")
      }

      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, image_url: "" }))
    } catch (error) {
      toast.error("Invalid Image", {
        description: error instanceof Error ? error.message : "Invalid image file"
      })
    }
  }

  const handleImageUrl = (url: string) => {
    try {
      new URL(url)
      setFormData(prev => ({ ...prev, image_url: url }))
      setImagePreview(url)
      setImageFile(null)
    } catch {
      toast.error("Invalid URL", {
        description: "Please enter a valid image URL"
      })
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: "" }))
  }

  const uploadImage = async (file: File) => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    const { error } = await supabase.storage
      .from('products')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const deleteImage = async (imageUrl: string) => {
    const imagePath = imageUrl.split('/').pop()
    if (!imagePath) return

    const supabase = createClient()
    await supabase.storage
      .from('products')
      .remove([`product-images/${imagePath}`])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to edit products.")
      }

      let finalImageUrl = formData.image_url

      if (imageMethod === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile)
        if (product.image_url) {
          await deleteImage(product.image_url)
        }
      }

      await supabase
        .from("products")
        .update({
          ...formData,
          image_url: finalImageUrl,
          stock: hasUnlimitedStock ? -1 : formData.stock,
          last_edited_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)
        .throwOnError()

      toast.success("Success", {
        description: "Product updated successfully."
      })

      router.refresh()
      onOpenChange(false)

    } catch (error) {
      console.error("Edit error:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to update product."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (product.image_url) {
        await deleteImage(product.image_url)
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)

      if (error) throw error

      toast.success("Success", {
        description: "Product deleted successfully."
      })

      router.refresh()
      onOpenChange(false)

    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Error", {
        description: "Failed to delete product. Please try again."
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Edit Product</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <form id="editForm" onSubmit={handleSubmit} className="space-y-4 py-4">
              <FormField
                id="name"
                name="name"
                label="Name"
                icon={Package}
                value={formData.name}
                onChange={e => handleInputChange("name", e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="price"
                  name="price"
                  label="Price"
                  icon={DollarSign}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => handleInputChange("price", Number(e.target.value))}
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      id="unlimited-stock"
                      checked={hasUnlimitedStock}
                      onCheckedChange={setHasUnlimitedStock}
                    />
                    <Label htmlFor="unlimited-stock">Unlimited Stock</Label>
                  </div>
                  <FormField
                    id="stock"
                    name="stock"
                    icon={Boxes}
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => handleInputChange("stock", Number(e.target.value))}
                    required
                    disabled={hasUnlimitedStock} label={""}                />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Category"
                  icon={Tags}
                  value={formData.category}
                  onValueChange={value => handleInputChange("category", value)}
                  placeholder="Select category"
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                  required
                />

                <SelectField
                  label="Subcategory"
                  icon={Tag}
                  value={formData.subcategory}
                  onValueChange={value => handleInputChange("subcategory", value)}
                  placeholder="Select subcategory"
                  options={subcategories.map(sub => ({ value: sub, label: sub }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Product Image</Label>
                <Tabs 
                  value={imageMethod} 
                  onValueChange={(value: string) => setImageMethod(value as "upload" | "url")} 
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Image URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer w-full rounded-md border border-input px-3 py-2"
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-4">
                    <FormField
                      type="url"
                      label="Image URL"
                      placeholder="Paste image URL here"
                      value={formData.image_url}
                      onChange={(e) => handleImageUrl(e.target.value)}
                      icon={LinkIcon}
                    />
                  </TabsContent>
                </Tabs>

                {imagePreview && (
                  <div className="mt-4">
                    <div className="relative aspect-square w-40 overflow-hidden rounded-lg border">
                      <Image
                        src={imagePreview}
                        alt={formData.name}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" form="editForm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" type="button" disabled={isLoading} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Product</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this product? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}