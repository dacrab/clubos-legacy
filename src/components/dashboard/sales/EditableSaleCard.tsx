"use client";

import { Trash2, Edit3, Save, X } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import type { Sale, Product } from "@/types/sales";
import { logger } from "@/lib/utils/logger";

interface EditableSaleCardProps {
  sale: Sale;
  onEdit: (id: string, updatedSale: Partial<Sale>) => void;
  onDelete: (id: string) => void;
}

export default function EditableSaleCard({ sale, onEdit, onDelete }: EditableSaleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedSale, setEditedSale] = useState({
    quantity: sale.quantity,
    productId: sale.productId,
    isTreat: sale.isTreat,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && products.length === 0) {
      loadProducts();
    }
  }, [isEditing, products.length]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      logger.error('Error loading products:', error);
      toast.error('Αποτυχία φόρτωσης προϊόντων');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedSale),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sale');
      }

      toast.success('Η πώληση ενημερώθηκε επιτυχώς');
      onEdit(sale.id, editedSale);
      setIsEditing(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      toast.error(`Αποτυχία ενημέρωσης πώλησης: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sale');
      }

      toast.success('Η πώληση διαγράφηκε επιτυχώς');
      onDelete(sale.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      toast.error(`Αποτυχία διαγραφής πώλησης: ${message}`);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const selectedProduct = products.find(p => p.id === editedSale.productId);
  const calculatedTotal = selectedProduct ? parseFloat(selectedProduct.price) * editedSale.quantity : 0;

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {sale.productName || 'Προϊόν'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {!isEditing ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ποσότητα:</span>
                <span>{sale.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Τιμή μονάδας:</span>
                <span>{formatPrice(parseFloat(sale.unitPrice))}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Σύνολο:</span>
                <span>{formatPrice(parseFloat(sale.totalPrice))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Τύπος:</span>
                <Badge variant={sale.isTreat ? "secondary" : "default"}>
                  {sale.isTreat ? "Κέρασμα" : "Κανονική πώληση"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Προϊόν</Label>
                  <Select
                    value={editedSale.productId}
                    onValueChange={(value) => setEditedSale(prev => ({ ...prev, productId: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλέξτε προϊόν" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - €{parseFloat(product.price).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Ποσότητα</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={editedSale.quantity}
                    onChange={(e) => setEditedSale(prev => ({ 
                      ...prev, 
                      quantity: parseInt(e.target.value) || 1 
                    }))}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTreat"
                  checked={editedSale.isTreat}
                  onCheckedChange={(checked) => setEditedSale(prev => ({ 
                    ...prev, 
                    isTreat: checked === true 
                  }))}
                  disabled={loading}
                />
                <Label htmlFor="isTreat">Κέρασμα</Label>
              </div>

              {selectedProduct && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Υπολογισμένο Σύνολο:</span>
                    <span className="font-semibold">€{calculatedTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Διαγραφή Πώλησης"
        description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την πώληση; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}