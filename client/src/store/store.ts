import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import subscriptionReducer from './slices/subscriptionSlice';

// Add one entry per slice in ./slices — e.g. products: productsReducer.
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    products: productsReducer,
    subscription: subscriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
