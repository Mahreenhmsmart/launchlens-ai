import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  selectPlanRequest,
  getCurrentSubscriptionRequest,
  getPaymentStatusRequest,
  changePlanRequest,
  cancelSubscriptionRequest,
} from '../../services/subscriptionService';
import type { SelectPlanRequest, SubscriptionState, ChangePlanRequest, BillingCycle } from '../../types';

const BILLING_CYCLE_KEY = 'launchlens_preferred_billing_cycle';

function loadPreferredBillingCycle(): BillingCycle {
  try {
    const stored = localStorage.getItem(BILLING_CYCLE_KEY);
    if (stored === 'yearly' || stored === 'monthly') return stored;
  } catch {
    // ignore
  }
  return 'monthly';
}

function savePreferredBillingCycle(cycle: BillingCycle): void {
  try {
    localStorage.setItem(BILLING_CYCLE_KEY, cycle);
  } catch {
    // ignore
  }
}

const initialState: SubscriptionState = {
  subscription: null,
  paymentConfigured: false,
  preferredBillingCycle: loadPreferredBillingCycle(),
  status: 'idle',
  error: null,
};

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async () => {
    const result = await getCurrentSubscriptionRequest();
    return result.data ?? null;
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  'subscription/fetchPaymentStatus',
  async () => {
    const result = await getPaymentStatusRequest();
    return result.data?.paymentConfigured ?? false;
  }
);

export const selectPlan = createAsyncThunk(
  'subscription/selectPlan',
  async (payload: SelectPlanRequest) => {
    const result = await selectPlanRequest(payload);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to select plan');
    }
    return result.data;
  }
);

export const changePlan = createAsyncThunk(
  'subscription/changePlan',
  async (payload: ChangePlanRequest) => {
    const result = await changePlanRequest(payload);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to change plan');
    }
    return result.data;
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async () => {
    const result = await cancelSubscriptionRequest();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to cancel subscription');
    }
    return result.data;
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError(state) {
      state.error = null;
    },
    setPreferredBillingCycle(state, action: { payload: BillingCycle }) {
      state.preferredBillingCycle = action.payload;
      savePreferredBillingCycle(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch current subscription
    builder.addCase(fetchCurrentSubscription.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.subscription = action.payload;
      // Sync billing cycle preference from server
      if (action.payload?.billingCycle) {
        state.preferredBillingCycle = action.payload.billingCycle;
        savePreferredBillingCycle(action.payload.billingCycle);
      }
    });
    builder.addCase(fetchCurrentSubscription.rejected, (state) => {
      state.status = 'failed';
    });

    // Fetch payment status
    builder.addCase(fetchPaymentStatus.fulfilled, (state, action) => {
      state.paymentConfigured = action.payload;
    });

    // Select plan
    builder.addCase(selectPlan.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(selectPlan.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.subscription = action.payload;
      // Persist billing cycle preference
      if (action.payload?.billingCycle) {
        state.preferredBillingCycle = action.payload.billingCycle;
        savePreferredBillingCycle(action.payload.billingCycle);
      }
    });
    builder.addCase(selectPlan.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Failed to select plan';
    });

    // Change plan
    builder.addCase(changePlan.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(changePlan.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.subscription = action.payload;
      if (action.payload?.billingCycle) {
        state.preferredBillingCycle = action.payload.billingCycle;
        savePreferredBillingCycle(action.payload.billingCycle);
      }
    });
    builder.addCase(changePlan.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Failed to change plan';
    });

    // Cancel subscription
    builder.addCase(cancelSubscription.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(cancelSubscription.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.subscription = action.payload;
    });
    builder.addCase(cancelSubscription.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Failed to cancel subscription';
    });
  },
});

export const { clearSubscriptionError, setPreferredBillingCycle } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
