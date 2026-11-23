import { useMemo, useCallback } from 'react';
import { WHATSAPP_NUMBER } from '@/utils/contact';
import type { VerdictCardData } from '@/components/VerdictCard';

export interface SimulatorVerdictInput {
  productName: string;
  revenue: number;
  profit: number;
  roas: number | null;
  breakEvenRoas: number | null;
  deliveryRate: number;
  currency: string;
}

export interface DecisionEngineVerdictInput {
  productName: string;
  decision: 'GO' | 'TEST FIRST' | 'NO-GO';
  /** Expected contribution per placed order x expected orders ~ revenue proxy */
  revenue: number;
  profit: number;
  roas: number | null;
  breakEvenRoas: number | null;
  deliveryRate: number;
  currency: string;
}

// Plain-text verdict labels for WhatsApp share messages.
// Emoji characters are intentionally omitted here because repeated source-file
// encoding corruption turned them into U+FFFD replacement characters in the
// generated URL. The VerdictCard canvas component renders emoji correctly;
// only the WhatsApp share text uses these plain labels.
const GO_LABEL = "GO";
const NOGO_LABEL = "NO-GO";
const EM_DASH = "\u2014";

/**
 * Determines GO / NO-GO based on actual ROAS vs break-even ROAS.
 * GO when actual ROAS >= break-even ROAS, NO-GO otherwise.
 */
function determineGoNoGo(roas: number | null, breakEvenRoas: number | null): 'GO' | 'NO-GO' {
  if (roas === null || breakEvenRoas === null) return 'NO-GO';
  if (!isFinite(breakEvenRoas)) return 'NO-GO';
  return roas >= breakEvenRoas ? 'GO' : 'NO-GO';
}

/**
 * Hook that builds the WhatsApp share message and verdict card data
 * from simulation or decision-engine results.
 *
 * All values are reactive -- they update whenever inputs change.
 */
export function useSimulatorVerdictShare(input: SimulatorVerdictInput) {
  const verdict = useMemo(
    () => determineGoNoGo(input.roas, input.breakEvenRoas),
    [input.roas, input.breakEvenRoas]
  );

  const cardData: VerdictCardData = useMemo(
    () => ({
      productName: input.productName,
      verdict,
      revenue: input.revenue,
      profit: input.profit,
      roas: input.roas,
      breakEvenRoas: input.breakEvenRoas,
      deliveryRate: input.deliveryRate,
      currency: input.currency,
    }),
    [input, verdict]
  );

  const whatsappMessage = useMemo(() => {
    const badge = verdict === 'GO' ? GO_LABEL : NOGO_LABEL;
    const revStr = `${input.currency} ${input.revenue.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
    const profStr = `${input.currency} ${input.profit.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
    const roasStr = input.roas !== null && isFinite(input.roas) ? `${input.roas.toFixed(2)}x` : 'N/A';
    const beRoasStr = input.breakEvenRoas !== null && isFinite(input.breakEvenRoas) ? `${input.breakEvenRoas.toFixed(2)}x` : 'N/A';
    const name = input.productName || 'Untitled Product';

    return `LaunchLens AI verdict: ${badge} ${EM_DASH} ${name}. Revenue ${revStr}, Profit ${profStr}, ROAS ${roasStr}, Break-Even ROAS ${beRoasStr}. Delivery rate ${input.deliveryRate}%.`;
  }, [verdict, input]);

  const openWhatsApp = useCallback(() => {
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  }, [whatsappMessage]);

  return { verdict, cardData, whatsappMessage, openWhatsApp };
}

/**
 * Hook for the Decision Engine page. The decision engine has its own
 * GO/TEST FIRST/NO-GO logic, but for the WhatsApp share we simplify
 * to GO (when decision === 'GO') or NO-GO (otherwise).
 */
export function useDecisionEngineVerdictShare(input: DecisionEngineVerdictInput) {
  // For the share card, map the 3-state decision to binary GO/NO-GO
  const verdict: 'GO' | 'NO-GO' = useMemo(
    () => (input.decision === 'GO' ? 'GO' : 'NO-GO'),
    [input.decision]
  );

  const cardData: VerdictCardData = useMemo(
    () => ({
      productName: input.productName,
      verdict,
      revenue: input.revenue,
      profit: input.profit,
      roas: input.roas,
      breakEvenRoas: input.breakEvenRoas,
      deliveryRate: input.deliveryRate,
      currency: input.currency,
    }),
    [input, verdict]
  );

  const whatsappMessage = useMemo(() => {
    const badge = verdict === 'GO' ? GO_LABEL : NOGO_LABEL;
    const revStr = `${input.currency} ${input.revenue.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
    const profStr = `${input.currency} ${input.profit.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
    const roasStr = input.roas !== null && isFinite(input.roas) ? `${input.roas.toFixed(2)}x` : 'N/A';
    const beRoasStr = input.breakEvenRoas !== null && isFinite(input.breakEvenRoas) ? `${input.breakEvenRoas.toFixed(2)}x` : 'N/A';
    const name = input.productName || 'Untitled Product';

    return `LaunchLens AI verdict: ${badge} ${EM_DASH} ${name}. Revenue ${revStr}, Profit ${profStr}, ROAS ${roasStr}, Break-Even ROAS ${beRoasStr}. Delivery rate ${input.deliveryRate}%.`;
  }, [verdict, input]);

  const openWhatsApp = useCallback(() => {
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  }, [whatsappMessage]);

  return { verdict, cardData, whatsappMessage, openWhatsApp };
}
