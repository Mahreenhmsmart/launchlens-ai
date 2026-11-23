import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  generateLaunchInsights, 
  generateRuleBasedFallback, 
  generateChatResponse,
  discoverProducts,
  generateTrendScoutResponse,
  generateValidationPlan,
} from '../services/aiService';
import type { LaunchContext, ChatMessage, DiscoveryFilters, ProductIdea, ResearchData, ChecklistItemState } from '../services/aiService';

const router = Router();

/**
 * Validate that required numeric fields are present and valid.
 */
function validateContext(body: Record<string, unknown>): { valid: boolean; error?: string; context?: LaunchContext } {
  const requiredStrings = ['productName', 'currency'];
  const requiredNumbers = [
    'sellingPrice',
    'productCost',
    'deliveryCost',
    'otherVariableCosts',
    'advertisingBudget',
    'expectedOrders',
    'revenue',
    'variableCosts',
    'contributionPerOrder',
    'contributionBeforeAdvertising',
    'campaignProfitLoss',
    'checklistCompletionPercent',
  ];

  for (const field of requiredStrings) {
    if (typeof body[field] !== 'string' || (body[field] as string).trim() === '') {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  for (const field of requiredNumbers) {
    if (typeof body[field] !== 'number' || isNaN(body[field] as number)) {
      return { valid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  // Nullable numbers (roas, contributionMarginPercent, breakEvenRoas, breakEvenOrders)
  const nullableNumbers = ['roas', 'contributionMarginPercent', 'breakEvenRoas', 'breakEvenOrders'];
  for (const field of nullableNumbers) {
    if (body[field] !== null && (typeof body[field] !== 'number' || isNaN(body[field] as number))) {
      return { valid: false, error: `Invalid field: ${field} must be a number or null` };
    }
  }

  // incompleteChecklistItems should be an array of strings
  if (!Array.isArray(body.incompleteChecklistItems)) {
    return { valid: false, error: 'Missing or invalid field: incompleteChecklistItems must be an array' };
  }

  // Parse optional checklistItems (full checklist state with checked status)
  let checklistItems: ChecklistItemState[] | undefined;
  if (Array.isArray(body.checklistItems)) {
    checklistItems = body.checklistItems
      .filter(
        (item: unknown): item is { label: string; checked: boolean; priority: string } =>
          item !== null &&
          typeof item === 'object' &&
          typeof (item as Record<string, unknown>).label === 'string' &&
          typeof (item as Record<string, unknown>).checked === 'boolean'
      )
      .map((item) => ({
        label: item.label,
        checked: item.checked,
        priority: item.priority === 'High' ? 'High' : 'Medium',
      }));
  }

  const context: LaunchContext = {
    productName: body.productName as string,
    currency: body.currency as string,
    sellingPrice: body.sellingPrice as number,
    productCost: body.productCost as number,
    deliveryCost: body.deliveryCost as number,
    otherVariableCosts: body.otherVariableCosts as number,
    advertisingBudget: body.advertisingBudget as number,
    expectedOrders: body.expectedOrders as number,
    revenue: body.revenue as number,
    variableCosts: body.variableCosts as number,
    contributionPerOrder: body.contributionPerOrder as number,
    contributionBeforeAdvertising: body.contributionBeforeAdvertising as number,
    campaignProfitLoss: body.campaignProfitLoss as number,
    roas: body.roas as number | null,
    contributionMarginPercent: body.contributionMarginPercent as number | null,
    breakEvenRoas: body.breakEvenRoas as number | null,
    breakEvenOrders: body.breakEvenOrders as number | null,
    checklistCompletionPercent: body.checklistCompletionPercent as number,
    incompleteChecklistItems: body.incompleteChecklistItems as string[],
    checklistItems,
  };

  return { valid: true, context };
}

router.post('/insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateContext(req.body);

    if (!validation.valid || !validation.context) {
      res.status(400).json({
        success: false,
        error: validation.error || 'Invalid request body',
      });
      return;
    }

    const result = await generateLaunchInsights(validation.context);

    res.json({
      success: true,
      data: {
        advice: result.advice,
        isFallback: result.isFallback,
        ...(result.reason ? { reason: result.reason } : {}),
      },
    });
  } catch (err) {
    console.error('[AI Route] Unexpected error:', err);
    // On unexpected errors, return rule-based fallback rather than crashing
    try {
      const validation = validateContext(req.body);
      if (validation.valid && validation.context) {
        const fallbackAdvice = generateRuleBasedFallback(validation.context);
        res.json({
          success: true,
          data: {
            advice: fallbackAdvice,
            isFallback: true,
            reason: 'An unexpected error occurred. Showing rule-based insights.',
          },
        });
        return;
      }
    } catch {
      // If even fallback fails, return error
    }
    next(err);
  }
});

/**
 * POST /api/ai/chat — Conversational Q&A with simulation context
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, conversationHistory, context } = req.body;

    // Validate question
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({
        success: false,
        error: 'Question is required.',
      });
      return;
    }

    // Validate conversation history if provided
    let validHistory: ChatMessage[] = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      validHistory = conversationHistory.filter(
        (msg): msg is ChatMessage =>
          msg &&
          typeof msg.role === 'string' &&
          ['user', 'assistant'].includes(msg.role) &&
          typeof msg.content === 'string'
      );
    }

    // Validate context using existing validator
    const validation = validateContext(context || {});
    if (!validation.valid || !validation.context) {
      res.status(400).json({
        success: false,
        error: validation.error || 'Invalid simulation context provided.',
      });
      return;
    }

    const result = await generateChatResponse(question, validHistory, validation.context);

    res.json({
      success: true,
      data: {
        reply: result.reply,
        isFallback: result.isFallback,
        ...(result.reason ? { reason: result.reason } : {}),
      },
    });
  } catch (err) {
    console.error('[AI Route] Chat error:', err);
    // On unexpected errors, try to return a fallback response
    try {
      const { question, context } = req.body;
      const validation = validateContext(context || {});
      if (validation.valid && validation.context && question) {
        const { generateChatFallback } = await import('../services/aiService');
        const fallbackReply = generateChatFallback(question, validation.context);
        res.json({
          success: true,
          data: {
            reply: fallbackReply,
            isFallback: true,
            reason: 'An unexpected error occurred. Showing rule-based response.',
          },
        });
        return;
      }
    } catch {
      // If even fallback fails, return error
    }
    next(err);
  }
});

// ─── Product Discovery Endpoints ────────────────────────────────────────────

/**
 * POST /api/ai/discover-products — Get AI-generated product ideas based on filters
 */
router.post('/discover-products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filters, category, currency } = req.body;

    // Validate filters
    if (!filters || typeof filters !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Filters object is required.',
      });
      return;
    }

    if (!category || typeof category !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Category is required.',
      });
      return;
    }

    if (!currency || typeof currency !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Currency is required.',
      });
      return;
    }

    const validFilters: DiscoveryFilters = {
      targetMarket: filters.targetMarket || 'Pakistan',
      businessModel: filters.businessModel || 'Shopify store',
      productCategory: filters.productCategory || 'All categories',
      budgetRange: filters.budgetRange || '5K–15K',
      productType: filters.productType || 'Lightweight',
      preferredNiche: filters.preferredNiche || '',
    };

    const result = await discoverProducts(validFilters, category, currency);

    res.json({
      success: true,
      data: {
        products: result.products,
        isFallback: result.isFallback,
        ...(result.reason ? { reason: result.reason } : {}),
      },
    });
  } catch (err) {
    console.error('[AI Route] Discover products error:', err);
    next(err);
  }
});

/**
 * POST /api/ai/ask-trendscout — Conversational Q&A about products and markets
 */
router.post('/ask-trendscout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, conversationHistory, filterContext, currency, researchData } = req.body;

    // Validate question
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({
        success: false,
        error: 'Question is required.',
      });
      return;
    }

    if (!currency || typeof currency !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Currency is required.',
      });
      return;
    }

    // Validate conversation history if provided
    let validHistory: ChatMessage[] = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      validHistory = conversationHistory.filter(
        (msg): msg is ChatMessage =>
          msg &&
          typeof msg.role === 'string' &&
          ['user', 'assistant'].includes(msg.role) &&
          typeof msg.content === 'string'
      );
    }

    // Build filter context with defaults
    const filters: DiscoveryFilters = {
      targetMarket: filterContext?.targetMarket || 'Pakistan',
      businessModel: filterContext?.businessModel || 'Shopify store',
      productCategory: filterContext?.productCategory || 'All categories',
      budgetRange: filterContext?.budgetRange || '5K–15K',
      productType: filterContext?.productType || 'Lightweight',
      preferredNiche: filterContext?.preferredNiche || '',
    };

    // Validate research data if provided
    let validResearchData: ResearchData | undefined;
    if (researchData && typeof researchData === 'object') {
      if (Array.isArray(researchData.observations) && typeof researchData.status === 'string') {
        validResearchData = {
          observations: researchData.observations,
          status: researchData.status,
          productName: researchData.productName,
        };
      }
    }

    const result = await generateTrendScoutResponse(question, validHistory, filters, currency, validResearchData);

    res.json({
      success: true,
      data: {
        reply: result.reply,
        isFallback: result.isFallback,
        ...(result.reason ? { reason: result.reason } : {}),
      },
    });
  } catch (err) {
    console.error('[AI Route] Ask TrendScout error:', err);
    next(err);
  }
});

/**
 * POST /api/ai/validate-product — Generate a validation plan for a product idea
 */
router.post('/validate-product', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product, currency } = req.body;

    if (!product || typeof product !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Product object is required.',
      });
      return;
    }

    if (!currency || typeof currency !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Currency is required.',
      });
      return;
    }

    const result = await generateValidationPlan(product as ProductIdea, currency);

    res.json({
      success: true,
      data: {
        validationPlan: result.validationPlan,
        isFallback: result.isFallback,
        ...(result.reason ? { reason: result.reason } : {}),
      },
    });
  } catch (err) {
    console.error('[AI Route] Validate product error:', err);
    next(err);
  }
});

export default router;
