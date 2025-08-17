import { Plus, Edit, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '@/types/products';

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
}

export default function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: '',
  });

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset form when editing category changes
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        parentId: editingCategory.parentId || '',
      });
      setShowForm(true);
    } else {
      setFormData({
        name: '',
        description: '',
        parentId: '',
      });
    }
  }, [editingCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error fetching categories:', error);
      toast.error('Αποτυχία φόρτωσης κατηγοριών');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) {return;}

    setLoading(true);
    try {
      const categoryData = {
        ...formData,
        parentId: formData.parentId || null,
      };

      const endpoint = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      toast.success(editingCategory ? 'Η κατηγορία ενημερώθηκε επιτυχώς' : 'Η κατηγορία δημιουργήθηκε επιτυχώς');
      await fetchCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'Αποτυχία αποθήκευσης κατηγορίας');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) {return;}

    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      toast.success('Η κατηγορία διαγράφηκε επιτυχώς');
      await fetchCategories();
      setCategoryToDelete(null);
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error deleting category:', error);
      toast.error(error instanceof Error ? error.message : 'Αποτυχία διαγραφής κατηγορίας');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setShowForm(false);
  };

  const mainCategories = categories.filter(cat => !cat.parentId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Διαχείριση Κατηγοριών</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!showForm && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Κατηγορίες Προϊόντων</h3>
                <Button
                  onClick={() => setShowForm(true)}
                  disabled={loading}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Νέα Κατηγορία
                </Button>
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium">
                  {editingCategory ? 'Επεξεργασία Κατηγορίας' : 'Νέα Κατηγορία'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Όνομα *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Όνομα κατηγορίας"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentId">Γονική Κατηγορία</Label>
                    <Select
                      value={formData.parentId}
                      onValueChange={(value) => handleInputChange('parentId', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλέξτε γονική κατηγορία (προαιρετικό)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Κανένα (Κύρια κατηγορία)</SelectItem>
                        {mainCategories.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            disabled={editingCategory?.id === category.id}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Περιγραφή</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={loading}
                    placeholder="Περιγραφή κατηγορίας (προαιρετικό)"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Ακύρωση
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
                  </Button>
                </div>
              </form>
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Όνομα</TableHead>
                    <TableHead>Περιγραφή</TableHead>
                    <TableHead>Γονική Κατηγορία</TableHead>
                    <TableHead className="w-[100px]">Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Φόρτωση κατηγοριών...
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Δεν υπάρχουν κατηγορίες
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>
                          {category.parentId ? 
                            categories.find(c => c.id === category.parentId)?.name || 'Άγνωστη' 
                            : 'Κύρια κατηγορία'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setCategoryToDelete(category)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Διαγραφή Κατηγορίας"
        description={`Είστε σίγουρος ότι θέλετε να διαγράψετε την κατηγορία "${categoryToDelete?.name}";`}
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}