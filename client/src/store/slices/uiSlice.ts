import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_CURRENCY } from '@/utils/currency';

export type Language = 'en' | 'ur';

interface UiState {
  globalLoading: boolean;
  currency: string;
  language: Language;
}

const initialState: UiState = {
  globalLoading: false,
  currency: DEFAULT_CURRENCY,
  language: 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
});

export const { setGlobalLoading, setCurrency, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
