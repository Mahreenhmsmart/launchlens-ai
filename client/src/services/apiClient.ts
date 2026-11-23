import axios from 'axios';
import type {
  DiscoverProductsRequest,
  DiscoverProductsResponse,
  AskTrendScoutRequest,
  AskTrendScoutRequestWithResearch,
  AskTrendScoutResponse,
  ValidateProductRequest,
  ValidateProductResponse,
} from '@/types';
import { isPublicRoute } from '@/App';

// VITE_API_URL already ends with /api — NEVER append another /api to paths.
// In production (same-origin deployment) VITE_API_URL may be unset; fall back
// to the relative /api prefix so requests go to the Express server serving
// both the SPA and the API from one host.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear auth state on 401
      localStorage.removeItem('token');
      // Only redirect to /auth if the current page is NOT a public route.
      // Public routes (/, /privacy, /terms, /about, etc.) must render without
      // auth — redirecting them breaks direct-link access in fresh tabs.
      const currentPath = window.location.pathname;
      if (!isPublicRoute(currentPath)) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export interface ChecklistItemState {
  label: string;
  checked: boolean;
  priority: 'High' | 'Medium';
}

export interface AIInsightsContext {
  productName: string;
  currency: string;
  sellingPrice: number;
  productCost: number;
  deliveryCost: number;
  otherVariableCosts: number;
  advertisingBudget: number;
  expectedOrders: number;
  revenue: number;
  variableCosts: number;
  contributionPerOrder: number;
  contributionBeforeAdvertising: number;
  campaignProfitLoss: number;
  roas: number | null;
  contributionMarginPercent: number | null;
  breakEvenRoas: number | null;
  breakEvenOrders: number | null;
  checklistCompletionPercent: number;
  incompleteChecklistItems: string[];
  checklistItems?: ChecklistItemState[];
}

export interface AIInsightsResponse {
  success: boolean;
  data?: {
    advice: string;
    isFallback: boolean;
    reason?: string;
  };
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isFallback?: boolean;
}

export interface ChatRequest {
  question: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  context: AIInsightsContext;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    reply: string;
    isFallback: boolean;
    reason?: string;
  };
  error?: string;
}

/**
 * Request AI-powered launch insights from the server.
 */
export async function fetchAIInsights(context: AIInsightsContext): Promise<AIInsightsResponse> {
  try {
    const { data } = await apiClient.post<AIInsightsResponse>('/ai/insights', context);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // If the server returned a structured error response
      if (err.response?.data) {
        return err.response.data as AIInsightsResponse;
      }
      // Network error or server unreachable
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while fetching insights.',
    };
  }
}

/**
 * Send a chat message to the AI assistant.
 */
export async function sendChatMessage(
  question: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  context: AIInsightsContext
): Promise<ChatResponse> {
  try {
    const payload: ChatRequest = {
      question,
      conversationHistory,
      context,
    };
    const { data } = await apiClient.post<ChatResponse>('/ai/chat', payload);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.data) {
        return err.response.data as ChatResponse;
      }
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while sending your message.',
    };
  }
}

export default apiClient;

// ─── Product Discovery Service Methods ──────────────────────────────────────

/**
 * Discover product ideas based on filters and category.
 */
export async function discoverProducts(
  request: DiscoverProductsRequest
): Promise<DiscoverProductsResponse> {
  try {
    const { data } = await apiClient.post<DiscoverProductsResponse>('/ai/discover-products', request);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.data) {
        return err.response.data as DiscoverProductsResponse;
      }
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while discovering products.',
    };
  }
}

/**
 * Ask TrendScout AI a question about products and markets.
 */
export async function askTrendScout(
  request: AskTrendScoutRequestWithResearch
): Promise<AskTrendScoutResponse> {
  try {
    const { data } = await apiClient.post<AskTrendScoutResponse>('/ai/ask-trendscout', request);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.data) {
        return err.response.data as AskTrendScoutResponse;
      }
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while asking TrendScout.',
    };
  }
}

/**
 * Generate a validation plan for a product idea.
 */
export async function validateProduct(
  request: ValidateProductRequest
): Promise<ValidateProductResponse> {
  try {
    const { data } = await apiClient.post<ValidateProductResponse>('/ai/validate-product', request);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.data) {
        return err.response.data as ValidateProductResponse;
      }
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while generating the validation plan.',
    };
  }
}
