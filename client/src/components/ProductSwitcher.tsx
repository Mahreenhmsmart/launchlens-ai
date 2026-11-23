import { useState } from 'react';
import { Package, ChevronDown, Plus, Pencil, Check } from 'lucide-react';
import { Button, Card, Field, Input, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setActiveProduct, editProduct } from '@/store/slices/productsSlice';
import type { SharedProduct, UpdateProductRequest } from '@/types';
import { roundTwo } from '@/utils/currency';
import { useNavigate } from 'react-router-dom';

interface ProductSwitcherProps {
  className?: string;
}

const MARKETS = [
  'Pakistan', 'USA', 'UK', 'UAE', 'Saudi Arabia',
  'India', 'Canada', 'Australia', 'Germany', 'Other',
];

export default function ProductSwitcher({ className }: ProductSwitcherProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, activeProductId } = useAppSelector((s) => s.products);
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SharedProduct | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateProductRequest>({});

  const activeProduct = items.find((p) => p._id === activeProductId) || null;

  const handleSelect = (id: string) => {
    dispatch(setActiveProduct(id));
    setIsOpen(false);
  };

  const handleEdit = (product: SharedProduct) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      sellingPrice: product.sellingPrice,
      productCost: product.productCost,
      deliveryCost: product.deliveryCost,
      otherCosts: product.otherCosts,
      adBudget: product.adBudget,
      expectedOrders: product.expectedOrders,
      market: product.market,
      category: product.category,
    });
    setShowEditModal(true);
    setIsOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    dispatch(editProduct({ id: editingProduct._id, data: editForm }));
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleAddNew = () => {
    navigate('/products');
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={cn('relative', className)}
        data-icod-id="src_components_productswitcher_tsx_9b69">
        {/* Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
          data-icod-id="src_components_productswitcher_tsx_7ec7">
          <Package
            className="h-4 w-4 text-primary"
            data-icod-id="src_components_productswitcher_tsx_7ae5" />
          <span
            className="flex-1 truncate text-left font-medium text-foreground"
            data-icod-id="src_components_productswitcher_tsx_75a9">
            {activeProduct?.name || 'Select a product'}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
            data-icod-id="src_components_productswitcher_tsx_0fb7" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
            data-icod-id="src_components_productswitcher_tsx_f504">
            {items.map((product) => (
              <div
                key={product._id}
                className="group flex items-center gap-2 border-b border-border/50 px-3 py-2 last:border-0 hover:bg-muted"
                data-icod-id={`src_components_productswitcher_tsx_0208_${product._id}`}>
                <button
                  onClick={() => handleSelect(product._id)}
                  className="flex flex-1 items-center gap-2 text-left"
                  data-icod-id={`src_components_productswitcher_tsx_5655_${product._id}`}>
                  {product._id === activeProductId && <Check
                    className="h-3.5 w-3.5 text-primary"
                    data-icod-id={`src_components_productswitcher_tsx_4aac_${product._id}`} />}
                  <span
                    className={cn(
                      'truncate text-sm',
                      product._id === activeProductId ? 'font-semibold text-foreground' : 'text-foreground pl-5.5'
                    )}
                    data-icod-id={`src_components_productswitcher_tsx_16af_${product._id}`}>
                    {product.name}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  data-icod-id={`src_components_productswitcher_tsx_8296_${product._id}`}>
                  <Pencil
                    className="h-3 w-3"
                    data-icod-id={`src_components_productswitcher_tsx_2bd5_${product._id}`} />
                </Button>
              </div>
            ))}
            {items.length < 2 && (
              <button
                onClick={handleAddNew}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                data-icod-id="src_components_productswitcher_tsx_447d">
                <Plus
                  className="h-4 w-4"
                  data-icod-id="src_components_productswitcher_tsx_2988" />
                Add Product
              </button>
            )}
          </div>
        )}
      </div>
      {/* Edit Product Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit: ${editingProduct?.name || ''}`}
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_components_productswitcher_tsx_1367">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditModal(false)}
              data-icod-id="src_components_productswitcher_tsx_75e6">Cancel</Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              data-icod-id="src_components_productswitcher_tsx_65d1">Save Changes</Button>
          </div>
        }
        data-icod-id="src_components_productswitcher_tsx_2ac3">
        <div
          className="space-y-3"
          data-icod-id="src_components_productswitcher_tsx_2954">
          <Field
            label="Product Name"
            htmlFor="edit-name"
            data-icod-id="src_components_productswitcher_tsx_3851">
            <Input
              id="edit-name"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              data-icod-id="src_components_productswitcher_tsx_c5ed" />
          </Field>
          <div
            className="grid gap-3 sm:grid-cols-2"
            data-icod-id="src_components_productswitcher_tsx_e83b">
            <Field
              label="Selling Price (PKR)"
              htmlFor="edit-price"
              data-icod-id="src_components_productswitcher_tsx_6ced">
              <Input
                id="edit-price"
                type="number"
                min="0"
                value={editForm.sellingPrice ?? ''}
                onChange={(e) => setEditForm({ ...editForm, sellingPrice: roundTwo(parseFloat(e.target.value) || 0) })}
                data-icod-id="src_components_productswitcher_tsx_af92" />
            </Field>
            <Field
              label="Product Cost (PKR)"
              htmlFor="edit-cost"
              data-icod-id="src_components_productswitcher_tsx_4532">
              <Input
                id="edit-cost"
                type="number"
                min="0"
                value={editForm.productCost ?? ''}
                onChange={(e) => setEditForm({ ...editForm, productCost: roundTwo(parseFloat(e.target.value) || 0) })}
                data-icod-id="src_components_productswitcher_tsx_b986" />
            </Field>
          </div>
          <div
            className="grid gap-3 sm:grid-cols-2"
            data-icod-id="src_components_productswitcher_tsx_cdbf">
            <Field
              label="Delivery Cost (PKR)"
              htmlFor="edit-delivery"
              data-icod-id="src_components_productswitcher_tsx_7901">
              <Input
                id="edit-delivery"
                type="number"
                min="0"
                value={editForm.deliveryCost ?? ''}
                onChange={(e) => setEditForm({ ...editForm, deliveryCost: roundTwo(parseFloat(e.target.value) || 0) })}
                data-icod-id="src_components_productswitcher_tsx_dd11" />
            </Field>
            <Field
              label="Other Costs (PKR)"
              htmlFor="edit-other"
              data-icod-id="src_components_productswitcher_tsx_1426">
              <Input
                id="edit-other"
                type="number"
                min="0"
                value={editForm.otherCosts ?? ''}
                onChange={(e) => setEditForm({ ...editForm, otherCosts: roundTwo(parseFloat(e.target.value) || 0) })}
                data-icod-id="src_components_productswitcher_tsx_37fe" />
            </Field>
          </div>
          <div
            className="grid gap-3 sm:grid-cols-2"
            data-icod-id="src_components_productswitcher_tsx_d091">
            <Field
              label="Ad Budget (PKR)"
              htmlFor="edit-ad"
              data-icod-id="src_components_productswitcher_tsx_ad63">
              <Input
                id="edit-ad"
                type="number"
                min="0"
                value={editForm.adBudget ?? ''}
                onChange={(e) => setEditForm({ ...editForm, adBudget: roundTwo(parseFloat(e.target.value) || 0) })}
                data-icod-id="src_components_productswitcher_tsx_1442" />
            </Field>
            <Field
              label="Expected Orders"
              htmlFor="edit-orders"
              data-icod-id="src_components_productswitcher_tsx_b18f">
              <Input
                id="edit-orders"
                type="number"
                min="0"
                value={editForm.expectedOrders ?? ''}
                onChange={(e) => setEditForm({ ...editForm, expectedOrders: Math.round(parseFloat(e.target.value) || 0) })}
                data-icod-id="src_components_productswitcher_tsx_19eb" />
            </Field>
          </div>
          <Field
            label="Market"
            htmlFor="edit-market"
            data-icod-id="src_components_productswitcher_tsx_2952">
            <select
              id="edit-market"
              value={editForm.market || 'Pakistan'}
              onChange={(e) => setEditForm({ ...editForm, market: e.target.value })}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              data-icod-id="src_components_productswitcher_tsx_a1c4">
              {MARKETS.map((m) => (
                <option
                  key={m}
                  value={m}
                  data-icod-id={`src_components_productswitcher_tsx_85d4_${m}`}>{m}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Category"
            htmlFor="edit-category"
            data-icod-id="src_components_productswitcher_tsx_category_field">
            <select
              id="edit-category"
              value={editForm.category || 'Skincare'}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              data-icod-id="src_components_productswitcher_tsx_category_select">
              {['Skincare', 'Beauty', 'Home', 'Fashion', 'Accessories', 'Gadgets', 'Pets', 'Lifestyle'].map((c) => (
                <option
                  key={c}
                  value={c}
                  data-icod-id={`src_components_productswitcher_tsx_453a_${c}`}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </>
  );
}
