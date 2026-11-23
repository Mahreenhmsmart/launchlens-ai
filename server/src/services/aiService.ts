import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Existing Launch Context Types ──────────────────────────────────────────

export interface ChecklistItemState {
  label: string;
  checked: boolean;
  priority: 'High' | 'Medium';
}

export interface LaunchContext {
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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatResult {
  reply: string;
  isFallback: boolean;
  reason?: string;
}

export interface AIInsightsResult {
  advice: string;
  isFallback: boolean;
  reason?: string;
}

// ─── Product Discovery Types ────────────────────────────────────────────────

export interface DiscoveryFilters {
  targetMarket: string;
  businessModel: string;
  productCategory: string;
  budgetRange: string;
  productType: string;
  preferredNiche: string;
}

export interface OpportunityScoreBreakdown {
  problemSeverity: number;
  demandSignals: number;
  competitionGap: number;
  profitPotential: number;
  sourcingShippingEase: number;
  riskDifferentiation: number;
  total: number;
  explanations: {
    problemSeverity: string;
    demandSignals: string;
    competitionGap: string;
    profitPotential: string;
    sourcingShippingEase: string;
    riskDifferentiation: string;
  };
}

export type SupplierChannel = 'Local Wholesale Market' | 'Importer' | 'Manufacturer (Direct)' | 'Online Marketplace';

export interface LandedCostBreakdown {
  productCostPerUnit: number;
  shippingToPakistanPerUnit: number;
  importDutyTaxPerUnit: number;
  packagingPerUnit: number;
  totalLandedCostPerUnit: number;
}

export interface SourcingInfo {
  likelySupplierChannel: SupplierChannel;
  estimatedMinOrderQuantity: number;
  landedCost: LandedCostBreakdown;
  marginOnLandedCostPercent: number;
}

export interface ProductIdea {
  id: string;
  name: string;
  category: string;
  customerProblem: string;
  targetCustomer: string;
  demandLevel: 'Low' | 'Medium' | 'High';
  trendDirection: 'rising' | 'stable' | 'declining';
  competitionLevel: 'Low' | 'Medium' | 'High';
  estimatedSellingPriceRange: { min: number; max: number };
  estimatedSourcingCostRange: { min: number; max: number };
  potentialMarginPercent: number;
  shippingRisk: 'Low' | 'Medium' | 'High';
  qualityRisk: 'Low' | 'Medium' | 'High';
  returnsRisk: 'Low' | 'Medium' | 'High';
  regulatoryRisk: 'Low' | 'Medium' | 'High';
  differentiationIdeas: string[];
  validationTestSuggestion: string;
  opportunityScore: OpportunityScoreBreakdown;
  isProvisional: boolean;
  evidenceSource?: string;
  dateChecked?: string;
  discoveryCategory: string;
  sourcing?: SourcingInfo;
}

export interface DiscoverProductsResult {
  products: ProductIdea[];
  isFallback: boolean;
  reason?: string;
}

export interface ValidateProductResult {
  validationPlan: string;
  isFallback: boolean;
  reason?: string;
}

// ─── Manual Research Types ──────────────────────────────────────────────────

export type EvidenceStatus = 'ai-idea' | 'researching' | 'partially-verified' | 'evidence-collected';

export interface CompetitorObservation {
  id: string;
  competitorName: string;
  sellerName: string;
  price: number;
  currency: string;
  productUrl: string;
  availability: string;
  deliveryNotes: string;
  dateChecked: string;
  qualityNotes: string;
  reviewNotes: string;
  differentiationNotes: string;
  complaintNotes: string;
}

export interface ResearchData {
  observations: CompetitorObservation[];
  status: EvidenceStatus;
  productName?: string;
}

/**
 * Build a detailed prompt from the simulation context for the AI model.
 */
function buildPrompt(ctx: LaunchContext): string {
  const fmt = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const pct = (v: number | null) => (v !== null ? `${v.toFixed(1)}%` : 'N/A');
  const roasFmt = (v: number | null) => (v !== null ? `${v.toFixed(2)}x` : 'N/A');

  // Build detailed checklist state block
  let checklistBlock = '';
  if (ctx.checklistItems && ctx.checklistItems.length > 0) {
    const items = ctx.checklistItems.map((item) => {
      const status = item.checked ? '[DONE]' : '[NOT DONE]';
      return `  ${status} (${item.priority}) ${item.label}`;
    });
    checklistBlock = `READINESS CHECKLIST — LIVE STATE:
Completion: ${ctx.checklistCompletionPercent}%
${items.join('\n')}

CRITICAL RULES FOR READINESS:
- Only items marked [DONE] above are complete. Items marked [NOT DONE] are NOT complete.
- NEVER claim a readiness item is done unless it is explicitly marked [DONE] above.
- If completion is 0%, say plainly "nothing is ready yet" and list the first high-priority items to work on.
- If an item is [NOT DONE] and the user asks about it, describe what is still missing and the next step — do NOT say it is done.
- Do not fabricate or assume any readiness progress beyond what is shown above.`;
  } else {
    checklistBlock = `LAUNCH READINESS:
- Checklist Completion: ${ctx.checklistCompletionPercent}%
- Incomplete Items: ${ctx.incompleteChecklistItems.length > 0 ? ctx.incompleteChecklistItems.join('; ') : 'None — all tasks complete'}

IMPORTANT: If completion is 0%, say nothing is ready yet. Only confirm items as complete when they appear in the completed list.`;
  }

  return `You are a practical e-commerce launch advisor. Analyze the following product launch simulation data and provide structured, actionable advice. Ground every recommendation in the supplied numbers — do not guarantee results.

PRODUCT & INPUTS:
- Product: ${ctx.productName || 'Unnamed product'}
- Currency: ${ctx.currency}
- Selling Price: ${fmt(ctx.sellingPrice)}
- Product Cost: ${fmt(ctx.productCost)}
- Delivery Cost: ${fmt(ctx.deliveryCost)}
- Other Variable Costs: ${fmt(ctx.otherVariableCosts)}
- Advertising Budget: ${fmt(ctx.advertisingBudget)}
- Expected Orders: ${ctx.expectedOrders}

CALCULATED METRICS:
- Revenue: ${fmt(ctx.revenue)}
- Total Variable Costs: ${fmt(ctx.variableCosts)}
- Contribution Per Order: ${fmt(ctx.contributionPerOrder)}
- Contribution Before Advertising: ${fmt(ctx.contributionBeforeAdvertising)}
- Campaign Profit/Loss: ${fmt(ctx.campaignProfitLoss)}
- ROAS: ${roasFmt(ctx.roas)}
- Contribution Margin: ${pct(ctx.contributionMarginPercent)}
- Break-Even ROAS: ${roasFmt(ctx.breakEvenRoas)}
- Break-Even Orders: ${ctx.breakEvenOrders !== null ? ctx.breakEvenOrders : 'N/A'}

${checklistBlock}

GROUNDING RULES — YOU MUST FOLLOW THESE:
1. Never claim a readiness item is complete unless it is explicitly marked [DONE] in the checklist above.
2. If readiness is 0%, say plainly "nothing is ready yet" and suggest the first items to complete.
3. When an item is [NOT DONE] and the user asks about it, describe what is missing and the next step — never say it is done.
4. No fake numbers, no unverified claims about the user's business. Every metric you cite must come from the data above.
5. If data is missing or zero, say so explicitly rather than assuming positive values.

Provide your advice organized into exactly these six sections with clear headings:

1. **Product Economics Concerns** — Analyze margins, contribution per order, and whether the unit economics support sustainable scaling. Flag risks if contribution margin is below 30% or contribution per order is low relative to ad spend.

2. **Pricing and Offer Ideas** — Suggest pricing adjustments, bundling strategies, or offer structures that could improve profitability. Reference the current selling price and costs.

3. **Advertising Creative Testing Ideas** — Recommend specific creative angles, formats, and messaging approaches based on the product type and budget. Suggest how to allocate the ${fmt(ctx.advertisingBudget)} ad budget across tests.

4. **Audience and Campaign Testing Suggestions** — Propose audience segments, targeting strategies, and campaign structures. Consider the expected order volume and ROAS targets.

5. **Launch Risks and Missing Information** — Identify gaps in readiness using the incomplete checklist items and any financial red flags. Be specific about what could go wrong. Reference the exact checklist items that are NOT DONE.

6. **Three Prioritized Next Actions** — List exactly three concrete, ordered next steps the founder should take before launching, ranked by impact.

Format each section with its heading followed by bullet points or short paragraphs. Be direct, practical, and specific to these numbers.`;
}

/**
 * Generate a deterministic rule-based fallback when AI is unavailable.
 */
export function generateRuleBasedFallback(ctx: LaunchContext): string {
  const lines: string[] = [];

  // Section 1: Product Economics
  lines.push('## Product Economics Concerns\n');
  if (ctx.contributionPerOrder <= 0) {
    lines.push('- **Critical:** Your contribution per order is zero or negative. Every sale loses money before accounting for advertising. You must reduce costs or increase price before launching.');
  } else if (ctx.contributionMarginPercent !== null && ctx.contributionMarginPercent < 30) {
    lines.push(`- **Warning:** Contribution margin is ${ctx.contributionMarginPercent.toFixed(1)}%, which is below the recommended 30% threshold. Thin margins leave little room for advertising costs and unexpected expenses.`);
  } else {
    lines.push(`- Contribution margin of ${ctx.contributionMarginPercent?.toFixed(1) ?? 'N/A'}% is healthy. Ensure this holds at scale as ad costs may increase.`);
  }
  if (ctx.contributionPerOrder > 0 && ctx.advertisingBudget > 0) {
    const adCostPerOrder = ctx.advertisingBudget / ctx.expectedOrders;
    if (adCostPerOrder > ctx.contributionPerOrder) {
      lines.push(`- **Risk:** Estimated ad cost per order (${adCostPerOrder.toFixed(0)}) exceeds contribution per order (${ctx.contributionPerOrder.toFixed(0)}). You will lose money on each sale unless conversion rates improve significantly.`);
    }
  }
  lines.push('');

  // Section 2: Pricing and Offer
  lines.push('## Pricing and Offer Ideas\n');
  if (ctx.contributionMarginPercent !== null && ctx.contributionMarginPercent < 40) {
    lines.push('- Consider increasing your selling price or negotiating lower product costs to improve margins.');
    lines.push('- Explore bundling complementary products to increase average order value without proportionally increasing costs.');
  } else {
    lines.push('- Margins look solid. Test premium pricing tiers or add-on upsells to maximize revenue per customer.');
  }
  lines.push('- Consider offering free shipping thresholds above your current selling price to boost AOV.');
  lines.push('');

  // Section 3: Ad Creative Testing
  lines.push('## Advertising Creative Testing Ideas\n');
  lines.push(`- With a ${ctx.currency} ${ctx.advertisingBudget.toLocaleString()} budget, start with 3-5 creative variations: product demo video, lifestyle imagery, benefit-focused carousel, testimonial/social proof, and problem-solution format.`);
  lines.push('- Allocate 60% of budget to best-performing creatives after initial testing phase (3-5 days).');
  lines.push('- Test different hooks in the first 3 seconds of video ads to find what stops the scroll.');
  lines.push('');

  // Section 4: Audience and Campaign
  lines.push('## Audience and Campaign Testing Suggestions\n');
  if (ctx.breakEvenRoas !== null) {
    lines.push(`- Your break-even ROAS is ${ctx.breakEvenRoas.toFixed(2)}x. Target campaigns need to exceed this to be profitable.`);
  }
  if (ctx.breakEvenOrders !== null && ctx.expectedOrders < ctx.breakEvenOrders) {
    lines.push(`- **Alert:** You expect ${ctx.expectedOrders} orders but need ${ctx.breakEvenOrders} to break even. Increase traffic or improve conversion rate before scaling spend.`);
  }
  lines.push('- Start with broad audiences and let platform algorithms optimize. Narrow targeting only after gathering sufficient conversion data.');
  lines.push('- Set up retargeting campaigns for website visitors who did not convert — these typically have higher ROAS.');
  lines.push('');

  // Section 5: Risks
  lines.push('## Launch Risks and Missing Information\n');
  if (ctx.checklistCompletionPercent < 50) {
    lines.push(`- **High Risk:** Only ${ctx.checklistCompletionPercent}% of launch readiness tasks are complete. Delay launch until critical items are addressed.`);
  } else if (ctx.checklistCompletionPercent < 80) {
    lines.push(`- **Moderate Risk:** ${ctx.checklistCompletionPercent}% readiness. Complete remaining tasks before investing full ad budget.`);
  }
  if (ctx.incompleteChecklistItems.length > 0) {
    lines.push('- Incomplete readiness items:');
    for (const item of ctx.incompleteChecklistItems) {
      lines.push(`  - ${item}`);
    }
  }
  if (ctx.campaignProfitLoss < 0) {
    lines.push(`- Projected campaign loss of ${ctx.currency} ${Math.abs(ctx.campaignProfitLoss).toLocaleString()}. Re-evaluate economics before spending the full ad budget.`);
  }
  lines.push('');

  // Section 6: Next Actions
  lines.push('## Three Prioritized Next Actions\n');
  const actions: string[] = [];
  if (ctx.contributionPerOrder <= 0) {
    actions.push('1. **Fix unit economics immediately** — renegotiate supplier costs, reduce delivery expenses, or raise selling price until contribution per order is positive.');
  }
  if (ctx.checklistCompletionPercent < 80) {
    actions.push(`${actions.length + 1}. **Complete launch readiness checklist** — focus on high-priority incomplete items before going live.`);
  }
  if (ctx.campaignProfitLoss < 0) {
    actions.push(`${actions.length + 1}. **Reduce ad budget or increase expected orders** — current projections show a loss. Test with a smaller budget first and scale only if ROAS exceeds break-even.`);
  }
  if (actions.length < 3) {
    actions.push(`${actions.length + 1}. **Prepare 3-5 ad creative variations** — diverse creative testing is essential for finding winning combinations early.`);
  }
  if (actions.length < 3) {
    actions.push(`${actions.length + 1}. **Set up tracking and analytics** — ensure pixels, conversion events, and attribution are working correctly before spending.`);
  }
  if (actions.length < 3) {
    actions.push(`${actions.length + 1}. **Define success criteria** — set daily KPI targets (CPA, ROAS, CTR) and know your stop-loss thresholds before launching.`);
  }
  lines.push(actions.slice(0, 3).join('\n'));

  return lines.join('\n');
}

/**
 * Generate launch insights using the configured AI provider.
 * Returns structured advice text or falls back to rule-based insights.
 */
export async function generateLaunchInsights(ctx: LaunchContext): Promise<AIInsightsResult> {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';

  // If no API key, return fallback
  if (!apiKey) {
    return {
      advice: generateRuleBasedFallback(ctx),
      isFallback: true,
      reason: 'AI API key is not configured. Showing rule-based insights instead.',
    };
  }

  try {
    if (provider === 'google' || provider === '') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model });
      const prompt = buildPrompt(ctx);
      const result = await genModel.generateContent(prompt);
      const text = result.response.text();

      if (!text || text.trim().length === 0) {
        return {
          advice: generateRuleBasedFallback(ctx),
          isFallback: true,
          reason: 'AI returned an empty response. Showing rule-based insights instead.',
        };
      }

      return {
        advice: text,
        isFallback: false,
      };
    }

    // Unsupported provider — fall back
    return {
      advice: generateRuleBasedFallback(ctx),
      isFallback: true,
      reason: `AI provider "${provider}" is not supported for insights generation. Showing rule-based insights.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Error generating insights:', errorMessage);
    return {
      advice: generateRuleBasedFallback(ctx),
      isFallback: true,
      reason: `AI service error: ${errorMessage}. Showing rule-based insights instead.`,
    };
  }
}

/**
 * Build a system prompt for chat that includes simulation context.
 */
function buildChatSystemPrompt(ctx: LaunchContext): string {
  const fmt = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const pct = (v: number | null) => (v !== null ? `${v.toFixed(1)}%` : 'N/A');
  const roasFmt = (v: number | null) => (v !== null ? `${v.toFixed(2)}x` : 'N/A');

  // Build detailed checklist state block
  let checklistBlock = '';
  if (ctx.checklistItems && ctx.checklistItems.length > 0) {
    const items = ctx.checklistItems.map((item) => {
      const status = item.checked ? '[DONE]' : '[NOT DONE]';
      return `  ${status} (${item.priority}) ${item.label}`;
    });
    checklistBlock = `READINESS CHECKLIST — LIVE STATE:
Completion: ${ctx.checklistCompletionPercent}%
${items.join('\n')}

CRITICAL RULES FOR READINESS:
- Only items marked [DONE] above are complete. Items marked [NOT DONE] are NOT complete.
- NEVER claim a readiness item is done unless it is explicitly marked [DONE] above.
- If completion is 0%, say plainly "nothing is ready yet" and list the first high-priority items to work on.
- If an item is [NOT DONE] and the user asks about it, describe what is still missing and the next step — do NOT say it is done.
- Do not fabricate or assume any readiness progress beyond what is shown above.`;
  } else {
    checklistBlock = `- Checklist Completion: ${ctx.checklistCompletionPercent}%
- Incomplete Items: ${ctx.incompleteChecklistItems.length > 0 ? ctx.incompleteChecklistItems.join('; ') : 'None — all tasks complete'}

IMPORTANT: If completion is 0%, say nothing is ready yet. Only confirm items as complete when they appear in the completed list.`;
  }

  return `You are LaunchLens, a practical e-commerce launch advisor. You help founders understand their product economics, advertising strategy, and launch readiness. Answer questions using the simulation data below as context. Be specific, actionable, and ground every recommendation in these numbers. Do not guarantee results.

CURRENT SIMULATION DATA:
- Product: ${ctx.productName || 'Unnamed product'}
- Currency: ${ctx.currency}
- Selling Price: ${fmt(ctx.sellingPrice)}
- Product Cost: ${fmt(ctx.productCost)}
- Delivery Cost: ${fmt(ctx.deliveryCost)}
- Other Variable Costs: ${fmt(ctx.otherVariableCosts)}
- Advertising Budget: ${fmt(ctx.advertisingBudget)}
- Expected Orders: ${ctx.expectedOrders}
- Revenue: ${fmt(ctx.revenue)}
- Total Variable Costs: ${fmt(ctx.variableCosts)}
- Contribution Per Order: ${fmt(ctx.contributionPerOrder)}
- Contribution Before Advertising: ${fmt(ctx.contributionBeforeAdvertising)}
- Campaign Profit/Loss: ${fmt(ctx.campaignProfitLoss)}
- ROAS: ${roasFmt(ctx.roas)}
- Contribution Margin: ${pct(ctx.contributionMarginPercent)}
- Break-Even ROAS: ${roasFmt(ctx.breakEvenRoas)}
- Break-Even Orders: ${ctx.breakEvenOrders !== null ? ctx.breakEvenOrders : 'N/A'}

${checklistBlock}

GROUNDING RULES — YOU MUST FOLLOW THESE:
1. Never claim a readiness item is complete unless it is explicitly marked [DONE] in the checklist above.
2. If readiness is 0%, say plainly "nothing is ready yet" and suggest the first items to complete.
3. When an item is [NOT DONE] and the user asks about it, describe what is missing and the next step — never say it is done.
4. No fake numbers, no unverified claims about the user's business. Every metric you cite must come from the data above.
5. If data is missing or zero, say so explicitly rather than assuming positive values.

Respond with clear markdown formatting. Use headings (##), bold (**text**), bullet lists (- item), numbered lists (1. item), and tables when helpful. Be concise but thorough.`;
}

/**
 * Generate a rule-based fallback response for chat questions.
 */
export function generateChatFallback(question: string, ctx: LaunchContext): string {
  const q = question.toLowerCase();
  const fmt = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const lines: string[] = [];

  // Profitability questions
  if (q.includes('profit') || q.includes('unprofitable') || q.includes('losing money')) {
    lines.push('## Understanding Your Profitability\n');
    if (ctx.campaignProfitLoss < 0) {
      lines.push(`Your current projection shows a **campaign loss of ${ctx.currency} ${Math.abs(ctx.campaignProfitLoss).toLocaleString()}**. Here's why:\n`);
      lines.push(`- **Revenue:** ${fmt(ctx.revenue)}`);
      lines.push(`- **Variable Costs:** ${fmt(ctx.variableCosts)}`);
      lines.push(`- **Ad Spend:** ${fmt(ctx.advertisingBudget)}`);
      lines.push(`- **Net Result:** ${fmt(ctx.campaignProfitLoss)}\n`);
      if (ctx.contributionPerOrder <= 0) {
        lines.push('### Critical Issue\n');
        lines.push(`Your contribution per order is **${fmt(ctx.contributionPerOrder)}**, meaning you lose money on every sale before advertising even factors in. You must either:\n`);
        lines.push('1. Increase your selling price');
        lines.push('2. Reduce product/delivery costs');
        lines.push('3. Both\n');
      } else if (ctx.roas !== null && ctx.breakEvenRoas !== null && ctx.roas < ctx.breakEvenRoas) {
        lines.push('### ROAS Gap\n');
        lines.push(`Your current ROAS (${ctx.roas.toFixed(2)}x) is below break-even (${ctx.breakEvenRoas.toFixed(2)}x). To become profitable:\n`);
        lines.push('- Improve ad creative to increase click-through rates');
        lines.push('- Optimize landing page conversion rates');
        lines.push('- Test different audience segments');
        lines.push('- Consider raising prices to improve margins');
      }
    } else {
      lines.push(`Good news! Your campaign is projected to be **profitable at ${fmt(ctx.campaignProfitLoss)}**.\n`);
      lines.push('To maximize profits:');
      lines.push('- Scale winning ad creatives');
      lines.push('- Expand to new audiences');
      lines.push('- Test upsells and bundles to increase AOV');
    }
    return lines.join('\n');
  }

  // ROAS questions
  if (q.includes('roas') || q.includes('return on ad spend')) {
    lines.push('## Improving Your ROAS\n');
    if (ctx.roas !== null) {
      lines.push(`Current ROAS: **${ctx.roas.toFixed(2)}x**\n`);
      if (ctx.breakEvenRoas !== null) {
        lines.push(`Break-even ROAS: **${ctx.breakEvenRoas.toFixed(2)}x**\n`);
        if (ctx.roas >= ctx.breakEvenRoas) {
          lines.push('✅ Your ROAS exceeds break-even — campaigns are profitable!\n');
        } else {
          lines.push('⚠️ Your ROAS is below break-even — campaigns are losing money.\n');
        }
      }
    }
    lines.push('### Strategies to Improve ROAS\n');
    lines.push('1. **Creative Testing** — Test 3-5 different ad formats (video, carousel, static)');
    lines.push('2. **Audience Refinement** — Start broad, then narrow based on conversion data');
    lines.push('3. **Landing Page Optimization** — Improve load speed, clarity, and trust signals');
    lines.push('4. **Offer Enhancement** — Add bonuses, free shipping thresholds, or bundles');
    lines.push('5. **Retargeting** — Target visitors who didn\'t convert (typically higher ROAS)');
    return lines.join('\n');
  }

  // Ad budget questions
  if (q.includes('budget') || q.includes('spend') || q.includes('increase')) {
    lines.push('## Ad Budget Recommendations\n');
    lines.push(`Current budget: **${fmt(ctx.advertisingBudget)}**\n`);
    if (ctx.campaignProfitLoss < 0) {
      lines.push('⚠️ **Caution:** Your current projection shows a loss. Before increasing budget:\n');
      lines.push('1. Fix unit economics (contribution per order must be positive)');
      lines.push('2. Achieve break-even ROAS with current budget');
      lines.push('3. Only then scale gradually (20-30% increases)\n');
    } else {
      lines.push('✅ Your economics support scaling. Consider:\n');
      lines.push('- **Test Phase:** Allocate 30% of budget across 3-5 creatives');
      lines.push('- **Scale Phase:** Shift 60-70% to winning creatives');
      lines.push('- **Reserve:** Keep 10% for testing new angles\n');
    }
    if (ctx.breakEvenOrders !== null) {
      lines.push(`**Note:** You need approximately **${ctx.breakEvenOrders} orders** to break even on your current budget.`);
    }
    return lines.join('\n');
  }

  // Orders/conversion questions
  if (q.includes('order') || q.includes('conversion') || q.includes('more sales')) {
    lines.push('## Getting More Orders\n');
    lines.push(`Expected orders: **${ctx.expectedOrders}**\n`);
    if (ctx.breakEvenOrders !== null && ctx.expectedOrders < ctx.breakEvenOrders) {
      lines.push(`⚠️ You need **${ctx.breakEvenOrders} orders** to break even, but expect only **${ctx.expectedOrders}**.\n`);
    }
    lines.push('### Tactics to Increase Orders\n');
    lines.push('1. **Increase Traffic**');
    lines.push('   - Scale winning ads');
    lines.push('   - Expand to new platforms (Meta, TikTok, Google)');
    lines.push('   - Leverage influencer partnerships\n');
    lines.push('2. **Improve Conversion Rate**');
    lines.push('   - Optimize product page (images, copy, reviews)');
    lines.push('   - Add urgency/scarcity elements');
    lines.push('   - Simplify checkout process\n');
    lines.push('3. **Enhance Offer**');
    lines.push('   - Free shipping threshold');
    lines.push('   - Bundle deals');
    lines.push('   - Limited-time bonuses');
    return lines.join('\n');
  }

  // Growth roadmap
  if (q.includes('roadmap') || q.includes('plan') || q.includes('growth')) {
    lines.push('## 30-Day Growth Roadmap\n');
    lines.push('### Week 1: Foundation\n');
    lines.push('- [ ] Finalize product photography and video assets');
    lines.push('- [ ] Set up tracking pixels and conversion events');
    lines.push('- [ ] Create 3-5 ad creative variations');
    lines.push('- [ ] Define KPI targets (CPA, ROAS, CTR)\n');
    lines.push('### Week 2: Testing\n');
    lines.push('- [ ] Launch initial campaigns with small daily budgets');
    lines.push('- [ ] Test different audiences and placements');
    lines.push('- [ ] Monitor early metrics daily');
    lines.push('- [ ] Kill underperformers quickly\n');
    lines.push('### Week 3: Optimization\n');
    lines.push('- [ ] Double down on winning creatives/audiences');
    lines.push('- [ ] A/B test landing page elements');
    lines.push('- [ ] Begin retargeting campaigns');
    lines.push('- [ ] Adjust bids based on performance\n');
    lines.push('### Week 4: Scale\n');
    lines.push('- [ ] Gradually increase budget on winners (20-30%)');
    lines.push('- [ ] Expand to lookalike audiences');
    lines.push('- [ ] Test new creative angles');
    lines.push('- [ ] Document learnings for future campaigns\n');
    if (ctx.checklistCompletionPercent < 100) {
      lines.push(`### ⚠️ Readiness Alert\n`);
      lines.push(`Your checklist is **${ctx.checklistCompletionPercent}% complete**. Address incomplete items before full launch:`);
      for (const item of ctx.incompleteChecklistItems.slice(0, 5)) {
        lines.push(`- ${item}`);
      }
    }
    return lines.join('\n');
  }

  // Default response
  lines.push('## Quick Analysis\n');
  lines.push(`Based on your simulation for **${ctx.productName || 'your product'}**:\n`);
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Selling Price | ${fmt(ctx.sellingPrice)} |`);
  lines.push(`| Contribution/Order | ${fmt(ctx.contributionPerOrder)} |`);
  lines.push(`| Campaign P/L | ${fmt(ctx.campaignProfitLoss)} |`);
  lines.push(`| ROAS | ${ctx.roas !== null ? ctx.roas.toFixed(2) + 'x' : 'N/A'} |`);
  lines.push(`| Readiness | ${ctx.checklistCompletionPercent}% |\n`);

  if (ctx.campaignProfitLoss >= 0) {
    lines.push('✅ **Your economics look healthy.** Focus on scaling what works.');
  } else {
    lines.push('⚠️ **Your campaign shows a projected loss.** Review pricing and costs before scaling.');
  }

  lines.push('\nAsk me anything specific about your product, profit, ads, or growth strategy!');
  return lines.join('\n');
}

/**
 * Handle conversational Q&A with context awareness.
 */
export async function generateChatResponse(
  question: string,
  conversationHistory: ChatMessage[],
  ctx: LaunchContext
): Promise<AIChatResult> {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';

  // If no API key, return fallback
  if (!apiKey) {
    return {
      reply: generateChatFallback(question, ctx),
      isFallback: true,
      reason: 'AI API key is not configured. Showing rule-based response.',
    };
  }

  try {
    if (provider === 'google' || provider === '') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model });

      // Build the full prompt with system context and conversation history
      const systemPrompt = buildChatSystemPrompt(ctx);
      let fullPrompt = systemPrompt + '\n\n';

      // Add conversation history
      if (conversationHistory.length > 0) {
        fullPrompt += 'CONVERSATION HISTORY:\n';
        for (const msg of conversationHistory) {
          const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';
          fullPrompt += `${roleLabel}: ${msg.content}\n\n`;
        }
      }

      fullPrompt += `USER QUESTION: ${question}`;

      const result = await genModel.generateContent(fullPrompt);

      const text = result.response.text();

      if (!text || text.trim().length === 0) {
        return {
          reply: generateChatFallback(question, ctx),
          isFallback: true,
          reason: 'AI returned an empty response.',
        };
      }

      return {
        reply: text,
        isFallback: false,
      };
    }

    // Unsupported provider — fall back
    return {
      reply: generateChatFallback(question, ctx),
      isFallback: true,
      reason: `AI provider "${provider}" is not supported for chat.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Error generating chat response:', errorMessage);
    return {
      reply: generateChatFallback(question, ctx),
      isFallback: true,
      reason: `AI service error: ${errorMessage}.`,
    };
  }
}

// ─── Product Discovery Functions ────────────────────────────────────────────

/**
 * Generate a rule-based fallback for product discovery when AI is unavailable.
 */
function generateProductDiscoveryFallback(
  filters: DiscoveryFilters,
  category: string,
  currency: string
): ProductIdea[] {
  const categoryId = `fallback-${Date.now()}`;

  const baseProducts: ProductIdea[] = [
    {
      id: `${categoryId}-1`,
      name: 'Portable LED Ring Light',
      category: 'Gadgets',
      customerProblem: 'Content creators need affordable, portable lighting for videos and photos',
      targetCustomer: 'Social media influencers, vloggers, remote workers',
      demandLevel: 'High',
      trendDirection: 'rising',
      competitionLevel: 'Medium',
      estimatedSellingPriceRange: { min: 1500, max: 3500 },
      estimatedSourcingCostRange: { min: 400, max: 800 },
      potentialMarginPercent: 65,
      shippingRisk: 'Low',
      qualityRisk: 'Medium',
      returnsRisk: 'Low',
      regulatoryRisk: 'Low',
      differentiationIdeas: ['Bundle with phone tripod', 'Add color temperature presets', 'Include carrying case'],
      validationTestSuggestion: 'Create a landing page with product mockups and run Facebook ads targeting content creators. Measure click-through rate and email signups before ordering inventory.',
      opportunityScore: {
        problemSeverity: 14,
        demandSignals: 16,
        competitionGap: 12,
        profitPotential: 16,
        sourcingShippingEase: 8,
        riskDifferentiation: 7,
        total: 73,
        explanations: {
          problemSeverity: 'Lighting is essential for content quality — clear pain point',
          demandSignals: 'Growing creator economy drives consistent demand',
          competitionGap: 'Many sellers but room for differentiated bundles',
          profitPotential: 'Strong margins possible with direct sourcing',
          sourcingShippingEase: 'Lightweight, easy to ship internationally',
          riskDifferentiation: 'Low regulatory risk, moderate quality variance from suppliers',
        },
      },
      isProvisional: true,
      evidenceSource: undefined,
      dateChecked: undefined,
      discoveryCategory: category as ProductIdea['discoveryCategory'],
      sourcing: {
        likelySupplierChannel: 'Importer',
        estimatedMinOrderQuantity: 50,
        landedCost: {
          productCostPerUnit: 500,
          shippingToPakistanPerUnit: 120,
          importDutyTaxPerUnit: 90,
          packagingPerUnit: 40,
          totalLandedCostPerUnit: 750,
        },
        marginOnLandedCostPercent: 50,
      },
    },
    {
      id: `${categoryId}-2`,
      name: 'Ergonomic Laptop Stand',
      category: 'Home',
      customerProblem: 'Remote workers suffer neck and back pain from poor laptop positioning',
      targetCustomer: 'Remote workers, students, professionals working from home',
      demandLevel: 'High',
      trendDirection: 'rising',
      competitionLevel: 'Medium',
      estimatedSellingPriceRange: { min: 2000, max: 5000 },
      estimatedSourcingCostRange: { min: 600, max: 1200 },
      potentialMarginPercent: 60,
      shippingRisk: 'Medium',
      qualityRisk: 'Low',
      returnsRisk: 'Medium',
      regulatoryRisk: 'Low',
      differentiationIdeas: ['Foldable design for portability', 'Built-in cable management', 'Adjustable height angles'],
      validationTestSuggestion: 'Post in remote work Facebook groups asking about desk setup pain points. Offer early-bird discount to gauge interest.',
      opportunityScore: {
        problemSeverity: 16,
        demandSignals: 15,
        competitionGap: 11,
        profitPotential: 14,
        sourcingShippingEase: 6,
        riskDifferentiation: 7,
        total: 69,
        explanations: {
          problemSeverity: 'Ergonomic issues cause real health problems — high motivation to solve',
          demandSignals: 'Remote work trend continues to grow globally',
          competitionGap: 'Generic stands exist but premium features are underserved',
          profitPotential: 'Good margins with aluminum/plastic variants',
          sourcingShippingEase: 'Heavier item increases shipping costs',
          riskDifferentiation: 'Low risk overall, some return risk due to fit preferences',
        },
      },
      isProvisional: true,
      evidenceSource: undefined,
      dateChecked: undefined,
      discoveryCategory: category as ProductIdea['discoveryCategory'],
      sourcing: {
        likelySupplierChannel: 'Manufacturer (Direct)',
        estimatedMinOrderQuantity: 100,
        landedCost: {
          productCostPerUnit: 800,
          shippingToPakistanPerUnit: 200,
          importDutyTaxPerUnit: 150,
          packagingPerUnit: 50,
          totalLandedCostPerUnit: 1200,
        },
        marginOnLandedCostPercent: 46,
      },
    },
    {
      id: `${categoryId}-3`,
      name: 'Reusable Silicone Food Bags',
      category: 'Lifestyle',
      customerProblem: 'Single-use plastic bags are wasteful and expensive over time',
      targetCustomer: 'Eco-conscious consumers, meal preppers, families',
      demandLevel: 'Medium',
      trendDirection: 'rising',
      competitionLevel: 'Low',
      estimatedSellingPriceRange: { min: 800, max: 2000 },
      estimatedSourcingCostRange: { min: 150, max: 400 },
      potentialMarginPercent: 70,
      shippingRisk: 'Low',
      qualityRisk: 'Low',
      returnsRisk: 'Low',
      regulatoryRisk: 'Medium',
      differentiationIdeas: ['Color-coded sets', 'Dishwasher-safe marking', 'Leak-proof guarantee'],
      validationTestSuggestion: 'Sell a small batch on marketplace platforms first. Track repeat purchase rate to validate the repeat-purchase hypothesis.',
      opportunityScore: {
        problemSeverity: 12,
        demandSignals: 13,
        competitionGap: 16,
        profitPotential: 17,
        sourcingShippingEase: 9,
        riskDifferentiation: 8,
        total: 75,
        explanations: {
          problemSeverity: 'Environmental concern is growing but not urgent for most buyers',
          demandSignals: 'Steady growth in eco-friendly product searches',
          competitionGap: 'Few local sellers in many markets',
          profitPotential: 'Excellent margins, low cost per unit',
          sourcingShippingEase: 'Very lightweight, durable, easy to ship',
          riskDifferentiation: 'Food safety regulations vary by market — check local requirements',
        },
      },
      isProvisional: true,
      evidenceSource: undefined,
      dateChecked: undefined,
      discoveryCategory: category as ProductIdea['discoveryCategory'],
      sourcing: {
        likelySupplierChannel: 'Local Wholesale Market',
        estimatedMinOrderQuantity: 200,
        landedCost: {
          productCostPerUnit: 200,
          shippingToPakistanPerUnit: 30,
          importDutyTaxPerUnit: 35,
          packagingPerUnit: 20,
          totalLandedCostPerUnit: 285,
        },
        marginOnLandedCostPercent: 64,
      },
    },
  ];

  // Adjust price ranges based on budget filter
  if (filters.budgetRange === 'Under 5K') {
    baseProducts.forEach((p) => {
      p.estimatedSellingPriceRange = { min: 500, max: 3000 };
      p.estimatedSourcingCostRange = { min: 100, max: 600 };
    });
  } else if (filters.budgetRange === '100K+') {
    baseProducts.forEach((p) => {
      p.estimatedSellingPriceRange = { min: 5000, max: 15000 };
      p.estimatedSourcingCostRange = { min: 1500, max: 4000 };
    });
  }

  return baseProducts;
}

/**
 * Build prompt for product discovery.
 */
function buildDiscoverProductsPrompt(
  filters: DiscoveryFilters,
  category: string,
  currency: string
): string {
  return `You are TrendScout AI, a product research assistant for e-commerce entrepreneurs. Your task is to suggest product ideas based on the user's criteria.

IMPORTANT SAFETY RULES:
- All data you provide must be clearly labeled as ESTIMATES or HYPOTHESES unless you can cite a specific source with a date.
- NEVER fabricate specific sales volumes, search volumes, revenue figures, or competitor counts. If you don't have real data, say "Needs validation" instead.
- Distinguish clearly between evidence-backed insights and your own hypotheses.
- Mark all products as provisional unless backed by cited sources.

FILTERS PROVIDED BY USER:
- Target Market: ${filters.targetMarket}
- Business Model: ${filters.businessModel}
- Product Category: ${filters.productCategory}
- Budget Range: ${filters.budgetRange}
- Product Type Preference: ${filters.productType}
- Preferred Niche/Problem: ${filters.preferredNiche || 'Not specified'}
- Currency: ${currency}

DISCOVERY CATEGORY: ${category}

Respond with a valid JSON array containing exactly 5 product ideas. Each product must have this exact structure:

[
  {
    "name": "string",
    "category": "string",
    "customerProblem": "string - the specific problem this product solves",
    "targetCustomer": "string - who buys this",
    "demandLevel": "Low" | "Medium" | "High",
    "trendDirection": "rising" | "stable" | "declining",
    "competitionLevel": "Low" | "Medium" | "High",
    "estimatedSellingPriceRange": { "min": number, "max": number },
    "estimatedSourcingCostRange": { "min": number, "max": number },
    "potentialMarginPercent": number (0-100),
    "shippingRisk": "Low" | "Medium" | "High",
    "qualityRisk": "Low" | "Medium" | "High",
    "returnsRisk": "Low" | "Medium" | "High",
    "regulatoryRisk": "Low" | "Medium" | "High",
    "differentiationIdeas": ["string", "string", "string"],
    "validationTestSuggestion": "string - a concrete way to validate demand before buying inventory",
    "opportunityScore": {
      "problemSeverity": number (0-20),
      "demandSignals": number (0-20),
      "competitionGap": number (0-20),
      "profitPotential": number (0-20),
      "sourcingShippingEase": number (0-10),
      "riskDifferentiation": number (0-10),
      "total": number (0-100, sum of above),
      "explanations": {
        "problemSeverity": "string",
        "demandSignals": "string",
        "competitionGap": "string",
        "profitPotential": "string",
        "sourcingShippingEase": "string",
        "riskDifferentiation": "string"
      }
    },
    "isProvisional": true,
    "evidenceSource": null or "string if available",
    "dateChecked": null or "YYYY-MM-DD if available",
    "sourcing": {
      "likelySupplierChannel": "Local Wholesale Market" | "Importer" | "Manufacturer (Direct)" | "Online Marketplace",
      "estimatedMinOrderQuantity": number,
      "landedCost": {
        "productCostPerUnit": number,
        "shippingToPakistanPerUnit": number,
        "importDutyTaxPerUnit": number,
        "packagingPerUnit": number,
        "totalLandedCostPerUnit": number (sum of above four)
      },
      "marginOnLandedCostPercent": number (0-100, calculated as (midpoint of sellingPriceRange - totalLandedCostPerUnit) / midpoint of sellingPriceRange * 100)
    }
  }
]

Generate products specifically relevant to the "${category}" category. Make suggestions practical for the ${filters.targetMarket} market with a ${filters.businessModel} model. Ensure all prices are realistic for the ${currency} currency context.

Return ONLY the JSON array, no additional text.`;
}

/**
 * Discover products using AI or fallback.
 */
export async function discoverProducts(
  filters: DiscoveryFilters,
  category: string,
  currency: string
): Promise<DiscoverProductsResult> {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    return {
      products: generateProductDiscoveryFallback(filters, category, currency),
      isFallback: true,
      reason: 'AI API key is not configured. Showing rule-based product suggestions.',
    };
  }

  try {
    if (provider === 'google' || provider === '') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model });
      const prompt = buildDiscoverProductsPrompt(filters, category, currency);
      const result = await genModel.generateContent(prompt);
      const text = result.response.text();

      if (!text || text.trim().length === 0) {
        return {
          products: generateProductDiscoveryFallback(filters, category, currency),
          isFallback: true,
          reason: 'AI returned an empty response. Showing rule-based suggestions.',
        };
      }

      // Try to parse JSON from the response
      try {
        // Strip markdown code fences if present
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(jsonText);
        const products: ProductIdea[] = Array.isArray(parsed) ? parsed : [parsed];

        // Add IDs and ensure required fields
        const enrichedProducts = products.map((p, i) => {
          // Compute landed cost total if AI provided breakdown but not total
          const sourcing = p.sourcing ? {
            ...p.sourcing,
            landedCost: {
              ...p.sourcing.landedCost,
              totalLandedCostPerUnit: p.sourcing.landedCost?.totalLandedCostPerUnit ??
                ((p.sourcing.landedCost?.productCostPerUnit || 0) +
                 (p.sourcing.landedCost?.shippingToPakistanPerUnit || 0) +
                 (p.sourcing.landedCost?.importDutyTaxPerUnit || 0) +
                 (p.sourcing.landedCost?.packagingPerUnit || 0)),
            },
            marginOnLandedCostPercent: p.sourcing.marginOnLandedCostPercent ?? (() => {
              const midSell = ((p.estimatedSellingPriceRange?.min || 0) + (p.estimatedSellingPriceRange?.max || 0)) / 2;
              const totalLC = p.sourcing.landedCost?.totalLandedCostPerUnit || 0;
              return midSell > 0 ? Math.round(((midSell - totalLC) / midSell) * 100) : 0;
            })(),
          } : undefined;

          return {
            ...p,
            id: `ai-${Date.now()}-${i}`,
            discoveryCategory: category,
            isProvisional: p.isProvisional ?? true,
            sourcing,
            opportunityScore: {
              ...p.opportunityScore,
              total: p.opportunityScore?.total ?? 
                (p.opportunityScore?.problemSeverity || 0) +
                (p.opportunityScore?.demandSignals || 0) +
                (p.opportunityScore?.competitionGap || 0) +
                (p.opportunityScore?.profitPotential || 0) +
                (p.opportunityScore?.sourcingShippingEase || 0) +
                (p.opportunityScore?.riskDifferentiation || 0),
            },
          };
        });

        return {
          products: enrichedProducts,
          isFallback: false,
        };
      } catch (parseError) {
        console.error('[AI Service] Failed to parse product discovery JSON:', parseError);
        return {
          products: generateProductDiscoveryFallback(filters, category, currency),
          isFallback: true,
          reason: 'AI response could not be parsed. Showing rule-based suggestions.',
        };
      }
    }

    return {
      products: generateProductDiscoveryFallback(filters, category, currency),
      isFallback: true,
      reason: `AI provider "${provider}" is not supported. Showing rule-based suggestions.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Error discovering products:', errorMessage);
    return {
      products: generateProductDiscoveryFallback(filters, category, currency),
      isFallback: true,
      reason: `AI service error: ${errorMessage}. Showing template-based suggestions.`,
    };
  }
}

/**
 * Build system prompt for TrendScout chat.
 */
function buildTrendScoutSystemPrompt(filters: DiscoveryFilters, currency: string, researchData?: ResearchData): string {
  let researchContext = '';
  
  if (researchData && researchData.observations.length > 0) {
    const statusLabels: Record<EvidenceStatus, string> = {
      'ai-idea': 'AI-Generated Idea (unverified)',
      'researching': 'Research In Progress',
      'partially-verified': 'Partially Verified',
      'evidence-collected': 'Evidence Collected',
    };
    
    researchContext = `

USER'S RESEARCH DATA FOR ${researchData.productName || 'SELECTED PRODUCT'}:
Evidence Status: ${statusLabels[researchData.status]}
Number of Competitor Observations: ${researchData.observations.length}

RECORDED COMPETITOR OBSERVATIONS:
${researchData.observations.map((obs, i) => `
${i + 1}. ${obs.competitorName || obs.sellerName || 'Unnamed competitor'}
   - Price: ${obs.price > 0 ? `${obs.currency} ${obs.price.toLocaleString()}` : 'Not recorded'}
   - Availability: ${obs.availability || 'Not recorded'}
   - Date Checked: ${obs.dateChecked || 'Not recorded'}
   - Product URL: ${obs.productUrl || 'Not provided'}
   - Quality Notes: ${obs.qualityNotes || 'None'}
   - Review Insights: ${obs.reviewNotes || 'None'}
   - Differentiation Opportunities: ${obs.differentiationNotes || 'None'}
   - Customer Complaints: ${obs.complaintNotes || 'None'}
`).join('')}

IMPORTANT: The above observations are USER-RECORDED EVIDENCE from manual research. When answering:
- Reference specific recorded evidence when relevant (e.g., "Based on your observation of [competitor] at [price]...")
- Clearly distinguish between user-provided evidence and AI-generated hypotheses
- If the user asks about prices or availability you don't have in the recorded evidence, tell them to verify through search links
- NEVER fabricate market statistics, competitor counts, or trend data not present in the recorded observations
- Suggest what additional research might be needed based on gaps in the current observations
`;
  } else {
    researchContext = `

NOTE: The user has not yet conducted manual research for this product. If they ask about specific competitors, prices, or market conditions:
- Suggest they use the Research panel to conduct manual research
- Explain what information to look for (competitor names, prices, availability, customer reviews)
- Provide guidance on how to validate the product idea through the search links in the Research panel
- Clearly label any estimates as AI-generated hypotheses that need verification
`;
  }

  return `You are TrendScout AI, a product research and market analysis assistant for e-commerce entrepreneurs. You help users find profitable product opportunities, understand market dynamics, and validate business ideas.

CURRENT FILTER CONTEXT:
- Target Market: ${filters.targetMarket}
- Business Model: ${filters.businessModel}
- Product Category: ${filters.productCategory}
- Budget Range: ${filters.budgetRange}
- Product Type: ${filters.productType}
- Preferred Niche: ${filters.preferredNiche || 'Not specified'}
- Currency: ${currency}
${researchContext}
SAFETY RULES:
- Always label estimates as estimates. Never present fabricated data as fact.
- If you lack real-time data, say so and suggest how the user can validate.
- Be practical and actionable — focus on what the user can do next.
- Ground recommendations in the user's filter context AND any recorded research evidence.
- NEVER invent current prices, sources, statistics, or verification dates.
- When referencing user-provided evidence, clearly state "Based on your recorded observation..." or similar.
- When providing AI-generated hypotheses, clearly state "This is an estimate/hypothesis that needs verification."

Respond with clear markdown formatting. Use headings, bullet lists, and tables when helpful.`;
}

/**
 * Generate TrendScout chat fallback response.
 */
function generateTrendScoutChatFallback(question: string, filters: DiscoveryFilters, currency: string): string {
  const q = question.toLowerCase();
  const lines: string[] = [];

  if (q.includes('product') && (q.includes('find') || q.includes('suggest') || q.includes('recommend'))) {
    lines.push('## Product Suggestions\n');
    lines.push(`Based on your filters (${filters.targetMarket}, ${filters.businessModel}, ${filters.productCategory}):\n`);
    lines.push('Consider exploring these directions:');
    lines.push('1. Products that solve everyday frustrations in your target market');
    lines.push('2. Items with rising social media engagement but limited local availability');
    lines.push('3. Repeat-purchase consumables in your category');
    lines.push('\n**Note:** Live AI is unavailable. Connect the AI service for personalized suggestions.');
    return lines.join('\n');
  }

  if (q.includes('validat') || q.includes('test')) {
    lines.push('## Validation Framework\n');
    lines.push('Before investing in inventory, validate demand with these steps:\n');
    lines.push('1. **Landing Page Test** — Create a simple product page with mockups');
    lines.push('2. **Ad Spend Test** — Run $20-50 in ads to measure click-through rate');
    lines.push('3. **Pre-order Campaign** — Offer early-bird pricing to gauge commitment');
    lines.push('4. **Community Feedback** — Post in relevant groups/forums for honest opinions');
    lines.push('5. **Competitor Analysis** — Study reviews of similar products for gaps');
    return lines.join('\n');
  }

  if (q.includes('demand') || q.includes('trend')) {
    lines.push('## Assessing Demand\n');
    lines.push('Look for these signals of rising demand:\n');
    lines.push('- Increasing social media mentions and hashtags');
    lines.push('- Growing search volume on marketplace platforms');
    lines.push('- New entrants entering the space (validates market)');
    lines.push('- Influencer/content creator adoption');
    lines.push('- Seasonal patterns showing upward trajectory');
    lines.push('\n**Note:** For real-time data, use tools like Google Trends, TikTok Creative Center, or marketplace analytics.');
    return lines.join('\n');
  }

  if (q.includes('launch') || q.includes('plan') || q.includes('step')) {
    lines.push('## Launch Planning Steps\n');
    lines.push('1. Validate demand (see validation framework)');
    lines.push('2. Source samples from 3+ suppliers');
    lines.push('3. Calculate unit economics including all costs');
    lines.push('4. Create product photography and video assets');
    lines.push('5. Set up store and payment processing');
    lines.push('6. Prepare ad creatives (minimum 3 variations)');
    lines.push('7. Launch with conservative daily budget');
    lines.push('8. Monitor KPIs daily for first 2 weeks');
    lines.push('9. Optimize based on data, scale winners');
    return lines.join('\n');
  }

  lines.push('## TrendScout Assistant\n');
  lines.push(`I'm here to help you find product opportunities for the ${filters.targetMarket} market.\n`);
  lines.push('Try asking about:');
  lines.push('- Finding products for your budget range');
  lines.push('- Validating demand before buying inventory');
  lines.push('- Understanding market trends in your category');
  lines.push('- Step-by-step launch planning');
  lines.push('\n**Note:** Live AI responses require the AI service to be connected.');
  return lines.join('\n');
}

/**
 * Handle TrendScout conversational Q&A.
 */
export async function generateTrendScoutResponse(
  question: string,
  conversationHistory: ChatMessage[],
  filters: DiscoveryFilters,
  currency: string,
  researchData?: ResearchData
): Promise<AIChatResult> {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    return {
      reply: generateTrendScoutChatFallback(question, filters, currency),
      isFallback: true,
      reason: 'AI API key is not configured. Showing rule-based response.',
    };
  }

  try {
    if (provider === 'google' || provider === '') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model });

      const systemPrompt = buildTrendScoutSystemPrompt(filters, currency, researchData);
      let fullPrompt = systemPrompt + '\n\n';

      if (conversationHistory.length > 0) {
        fullPrompt += 'CONVERSATION HISTORY:\n';
        for (const msg of conversationHistory) {
          const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';
          fullPrompt += `${roleLabel}: ${msg.content}\n\n`;
        }
      }

      fullPrompt += `USER QUESTION: ${question}`;

      const result = await genModel.generateContent(fullPrompt);
      const text = result.response.text();

      if (!text || text.trim().length === 0) {
        return {
          reply: generateTrendScoutChatFallback(question, filters, currency),
          isFallback: true,
          reason: 'AI returned an empty response.',
        };
      }

      return {
        reply: text,
        isFallback: false,
      };
    }

    return {
      reply: generateTrendScoutChatFallback(question, filters, currency),
      isFallback: true,
      reason: `AI provider "${provider}" is not supported.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Error generating TrendScout response:', errorMessage);
    return {
      reply: generateTrendScoutChatFallback(question, filters, currency),
      isFallback: true,
      reason: `AI service error: ${errorMessage}.`,
    };
  }
}

/**
 * Generate a validation plan for a product idea.
 */
export async function generateValidationPlan(
  product: ProductIdea,
  currency: string
): Promise<ValidateProductResult> {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';

  const fallbackPlan = `## Validation Plan for ${product.name}

### Phase 1: Market Research (Week 1)
- Search marketplace platforms for similar products
- Analyze competitor pricing, reviews, and ratings
- Identify gaps in existing offerings
- Survey potential customers in target communities

### Phase 2: Demand Testing (Week 2)
- Create a simple landing page with product mockups
- Run targeted ads (${currency} 2,000-5,000 budget)
- Measure click-through rate and email signups
- Target CTR above 2% indicates strong interest

### Phase 3: Pre-Sell Test (Week 3)
- Offer pre-orders at discounted price
- Aim for 10+ pre-orders to validate willingness to pay
- Collect customer feedback on pricing and features
- Refine offer based on responses

### Phase 4: Sample Sourcing (Week 4)
- Order samples from 3+ suppliers
- Test quality, packaging, and shipping times
- Calculate actual landed costs
- Verify product matches marketing claims

### Phase 5: Soft Launch (Week 5-6)
- List on primary sales channel
- Start with conservative ad budget
- Monitor conversion rate, ROAS, and customer feedback
- Iterate quickly based on early data

**Estimated validation budget:** ${currency} 10,000-25,000
**Timeline:** 5-6 weeks to validated go/no-go decision

*This is a rule-based template. Connect AI service for personalized validation plans.*`;

  if (!apiKey) {
    return {
      validationPlan: fallbackPlan,
      isFallback: true,
      reason: 'AI API key is not configured.',
    };
  }

  try {
    if (provider === 'google' || provider === '') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model });

      const prompt = `You are a product validation expert. Create a detailed, step-by-step validation plan for this product idea:

PRODUCT: ${product.name}
CATEGORY: ${product.category}
PROBLEM IT SOLVES: ${product.customerProblem}
TARGET CUSTOMER: ${product.targetCustomer}
ESTIMATED PRICE RANGE: ${currency} ${product.estimatedSellingPriceRange.min}-${product.estimatedSellingPriceRange.max}
ESTIMATED COST RANGE: ${currency} ${product.estimatedSourcingCostRange.min}-${product.estimatedSourcingCostRange.max}
POTENTIAL MARGIN: ${product.potentialMarginPercent}%
KEY RISKS: Shipping=${product.shippingRisk}, Quality=${product.qualityRisk}, Returns=${product.returnsRisk}, Regulatory=${product.regulatoryRisk}

Provide a structured validation plan with:
1. Specific research steps with estimated costs
2. Demand testing methodology with success metrics
3. Sample sourcing strategy
4. Soft launch approach
5. Decision criteria (go/no-go thresholds)
6. Timeline and budget estimate

Format with clear markdown headings and bullet points. Be specific and actionable.`;

      const result = await genModel.generateContent(prompt);
      const text = result.response.text();

      if (!text || text.trim().length === 0) {
        return {
          validationPlan: fallbackPlan,
          isFallback: true,
          reason: 'AI returned an empty response.',
        };
      }

      return {
        validationPlan: text,
        isFallback: false,
      };
    }

    return {
      validationPlan: fallbackPlan,
      isFallback: true,
      reason: `AI provider "${provider}" is not supported.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Error generating validation plan:', errorMessage);
    return {
      validationPlan: fallbackPlan,
      isFallback: true,
      reason: `AI service error: ${errorMessage}.`,
    };
  }
}
