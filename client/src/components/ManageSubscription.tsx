import { useState } from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { changePlan, cancelSubscription, fetchCurrentSubscription } from '@/store/slices/subscriptionSlice';
import type { PlanType, BillingCycle } from '@/types';

interface ManageSubscriptionProps {
  open: boolean;
  onClose: () => void;
}

const PLAN_OPTIONS: { id: PlanType; name: string; monthlyPKR: number; yearlyPKR: number }[] = [
  { id: 'basic', name: 'Basic', monthlyPKR: 0, yearlyPKR: 0 },
  { id: 'standard', name: 'Standard', monthlyPKR: 1500, yearlyPKR: 14400 },
  { id: 'business', name: 'Business', monthlyPKR: 4000, yearlyPKR: 38400 },
];

function formatPKR(amount: number): string {
  if (amount === 0) return 'PKR 0';
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

export default function ManageSubscription({ open, onClose }: ManageSubscriptionProps) {
  const dispatch = useAppDispatch();
  const { subscription, status } = useAppSelector((s) => s.subscription);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<PlanType | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'basic';
  const currentCycle: BillingCycle = subscription?.billingCycle || 'monthly';

  const handleChangePlan = async (newPlan: PlanType) => {
    if (newPlan === currentPlan) return;
    setIsChangingPlan(true);
    setChangeError(null);
    try {
      await dispatch(changePlan({ plan: newPlan, billingCycle: currentCycle })).unwrap();
      setSelectedNewPlan(null);
      dispatch(fetchCurrentSubscription());
    } catch (err) {
      setChangeError(err instanceof Error ? err.message : 'Failed to change plan');
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await dispatch(cancelSubscription()).unwrap();
      setShowCancelConfirm(false);
      dispatch(fetchCurrentSubscription());
    } catch {
      // Error handled by slice
    }
  };

  const isCancelled = subscription?.status === 'cancelled';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Subscription"
      data-icod-id="src_components_manage_subscription_tsx_modal">
      <div className="space-y-6" data-icod-id="src_components_manage_subscription_tsx_content">
        {/* Current Plan Info */}
        {subscription && (
          <Card
            className="rounded-xl border p-5"
            style={{ borderColor: '#8B72E8', backgroundColor: '#F7F5FA' }}
            data-icod-id="src_components_manage_subscription_tsx_current_plan">
            <div
              className="flex items-center gap-3 mb-3"
              data-icod-id="src_components_managesubscription_tsx_7c4f">
              <CreditCard className="h-5 w-5 text-[#8B72E8]" data-icod-id="src_components_manage_subscription_tsx_cc_icon" />
              <h3 className="text-lg font-bold text-[#29213D]" data-icod-id="src_components_manage_subscription_tsx_plan_heading">
                Current Plan
              </h3>
            </div>
            <div
              className="grid grid-cols-2 gap-4 text-sm"
              data-icod-id="src_components_managesubscription_tsx_fd7f">
              <div data-icod-id="src_components_managesubscription_tsx_0412">
                <p className="text-[#555]" data-icod-id="src_components_manage_subscription_tsx_plan_label">Plan</p>
                <p className="font-semibold text-[#29213D]" data-icod-id="src_components_manage_subscription_tsx_plan_value">
                  {PLAN_OPTIONS.find((p) => p.id === subscription.plan)?.name || subscription.plan}
                </p>
              </div>
              <div data-icod-id="src_components_managesubscription_tsx_49fc">
                <p className="text-[#555]" data-icod-id="src_components_manage_subscription_tsx_cycle_label">Billing Cycle</p>
                <p className="font-semibold text-[#29213D]" data-icod-id="src_components_manage_subscription_tsx_cycle_value">
                  {subscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                </p>
              </div>
              <div data-icod-id="src_components_managesubscription_tsx_d4bd">
                <p className="text-[#555]" data-icod-id="src_components_manage_subscription_tsx_status_label">Status</p>
                <p
                  className={cn(
                    'font-semibold',
                    subscription.status === 'active' ? 'text-[#9DDCC5]' :
                    subscription.status === 'cancelled' ? 'text-red-500' :
                    'text-[#D8B779]'
                  )}
                  data-icod-id="src_components_manage_subscription_tsx_status_value">
                  {subscription.status === 'pending_setup' ? 'Payment Pending' :
                   subscription.status === 'active' ? 'Active' : 'Cancelled'}
                </p>
              </div>
              {subscription.status === 'pending_setup' ? (
                <div data-icod-id="src_components_managesubscription_tsx_pending_billing">
                  <p className="text-[#555]" data-icod-id="src_components_manage_subscription_tsx_next_billing_label">Next Billing</p>
                  <p className="font-semibold text-[#D8B779]" data-icod-id="src_components_manage_subscription_tsx_pending_billing_value">
                    Pending payment setup
                  </p>
                </div>
              ) : subscription.nextBillingDate && !isCancelled ? (
                <div data-icod-id="src_components_managesubscription_tsx_d91a">
                  <p className="text-[#555]" data-icod-id="src_components_manage_subscription_tsx_next_billing_label">Next Billing</p>
                  <p className="font-semibold text-[#29213D]" data-icod-id="src_components_manage_subscription_tsx_next_billing_value">
                    {new Date(subscription.nextBillingDate).toLocaleDateString('en-PK')}
                  </p>
                </div>
              ) : null}
            </div>
            {/* Buyer details if present */}
            {(subscription.buyerName || subscription.buyerEmail) && (
              <div
                className="mt-4 border-t border-border/40 pt-3"
                data-icod-id="src_components_managesubscription_tsx_fd32">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#555]" data-icod-id="src_components_manage_subscription_tsx_buyer_heading">Buyer Details</p>
                <div
                  className="grid grid-cols-2 gap-2 text-sm text-[#444]"
                  data-icod-id="src_components_managesubscription_tsx_ede3">
                  {subscription.buyerName && <span data-icod-id="src_components_manage_subscription_tsx_buyer_name">{subscription.buyerName}</span>}
                  {subscription.buyerEmail && <span data-icod-id="src_components_manage_subscription_tsx_buyer_email">{subscription.buyerEmail}</span>}
                  {subscription.buyerPhone && <span data-icod-id="src_components_manage_subscription_tsx_buyer_phone">{subscription.buyerPhone}</span>}
                  {subscription.businessName && <span data-icod-id="src_components_manage_subscription_tsx_buyer_business">{subscription.businessName}</span>}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Change Plan Section */}
        {!isCancelled && (
          <div data-icod-id="src_components_manage_subscription_tsx_change_plan_section">
            <h3 className="mb-3 text-sm font-semibold text-[#29213D]" data-icod-id="src_components_manage_subscription_tsx_change_heading">
              Change Plan
            </h3>
            <div
              className="grid gap-3 sm:grid-cols-3"
              data-icod-id="src_components_managesubscription_tsx_c4b8">
              {PLAN_OPTIONS.map((option) => {
                const isCurrent = option.id === currentPlan;
                const isSelected = selectedNewPlan === option.id;
                const price = currentCycle === 'yearly' ? option.yearlyPKR : option.monthlyPKR;

                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedNewPlan(option.id)}
                    disabled={isCurrent || isChangingPlan}
                    className={cn(
                      'relative flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all duration-200',
                      isCurrent
                        ? 'border-[#8B72E8] bg-[#F7F5FA]'
                        : isSelected
                          ? 'border-[#8B72E8] shadow-md'
                          : 'border-border hover:border-[#8B72E8]/40',
                      (isCurrent || isChangingPlan) && 'cursor-default opacity-70'
                    )}
                    data-icod-id={`src_components_manage_subscription_tsx_plan_option_${option.id}`}>
                    {isCurrent && (
                      <span className="absolute -top-2 rounded-full bg-[#8B72E8] px-2 py-0.5 text-xs font-bold text-white" data-icod-id="src_components_manage_subscription_tsx_current_badge">
                        Current
                      </span>
                    )}
                    <span className="text-sm font-semibold text-[#29213D]" data-icod-id={`src_components_manage_subscription_tsx_plan_name_${option.id}`}>
                      {option.name}
                    </span>
                    <span className="text-xs text-[#555]" data-icod-id={`src_components_manage_subscription_tsx_plan_price_${option.id}`}>
                      {formatPKR(price)}/{currentCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedNewPlan && selectedNewPlan !== currentPlan && (
              <div
                className="mt-3 flex items-center gap-3"
                data-icod-id="src_components_managesubscription_tsx_14ad">
                <Button
                  onClick={() => handleChangePlan(selectedNewPlan)}
                  loading={isChangingPlan}
                  className="rounded-xl px-6 py-2 text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #8B72E8 0%, #29213D 100%)' }}
                  data-icod-id="src_components_manage_subscription_tsx_confirm_change_btn">
                  Switch to {PLAN_OPTIONS.find((p) => p.id === selectedNewPlan)?.name}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedNewPlan(null)}
                  className="text-sm"
                  data-icod-id="src_components_manage_subscription_tsx_cancel_change_btn">
                  Cancel
                </Button>
              </div>
            )}
            {changeError && (
              <p className="mt-2 text-sm text-red-500" data-icod-id="src_components_manage_subscription_tsx_change_error">
                {changeError}
              </p>
            )}
          </div>
        )}

        {/* Cancel Subscription — only shown for paid plans */}
        {!isCancelled && currentPlan !== 'basic' && (
          <div className="border-t border-border/40 pt-4" data-icod-id="src_components_manage_subscription_tsx_cancel_section">
            {!showCancelConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowCancelConfirm(true)}
                className="w-full rounded-xl py-2 text-sm font-semibold"
                data-icod-id="src_components_manage_subscription_tsx_cancel_trigger_btn">
                Cancel Subscription
              </Button>
            ) : (
              <Card
                className="rounded-xl border border-red-200 p-4"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                data-icod-id="src_components_manage_subscription_tsx_cancel_confirm_card">
                <div
                  className="flex gap-3"
                  data-icod-id="src_components_managesubscription_tsx_7508">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" data-icod-id="src_components_manage_subscription_tsx_cancel_alert_icon" />
                  <div
                    className="flex-1 space-y-3"
                    data-icod-id="src_components_managesubscription_tsx_7a63">
                    <p className="text-sm font-semibold text-[#29213D]" data-icod-id="src_components_manage_subscription_tsx_cancel_confirm_text">
                      Are you sure you want to cancel your subscription?
                    </p>
                    <p className="text-xs text-[#555]" data-icod-id="src_components_manage_subscription_tsx_cancel_warning">
                      You will lose access to premium features after cancellation.
                    </p>
                    <div
                      className="flex gap-2"
                      data-icod-id="src_components_managesubscription_tsx_493a">
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        loading={status === 'loading'}
                        className="rounded-lg px-4 py-1.5 text-xs font-semibold"
                        data-icod-id="src_components_manage_subscription_tsx_confirm_cancel_btn">
                        Yes, Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowCancelConfirm(false)}
                        className="rounded-lg px-4 py-1.5 text-xs"
                        data-icod-id="src_components_manage_subscription_tsx_abort_cancel_btn">
                        Keep Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Cancelled state message */}
        {isCancelled && (
          <Card
            className="rounded-xl border p-4"
            style={{ borderColor: '#D8B779', backgroundColor: 'rgba(216, 183, 121, 0.08)' }}
            data-icod-id="src_components_manage_subscription_tsx_cancelled_notice">
            <div
              className="flex gap-3"
              data-icod-id="src_components_managesubscription_tsx_6813">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#D8B779]" data-icod-id="src_components_manage_subscription_tsx_cancelled_icon" />
              <p className="text-sm text-[#555]" data-icod-id="src_components_manage_subscription_tsx_cancelled_text">
                Your subscription has been cancelled. You can re-subscribe at any time from the Pricing page.
              </p>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}
