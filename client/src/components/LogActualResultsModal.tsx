import { useState } from 'react';
import { Button, Field, Input, Modal } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';
import type { ProfitActualEntry } from '@/types';

interface LogActualResultsModalProps {
  open: boolean;
  onClose: () => void;
  analysisId: string;
  analysisName: string;
  productCost: number;
  otherCosts: number;
  onSave: (entry: ProfitActualEntry) => void;
}

export default function LogActualResultsModal({
  open,
  onClose,
  analysisId,
  analysisName,
  productCost,
  otherCosts,
  onSave,
}: LogActualResultsModalProps) {
  const { t } = useTranslation();

  const [ordersDelivered, setOrdersDelivered] = useState<string>('');
  const [ordersReturned, setOrdersReturned] = useState<string>('');
  const [revenueReceived, setRevenueReceived] = useState<string>('');
  const [adSpent, setAdSpent] = useState<string>('');
  const [deliveryCostPaid, setDeliveryCostPaid] = useState<string>('');

  const resetForm = () => {
    setOrdersDelivered('');
    setOrdersReturned('');
    setRevenueReceived('');
    setAdSpent('');
    setDeliveryCostPaid('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const delivered = Number(ordersDelivered) || 0;
    const returned = Number(ordersReturned) || 0;
    const revenue = Number(revenueReceived) || 0;
    const ad = Number(adSpent) || 0;
    const delivery = Number(deliveryCostPaid) || 0;

    const actualProfit = revenue - (delivered * productCost) - delivery - (delivered * otherCosts) - ad;
    const actualRoas = ad > 0 ? revenue / ad : null;
    const totalOrders = delivered + returned;
    const actualDeliveryRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0;

    const entry: ProfitActualEntry = {
      id: `actual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      analysisId,
      dateLogged: new Date().toISOString(),
      ordersDelivered: delivered,
      ordersReturned: returned,
      revenueReceived: revenue,
      adSpent: ad,
      deliveryCostPaid: delivery,
      actualProfit,
      actualRoas,
      actualDeliveryRate,
    };

    onSave(entry);
    resetForm();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`${t('Log Actual Results')} — ${analysisName}`}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            data-icod-id="src_components_logactualresultsmodal_tsx_eaa8">
            {t('Cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            data-icod-id="src_components_logactualresultsmodal_tsx_06de">
            {t('Save')}
          </Button>
        </>
      }
      data-icod-id="src_components_logactualresultsmodal_tsx_2dee">
      <div
        className="grid gap-4 sm:grid-cols-2"
        data-icod-id="src_components_logactualresultsmodal_tsx_419f">
        <Field
          label={t('Orders Delivered')}
          htmlFor="orders-delivered"
          required
          data-icod-id="src_components_logactualresultsmodal_tsx_7d77">
          <Input
            id="orders-delivered"
            type="number"
            min="0"
            value={ordersDelivered}
            onChange={(e) => setOrdersDelivered(e.target.value)}
            placeholder="0"
            data-icod-id="src_components_logactualresultsmodal_tsx_941a" />
        </Field>
        <Field
          label={t('Orders Returned')}
          htmlFor="orders-returned"
          required
          data-icod-id="src_components_logactualresultsmodal_tsx_626c">
          <Input
            id="orders-returned"
            type="number"
            min="0"
            value={ordersReturned}
            onChange={(e) => setOrdersReturned(e.target.value)}
            placeholder="0"
            data-icod-id="src_components_logactualresultsmodal_tsx_9af6" />
        </Field>
        <Field
          label={`${t('Revenue Received')} (PKR)`}
          htmlFor="revenue-received"
          required
          data-icod-id="src_components_logactualresultsmodal_tsx_892c">
          <Input
            id="revenue-received"
            type="number"
            min="0"
            value={revenueReceived}
            onChange={(e) => setRevenueReceived(e.target.value)}
            placeholder="0"
            data-icod-id="src_components_logactualresultsmodal_tsx_2e28" />
        </Field>
        <Field
          label={`${t('Ad Spend')} (PKR)`}
          htmlFor="ad-spent"
          required
          data-icod-id="src_components_logactualresultsmodal_tsx_e2a9">
          <Input
            id="ad-spent"
            type="number"
            min="0"
            value={adSpent}
            onChange={(e) => setAdSpent(e.target.value)}
            placeholder="0"
            data-icod-id="src_components_logactualresultsmodal_tsx_3d8a" />
        </Field>
        <Field
          label={`${t('Delivery Cost Paid')} (PKR)`}
          htmlFor="delivery-cost"
          required
          data-icod-id="src_components_logactualresultsmodal_tsx_9688">
          <Input
            id="delivery-cost"
            type="number"
            min="0"
            value={deliveryCostPaid}
            onChange={(e) => setDeliveryCostPaid(e.target.value)}
            placeholder="0"
            data-icod-id="src_components_logactualresultsmodal_tsx_6152" />
        </Field>
      </div>
    </Modal>
  );
}
