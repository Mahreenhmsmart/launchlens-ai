import { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Pencil,
  Copy,
  Trash2,
  Check,
  Plus,
} from 'lucide-react';
import { Button, Card, EmptyState, Modal, Input, Field } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatMultiplier } from '@/utils/currency';
import { calculateSimulation } from '@/utils/calculations';
import type { PageId } from '@/components/Sidebar';
import type { SharedProduct } from '@/types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setActiveProduct,
  renameProduct,
  duplicateProduct,
  removeProduct,
  addProduct,
} from '@/store/slices/productsSlice';
import { useTranslation } from '@/utils/i18n';

interface MyProductsProps {
  currency: string;
  onNavigate: (page: PageId) => void;
}

export default function MyProducts({ currency, onNavigate }: MyProductsProps) {
  const dispatch = useAppDispatch();
  const { items, activeProductId } = useAppSelector((s) => s.products);
  const { t } = useTranslation();

  // Rename modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<SharedProduct | null>(null);
  const [newName, setNewName] = useState('');

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSwitch = (id: string) => {
    dispatch(setActiveProduct(id));
  };

  const handleOpenRename = (product: SharedProduct) => {
    setRenameTarget(product);
    setNewName(product.name);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = () => {
    if (!renameTarget || !newName.trim()) return;
    dispatch(renameProduct({ id: renameTarget._id, name: newName.trim() }));
    setRenameModalOpen(false);
    setRenameTarget(null);
    setNewName('');
  };

  const handleDuplicate = (product: SharedProduct) => {
    dispatch(duplicateProduct(product));
  };

  const handleDeleteClick = (id: string) => {
    if (items.length <= 1) return;
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    dispatch(removeProduct(deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const handleAddProduct = () => {
    dispatch(addProduct({
      name: 'New Product',
      sellingPrice: 0,
      productCost: 0,
      deliveryCost: 0,
      otherCosts: 0,
      adBudget: 0,
      expectedOrders: 0,
      market: 'Pakistan',
      category: 'Skincare',
    }));
  };

  /** Compute key figures for a product using the same logic as the Simulator */
  const getProductMetrics = (product: SharedProduct) => {
    const results = calculateSimulation({
      productName: product.name,
      sellingPrice: product.sellingPrice,
      productCost: product.productCost,
      deliveryCost: product.deliveryCost,
      rtoShippingCost: 200,
      otherVariableCosts: product.otherCosts,
      advertisingBudget: product.adBudget,
      expectedOrders: product.expectedOrders,
      deliverySuccessRate: 75,
    });
    return {
      contributionPerOrder: results.contributionPerOrder,
      roas: results.roas,
    };
  };

  const isLastProduct = items.length <= 1;

  return (
    <div className="space-y-6" data-icod-id="src_pages_myproducts_tsx_root">
      {/* Header */}
      <div className="space-y-2" data-icod-id="src_pages_myproducts_tsx_header">
        <div className="flex items-center gap-4" data-icod-id="src_pages_myproducts_tsx_header_row">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('overview')}
            data-icod-id="src_pages_myproducts_tsx_back_btn">
            <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_myproducts_tsx_back_icon" />
          </Button>
          <div className="flex-1" data-icod-id="src_pages_myproducts_tsx_header_text">
            <h1 className="text-3xl font-bold text-foreground" data-icod-id="src_pages_myproducts_tsx_title">
              {t('My Products')}
            </h1>
            <p className="text-muted-foreground" data-icod-id="src_pages_myproducts_tsx_subtitle">
              {t('Manage your products — switch, rename, duplicate, or delete.')}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddProduct}
            className="gap-1.5"
            data-icod-id="src_pages_myproducts_tsx_add_btn">
            <Plus className="h-4 w-4" data-icod-id="src_pages_myproducts_tsx_add_icon" />
            {t('Add Product')}
          </Button>
        </div>
      </div>

      {/* Product List */}
      {items.length === 0 ? (
        <Card className="p-8" data-icod-id="src_pages_myproducts_tsx_empty_card">
          <EmptyState
            icon={Package}
            title={t('No products yet')}
            description={t('Add your first product to get started with simulations and analysis.')}
            action={
              <Button
                variant="primary"
                onClick={handleAddProduct}
                data-icod-id="src_pages_myproducts_tsx_empty_add_btn">
                {t('Add Product')}
              </Button>
            }
            data-icod-id="src_pages_myproducts_tsx_empty_state"
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-icod-id="src_pages_myproducts_tsx_grid">
          {items.map((product) => {
            const isActive = product._id === activeProductId;
            const metrics = getProductMetrics(product);
            const cannotDelete = isLastProduct;

            return (
              <Card
                key={product._id}
                className={cn(
                  'relative p-5 transition-all hover:shadow-md',
                  isActive && 'border-l-4 border-l-primary ring-1 ring-primary/30'
                )}
                data-icod-id={`src_pages_myproducts_tsx_card_${product._id}`}>
                {/* Active badge */}
                {isActive && (
                  <span
                    className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    data-icod-id={`src_pages_myproducts_tsx_active_badge_${product._id}`}>
                    <Check className="h-3 w-3" data-icod-id={`src_pages_myproducts_tsx_active_check_${product._id}`} />
                    {t('Current')}
                  </span>
                )}

                {/* Product name */}
                <h3
                  className={cn(
                    'mb-3 truncate pr-16 text-lg font-semibold text-foreground',
                    !isActive && 'pr-0'
                  )}
                  data-icod-id={`src_pages_myproducts_tsx_name_${product._id}`}>
                  {product.name}
                </h3>

                {/* Key figures */}
                <div className="mb-4 space-y-2" data-icod-id={`src_pages_myproducts_tsx_metrics_${product._id}`}>
                  <div className="flex justify-between text-sm" data-icod-id={`src_pages_myproducts_tsx_selling_price_${product._id}`}>
                    <span className="text-muted-foreground" data-icod-id={`src_pages_myproducts_tsx_sp_label_${product._id}`}>
                      {t('Selling Price')}:
                    </span>
                    <span className="font-medium text-foreground" data-icod-id={`src_pages_myproducts_tsx_sp_value_${product._id}`}>
                      {formatCurrency(product.sellingPrice, currency, { baseCurrency: 'PKR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm" data-icod-id={`src_pages_myproducts_tsx_product_cost_${product._id}`}>
                    <span className="text-muted-foreground" data-icod-id={`src_pages_myproducts_tsx_pc_label_${product._id}`}>
                      {t('Product Cost')}:
                    </span>
                    <span className="font-medium text-foreground" data-icod-id={`src_pages_myproducts_tsx_pc_value_${product._id}`}>
                      {formatCurrency(product.productCost, currency, { baseCurrency: 'PKR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm" data-icod-id={`src_pages_myproducts_tsx_contribution_${product._id}`}>
                    <span className="text-muted-foreground" data-icod-id={`src_pages_myproducts_tsx_cpo_label_${product._id}`}>
                      {t('Contribution / Order')}:
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        metrics.contributionPerOrder >= 0 ? 'text-success' : 'text-destructive'
                      )}
                      data-icod-id={`src_pages_myproducts_tsx_cpo_value_${product._id}`}>
                      {formatCurrency(metrics.contributionPerOrder, currency, { baseCurrency: 'PKR' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm" data-icod-id={`src_pages_myproducts_tsx_roas_${product._id}`}>
                    <span className="text-muted-foreground" data-icod-id={`src_pages_myproducts_tsx_roas_label_${product._id}`}>
                      ROAS:
                    </span>
                    <span className="font-medium text-foreground" data-icod-id={`src_pages_myproducts_tsx_roas_value_${product._id}`}>
                      {metrics.roas !== null ? formatMultiplier(metrics.roas) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-border/50 pt-3" data-icod-id={`src_pages_myproducts_tsx_actions_${product._id}`}>
                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitch(product._id)}
                      className="flex-1 gap-1"
                      data-icod-id={`src_pages_myproducts_tsx_switch_btn_${product._id}`}>
                      <Check className="h-3.5 w-3.5" data-icod-id={`src_pages_myproducts_tsx_switch_icon_${product._id}`} />
                      {t('Set as Current')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenRename(product)}
                    title={t('Rename')}
                    data-icod-id={`src_pages_myproducts_tsx_rename_btn_${product._id}`}>
                    <Pencil className="h-4 w-4" data-icod-id={`src_pages_myproducts_tsx_rename_icon_${product._id}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(product)}
                    title={t('Duplicate')}
                    data-icod-id={`src_pages_myproducts_tsx_dup_btn_${product._id}`}>
                    <Copy className="h-4 w-4" data-icod-id={`src_pages_myproducts_tsx_dup_icon_${product._id}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(product._id)}
                    disabled={cannotDelete}
                    title={cannotDelete ? t('You cannot delete the last remaining product.') : t('Delete Product')}
                    className={cn(cannotDelete && 'opacity-40')}
                    data-icod-id={`src_pages_myproducts_tsx_delete_btn_${product._id}`}>
                    <Trash2
                      className={cn('h-4 w-4', !cannotDelete && 'text-destructive')}
                      data-icod-id={`src_pages_myproducts_tsx_delete_icon_${product._id}`} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Rename Modal */}
      <Modal
        open={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={t('Rename')}
        footer={
          <div className="flex justify-end gap-2" data-icod-id="src_pages_myproducts_tsx_rename_footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRenameModalOpen(false)}
              data-icod-id="src_pages_myproducts_tsx_rename_cancel">
              {t('Cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmRename}
              disabled={!newName.trim()}
              data-icod-id="src_pages_myproducts_tsx_rename_save">
              {t('Save')}
            </Button>
          </div>
        }
        data-icod-id="src_pages_myproducts_tsx_rename_modal">
        <div className="space-y-3" data-icod-id="src_pages_myproducts_tsx_rename_body">
          <Field
            label={t('Product Name')}
            htmlFor="rename-product-name"
            data-icod-id="src_pages_myproducts_tsx_rename_field">
            <Input
              id="rename-product-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('Enter new name')}
              autoFocus
              data-icod-id="src_pages_myproducts_tsx_rename_input"
            />
          </Field>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title={t('Delete Product')}
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_myproducts_tsx_delete_footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              data-icod-id="src_pages_myproducts_tsx_delete_cancel">
              {t('Cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              data-icod-id="src_pages_myproducts_tsx_delete_confirm">
              {t('Delete')}
            </Button>
          </div>
        }
        data-icod-id="src_pages_myproducts_tsx_delete_modal">
        <p className="text-sm text-muted-foreground" data-icod-id="src_pages_myproducts_tsx_delete_text">
          {t('Are you sure you want to delete this product? This action cannot be undone.')}
        </p>
      </Modal>
    </div>
  );
}
