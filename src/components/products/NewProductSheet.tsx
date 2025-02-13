'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, Link as LinkIcon } from "lucide-react"

interface NewProductSheetProps {
  categories: string[]
  subcategories: string[]
}

const initialFormData = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  subcategory: "",
  image_url: "",
}

export function NewProductSheet({ categories, subcategories }: NewProductSheetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload")
  const [formData, setFormData] = useState(initialFormData)

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }))
    setImagePreview(url)
    setImageFile(null)
  }

  const validateImageUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error("Please upload an image file.")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size should be less than 5MB.")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateImage(file)
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, image_url: "" }))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid Image",
        description: error instanceof Error ? error.message : "Invalid image file"
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

    const { error: uploadError } = await supabase
      .storage
      .from('products')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase
      .storage
      .from('products')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setImageFile(null)
    setImagePreview(null)
    setImageMethod("upload")
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to add products.")
      }

      let finalImageUrl = formData.image_url

      if (imageMethod === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile)
      } else if (imageMethod === "url" && formData.image_url) {
        if (!validateImageUrl(formData.image_url)) {
          throw new Error("Please enter a valid image URL")
        }
      }

      await supabase
        .from("products")
        .insert({
          ...formData,
          image_url: finalImageUrl,
          created_by: user.id,
          last_edited_by: user.id,
        })
        .throwOnError()

      toast({
        title: "Success",
        description: "Product added successfully."
      })

      router.refresh()
      resetForm()
    } catch (error) {
      console.error("Add error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Product</Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Add New Product</SheetTitle>
            <SheetDescription>
              Add a new product to your warehouse inventory
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => handleInputChange("price", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={e => handleInputChange("stock", Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={value => handleInputChange("subcategory", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(subcategory => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <div className="flex flex-col gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="url" className="mt-4">
                  <div className="flex flex-col gap-4">
                    <Input
                      type="url"
                      placeholder="Paste image URL here"
                      value={formData.image_url}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {imagePreview && (
                <div className="mt-4">
                  <div className="relative aspect-square w-40 overflow-hidden rounded-lg border">
                    <Image
                      src={imagePreview}
                      alt={formData.name || "Product preview"}
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

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Product
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}