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
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"

interface NewProductSheetProps {
  categories: string[]
  subcategories: string[]
}

export function NewProductSheet({ categories, subcategories }: NewProductSheetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    subcategory: "",
    image_url: "",
  })

  const handleInputChange = (
    name: string,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file."
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image size should be less than 5MB."
      })
      return
    }

    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: "" }))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    const { error: uploadError, data } = await supabase
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add products."
      })
      setIsLoading(false)
      return
    }

    try {
      let imageUrl = ""

      // Upload image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      await supabase
        .from("products")
        .insert({
          ...formData,
          image_url: imageUrl,
          created_by: user.id,
          last_edited_by: user.id,
        })
        .throwOnError()

      toast({
        title: "Success",
        description: "Product added successfully."
      })

      router.refresh()
      setIsOpen(false)
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        subcategory: "",
        image_url: "",
      })
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Add error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product. Please try again."
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
                name="name"
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
                  name="price"
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
                  name="stock"
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
              <div className="flex flex-col gap-4">
                {imagePreview ? (
                  <div className="relative aspect-square w-40 overflow-hidden rounded-lg border">
                    <Image
                      src={imagePreview}
                      alt={formData.name}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full bg-background/80"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-dashed p-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload image
                        </span>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Product
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
} 