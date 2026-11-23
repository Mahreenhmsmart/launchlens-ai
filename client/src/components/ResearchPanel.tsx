import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
  Globe,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Modal, Button, Card, Input, Field, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { CURRENCIES, roundTwo } from '@/utils/currency';
import type {
  ProductIdea,
  EvidenceStatus,
  CompetitorObservation,
  ProductResearch,
  TargetMarket,
} from '@/types';

interface ResearchPanelProps {
  product: ProductIdea | null;
  open: boolean;
  onClose: () => void;
  researchData: ProductResearch | undefined;
  onSave: (research: ProductResearch) => void;
  targetMarket?: TargetMarket;
  className?: string;
}

const EVIDENCE_STATUS_OPTIONS: { value: EvidenceStatus; label: string; color: string }[] = [
  { value: 'ai-idea', label: 'AI-Generated Idea', color: 'bg-muted text-muted-foreground' },
  { value: 'researching', label: 'Research In Progress', color: 'bg-[#EACAA1]/10 text-[#EACAA1]' },
  { value: 'partially-verified', label: 'Partially Verified', color: 'bg-[#C9D0FC]/10 text-[#C9D0FC]' },
  { value: 'evidence-collected', label: 'Evidence Collected', color: 'bg-[#9DD37D]/10 text-[#9DD37D]' },
];

function getCountryCode(market: TargetMarket): string {
  const countryCodes: Record<TargetMarket, string> = {
    'Pakistan': 'PK',
    'India': 'IN',
    'USA': 'US',
    'UK': 'GB',
    'UAE': 'AE',
    'Saudi Arabia': 'SA',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'Other': 'US', // Default to US for "Other"
  };
  return countryCodes[market] || 'US';
}

function getMarketplaceUrl(productName: string, market: TargetMarket): { name: string; url: string; icon: React.ElementType }[] {
  const encodedProduct = encodeURIComponent(productName);
  const encodedCountry = encodeURIComponent(market);
  const countryCode = getCountryCode(market);
  const links: { name: string; url: string; icon: React.ElementType }[] = [];

  // Default marketplace based on target market
  switch (market) {
    case 'Pakistan':
      links.push({ name: 'Daraz Pakistan', url: `https://www.daraz.pk/catalog/?q=${encodedProduct}`, icon: ShoppingBag });
      break;
    case 'India':
      links.push({ name: 'Amazon India', url: `https://www.amazon.in/s?k=${encodedProduct}`, icon: ShoppingBag });
      break;
    case 'USA':
    case 'Canada':
      links.push({ name: 'Amazon US', url: `https://www.amazon.com/s?k=${encodedProduct}`, icon: ShoppingBag });
      break;
    case 'UK':
      links.push({ name: 'Amazon UK', url: `https://www.amazon.co.uk/s?k=${encodedProduct}`, icon: ShoppingBag });
      break;
    case 'UAE':
    case 'Saudi Arabia':
      links.push({ name: 'Amazon.ae', url: `https://www.amazon.ae/s?k=${encodedProduct}`, icon: ShoppingBag });
      break;
    case 'Germany':
      links.push({ name: 'Amazon.de', url: `https://www.amazon.de/s?k=${encodedProduct}`, icon: ShoppingBag });
      break;
    case 'Australia':
      links.push({ name: 'Amazon AU', url: `https://www.amazon.com.au/s?k=${encodedProduct}`, icon: ShoppingBag });
      break;
    default:
      links.push({ name: 'Daraz Pakistan', url: `https://www.daraz.pk/catalog/?q=${encodedProduct}`, icon: ShoppingBag });
  }

  // Always add Google Search and Trends with proper country parameters
  links.push(
    { 
      name: 'Google Search', 
      url: `https://www.google.com/search?q=${encodedProduct}+${encodedCountry}`, 
      icon: Search 
    },
    { 
      name: 'Google Trends', 
      url: `https://trends.google.com/trends/explore?q=${encodedProduct}&geo=${countryCode}`, 
      icon: TrendingUp 
    }
  );

  return links;
}

function generateObservationId(): string {
  return `obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyObservation(currency: string): CompetitorObservation {
  return {
    id: generateObservationId(),
    competitorName: '',
    sellerName: '',
    price: 0,
    currency,
    productUrl: '',
    availability: '',
    deliveryNotes: '',
    dateChecked: new Date().toISOString().split('T')[0],
    qualityNotes: '',
    reviewNotes: '',
    differentiationNotes: '',
    complaintNotes: '',
  };
}

export default function ResearchPanel({
  product,
  open,
  onClose,
  researchData,
  onSave,
  targetMarket = 'Pakistan',
  className,
}: ResearchPanelProps) {
  const [status, setStatus] = useState<EvidenceStatus>('ai-idea');
  const [observations, setObservations] = useState<CompetitorObservation[]>([]);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [expandedObs, setExpandedObs] = useState<Set<string>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  // Initialize from existing research data or defaults
  useEffect(() => {
    if (researchData) {
      setStatus(researchData.status);
      setObservations(researchData.observations);
      setSummaryNotes(researchData.summaryNotes);
    } else {
      setStatus('ai-idea');
      setObservations([]);
      setSummaryNotes('');
    }
    setSaveSuccess(false);
  }, [researchData, open]);

  const handleAddObservation = useCallback(() => {
    const defaultCurrency = targetMarket === 'Pakistan' ? 'PKR' : 
                           targetMarket === 'USA' || targetMarket === 'Canada' ? 'USD' :
                           targetMarket === 'UK' ? 'GBP' :
                           targetMarket === 'UAE' ? 'AED' :
                           targetMarket === 'Saudi Arabia' ? 'SAR' :
                           targetMarket === 'India' ? 'INR' :
                           targetMarket === 'Australia' ? 'AUD' :
                           targetMarket === 'Germany' ? 'EUR' : 'PKR';
    setObservations((prev) => [...prev, createEmptyObservation(defaultCurrency)]);
  }, [targetMarket]);

  const handleRemoveObservation = useCallback((id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const handleUpdateObservation = useCallback((id: string, field: keyof CompetitorObservation, value: string | number) => {
    setObservations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedObs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!product) return;
    
    const research: ProductResearch = {
      productId: product.id,
      productName: product.name,
      customerProblem: product.customerProblem,
      status,
      observations,
      summaryNotes,
      lastUpdated: new Date().toISOString(),
    };
    
    onSave(research);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, [product, status, observations, summaryNotes, onSave]);

  const handleGenerateSummary = useCallback(() => {
    if (!product) return;

    // Check if there are any competitor observations
    if (observations.length === 0) {
      setGeneratedSummary(
        'No competitor research has been recorded yet. Add competitor observations using the form above to generate a complete research summary.'
      );
      return;
    }

    const lines: string[] = [];
    
    // Product Details Section
    lines.push('=== PRODUCT RESEARCH SUMMARY ===');
    lines.push('');
    lines.push('PRODUCT DETAILS:');
    lines.push(`• Name: ${product.name}`);
    lines.push(`• Category: ${product.category || 'Not provided'}`);
    lines.push(`• Problem Solved: ${product.customerProblem || 'Not provided'}`);
    lines.push(`• Target Customer: ${product.targetCustomer || 'Not provided'}`);
    lines.push('');

    // Competitor Analysis Section
    lines.push('COMPETITOR OBSERVATIONS:');
    lines.push(`Total competitors researched: ${observations.length}`);
    lines.push('');
    
    observations.forEach((obs, index) => {
      const name = obs.competitorName || obs.sellerName || `Competitor #${index + 1}`;
      lines.push(`${index + 1}. ${name}`);
      
      if (obs.price > 0) {
        lines.push(`   • Price: ${obs.currency} ${obs.price.toLocaleString()}`);
      } else {
        lines.push('   • Price: Not provided');
      }
      
      if (obs.productUrl) {
        lines.push(`   • URL: ${obs.productUrl}`);
      }
      
      if (obs.availability) {
        lines.push(`   • Availability: ${obs.availability}`);
      }
      
      if (obs.dateChecked) {
        lines.push(`   • Date Checked: ${obs.dateChecked}`);
      }
      
      if (obs.deliveryNotes) {
        lines.push(`   • Delivery Notes: ${obs.deliveryNotes}`);
      }
      
      if (obs.qualityNotes) {
        lines.push(`   • Quality Notes: ${obs.qualityNotes}`);
      }
      
      if (obs.reviewNotes) {
        lines.push(`   • Review Insights: ${obs.reviewNotes}`);
      }
      
      if (obs.differentiationNotes) {
        lines.push(`   • Differentiation Opportunities: ${obs.differentiationNotes}`);
      }
      
      if (obs.complaintNotes) {
        lines.push(`   • Customer Complaints: ${obs.complaintNotes}`);
      }
      
      lines.push('');
    });

    // Market Gaps (from differentiation notes)
    const differentiationInsights = observations
      .filter(obs => obs.differentiationNotes && obs.differentiationNotes.trim())
      .map(obs => obs.differentiationNotes);
    
    if (differentiationInsights.length > 0) {
      lines.push('MARKET GAPS IDENTIFIED:');
      differentiationInsights.forEach((insight, idx) => {
        lines.push(`${idx + 1}. ${insight}`);
      });
      lines.push('');
    }

    // Risks (from complaint notes)
    const riskInsights = observations
      .filter(obs => obs.complaintNotes && obs.complaintNotes.trim())
      .map(obs => obs.complaintNotes);
    
    if (riskInsights.length > 0) {
      lines.push('RISKS NOTED:');
      riskInsights.forEach((risk, idx) => {
        lines.push(`${idx + 1}. ${risk}`);
      });
      lines.push('');
    }

    // Summary Notes
    if (summaryNotes && summaryNotes.trim()) {
      lines.push('RECOMMENDED NEXT STEPS:');
      lines.push(summaryNotes);
      lines.push('');
    }

    lines.push(`Research Status: ${EVIDENCE_STATUS_OPTIONS.find(s => s.value === status)?.label || status}`);
    lines.push(`Last Updated: ${new Date().toLocaleString()}`);

    setGeneratedSummary(lines.join('\n'));
  }, [product, observations, summaryNotes, status]);

  if (!product) return null;

  const searchLinks = getMarketplaceUrl(product.name, targetMarket);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Research: ${product.name}`}
      className={cn('max-w-4xl max-h-[90vh] overflow-hidden', className)}
      footer={
        <div
          className="flex items-center justify-between w-full"
          data-icod-id="src_components_researchpanel_tsx_776c">
          <span
            className="text-xs text-muted-foreground"
            data-icod-id="src_components_researchpanel_tsx_73dc">
            Last saved: {researchData?.lastUpdated ? new Date(researchData.lastUpdated).toLocaleString() : 'Never'}
          </span>
          <div
            className="flex gap-2"
            data-icod-id="src_components_researchpanel_tsx_fc90">
            <Button
              variant="outline"
              onClick={onClose}
              data-icod-id="src_components_researchpanel_tsx_df9b">
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="gap-2"
              data-icod-id="src_components_researchpanel_tsx_aa5a">
              <Save className="h-4 w-4" data-icod-id="src_components_researchpanel_tsx_3ca9" />
              {saveSuccess ? 'Saved!' : 'Save Research'}
            </Button>
          </div>
        </div>
      }
      data-icod-id="src_components_researchpanel_tsx_c9b5">
      <div
        className="flex flex-col gap-6 overflow-y-auto max-h-[calc(90vh-140px)] pr-2"
        data-icod-id="src_components_researchpanel_tsx_d0e6">
        {/* Product Header with Status */}
        <section
          className="space-y-3"
          data-icod-id="src_components_researchpanel_tsx_2112">
          <div
            className="flex items-start justify-between gap-4"
            data-icod-id="src_components_researchpanel_tsx_a6f2">
            <div
              className="space-y-1"
              data-icod-id="src_components_researchpanel_tsx_79cd">
              <h3
                className="text-lg font-semibold text-foreground"
                data-icod-id="src_components_researchpanel_tsx_bb7a">{product.name}</h3>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_components_researchpanel_tsx_13fe">{product.customerProblem}</p>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EvidenceStatus)}
              className={cn(
                'rounded-lg border border-border px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring',
                EVIDENCE_STATUS_OPTIONS.find((o) => o.value === status)?.color
              )}
              data-icod-id="src_components_researchpanel_tsx_645c">
              {EVIDENCE_STATUS_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-icod-id={`src_components_researchpanel_tsx_0f5c_${opt.value}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Search Links Section */}
        <section
          className="space-y-3"
          data-icod-id="src_components_researchpanel_tsx_c7e2">
          <h4
            className="text-sm font-semibold text-foreground flex items-center gap-2"
            data-icod-id="src_components_researchpanel_tsx_a38c">
            <Search
              className="h-4 w-4 text-[#C9D0FC]"
              data-icod-id="src_components_researchpanel_tsx_554d" />
            Research Links
          </h4>
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            data-icod-id="src_components_researchpanel_tsx_f835">
            {searchLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm font-medium text-foreground transition-colors hover:border-[#C9D0FC]/50 hover:bg-muted/50"
                data-icod-id={`src_components_researchpanel_tsx_65c0_${link.name}`}>
                <link.icon className="h-4 w-4 text-[#C9D0FC]" />
                <span
                  className="flex-1 truncate"
                  data-icod-id={`src_components_researchpanel_tsx_5902_${link.name}`}>{link.name}</span>
                <ExternalLink
                  className="h-3 w-3 text-muted-foreground"
                  data-icod-id={`src_components_researchpanel_tsx_0290_${link.name}`} />
              </a>
            ))}
          </div>
          <Alert
            variant="info"
            className="text-xs"
            data-icod-id="src_components_researchpanel_tsx_ea69">
            <div
              className="flex items-start gap-2"
              data-icod-id="src_components_researchpanel_tsx_33d7">
              <AlertTriangle
                className="mt-0.5 h-3 w-3 shrink-0"
                data-icod-id="src_components_researchpanel_tsx_f719" />
              <span data-icod-id="src_components_researchpanel_tsx_91d0">These links open external sites. LaunchLens has not visited or verified any results from these sources.</span>
            </div>
          </Alert>
        </section>

        {/* Competitor Observations */}
        <section
          className="space-y-3"
          data-icod-id="src_components_researchpanel_tsx_0499">
          <div
            className="flex items-center justify-between"
            data-icod-id="src_components_researchpanel_tsx_bd21">
            <h4
              className="text-sm font-semibold text-foreground flex items-center gap-2"
              data-icod-id="src_components_researchpanel_tsx_ed92">
              <Globe
                className="h-4 w-4 text-[#E88B9E]"
                data-icod-id="src_components_researchpanel_tsx_d1e6" />
              Competitor Observations ({observations.length})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddObservation}
              className="gap-1 text-xs"
              data-icod-id="src_components_researchpanel_tsx_a996">
              <Plus className="h-3 w-3" data-icod-id="src_components_researchpanel_tsx_3397" />
              Add Competitor
            </Button>
          </div>

          {observations.length === 0 && (
            <div
              className="rounded-lg border border-dashed border-border p-6 text-center"
              data-icod-id="src_components_researchpanel_tsx_d0c5">
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_components_researchpanel_tsx_3981">
                No competitor observations yet. Click "Add Competitor" to start recording market research.
              </p>
            </div>
          )}

          <div
            className="space-y-3"
            data-icod-id="src_components_researchpanel_tsx_ba1a">
            {observations.map((obs, index) => {
              const isExpanded = expandedObs.has(obs.id);
              return (
                <Card
                  key={obs.id}
                  variant={index % 3 === 0 ? 'lavender' : index % 3 === 1 ? 'mint' : 'cream'}
                  className="overflow-hidden"
                  data-icod-id={`src_components_researchpanel_tsx_5b1b_${obs.id}`}>
                  <div
                    className="p-3"
                    data-icod-id={`src_components_researchpanel_tsx_0dcc_${obs.id}`}>
                    <div
                      className="flex items-center justify-between gap-2"
                      data-icod-id={`src_components_researchpanel_tsx_9979_${obs.id}`}>
                      <div
                        className="flex items-center gap-2 min-w-0 flex-1"
                        data-icod-id={`src_components_researchpanel_tsx_79c1_${obs.id}`}>
                        <span
                          className="text-xs font-medium text-muted-foreground"
                          data-icod-id={`src_components_researchpanel_tsx_96bf_${obs.id}`}>#{index + 1}</span>
                        <input
                          type="text"
                          placeholder="Competitor/Seller name"
                          value={obs.competitorName || obs.sellerName}
                          onChange={(e) => handleUpdateObservation(obs.id, 'competitorName', e.target.value)}
                          className="flex-1 min-w-0 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-border focus:bg-card focus:outline-none"
                          data-icod-id={`src_components_researchpanel_tsx_d882_${obs.id}`} />
                        {obs.price > 0 && (
                          <span
                            className="shrink-0 text-sm font-semibold text-foreground"
                            data-icod-id={`src_components_researchpanel_tsx_7b68_${obs.id}`}>
                            {obs.currency} {obs.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div
                        className="flex items-center gap-1 shrink-0"
                        data-icod-id={`src_components_researchpanel_tsx_454d_${obs.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleExpanded(obs.id)}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          data-icod-id={`src_components_researchpanel_tsx_7be7_${obs.id}`}>
                          {isExpanded ? <ChevronUp
                            className="h-4 w-4"
                            data-icod-id={`src_components_researchpanel_tsx_1234_${obs.id}`} /> : <ChevronDown
                            className="h-4 w-4"
                            data-icod-id={`src_components_researchpanel_tsx_8ccc_${obs.id}`} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveObservation(obs.id)}
                          aria-label="Remove"
                          className="text-destructive hover:text-destructive"
                          data-icod-id={`src_components_researchpanel_tsx_f10d_${obs.id}`}>
                          <Trash2
                            className="h-4 w-4"
                            data-icod-id={`src_components_researchpanel_tsx_dad4_${obs.id}`} />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/50 pt-3"
                        data-icod-id={`src_components_researchpanel_tsx_f02e_${obs.id}`}>
                        <Field
                          label="Seller Name"
                          data-icod-id={`src_components_researchpanel_tsx_3c46_${obs.id}`}>
                          <Input
                            value={obs.sellerName}
                            onChange={(e) => handleUpdateObservation(obs.id, 'sellerName', e.target.value)}
                            placeholder="e.g., Amazon Seller XYZ"
                            data-icod-id={`src_components_researchpanel_tsx_c4b8_${obs.id}`} />
                        </Field>
                        <Field
                          label="Listed Price"
                          data-icod-id={`src_components_researchpanel_tsx_3caf_${obs.id}`}>
                          <div
                            className="flex gap-2"
                            data-icod-id={`src_components_researchpanel_tsx_af94_${obs.id}`}>
                            <Input
                              type="number"
                              value={obs.price || ''}
                              onChange={(e) => handleUpdateObservation(obs.id, 'price', roundTwo(parseFloat(e.target.value) || 0))}
                              placeholder="0"
                              className="flex-1"
                              data-icod-id={`src_components_researchpanel_tsx_5fac_${obs.id}`} />
                            <select
                              value={obs.currency}
                              onChange={(e) => handleUpdateObservation(obs.id, 'currency', e.target.value)}
                              className="rounded-lg border border-border bg-card px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                              data-icod-id={`src_components_researchpanel_tsx_f38b_${obs.id}`}>
                              {CURRENCIES.slice(0, 15).map((c) => (
                                <option
                                  key={c.code}
                                  value={c.code}
                                  data-icod-id={`src_components_researchpanel_tsx_4212_${obs.id}_${c.code}`}>{c.code}</option>
                              ))}
                            </select>
                          </div>
                        </Field>
                        <Field
                          label="Product URL"
                          data-icod-id={`src_components_researchpanel_tsx_24ef_${obs.id}`}>
                          <Input
                            value={obs.productUrl}
                            onChange={(e) => handleUpdateObservation(obs.id, 'productUrl', e.target.value)}
                            placeholder="https://..."
                            data-icod-id={`src_components_researchpanel_tsx_3061_${obs.id}`} />
                        </Field>
                        <Field
                          label="Availability"
                          data-icod-id={`src_components_researchpanel_tsx_9cfa_${obs.id}`}>
                          <Input
                            value={obs.availability}
                            onChange={(e) => handleUpdateObservation(obs.id, 'availability', e.target.value)}
                            placeholder="In stock, Out of stock, etc."
                            data-icod-id={`src_components_researchpanel_tsx_f1d1_${obs.id}`} />
                        </Field>
                        <Field
                          label="Date Checked"
                          data-icod-id={`src_components_researchpanel_tsx_d65e_${obs.id}`}>
                          <Input
                            type="date"
                            value={obs.dateChecked}
                            onChange={(e) => handleUpdateObservation(obs.id, 'dateChecked', e.target.value)}
                            data-icod-id={`src_components_researchpanel_tsx_5ae4_${obs.id}`} />
                        </Field>
                        <Field
                          label="Delivery Notes"
                          data-icod-id={`src_components_researchpanel_tsx_85e1_${obs.id}`}>
                          <Input
                            value={obs.deliveryNotes}
                            onChange={(e) => handleUpdateObservation(obs.id, 'deliveryNotes', e.target.value)}
                            placeholder="Shipping time, costs, etc."
                            data-icod-id={`src_components_researchpanel_tsx_3053_${obs.id}`} />
                        </Field>
                        <div
                          className="sm:col-span-2"
                          data-icod-id={`src_components_researchpanel_tsx_753c_${obs.id}`}>
                          <Field
                            label="Quality Notes"
                            data-icod-id={`src_components_researchpanel_tsx_a45a_${obs.id}`}>
                            <textarea
                              value={obs.qualityNotes}
                              onChange={(e) => handleUpdateObservation(obs.id, 'qualityNotes', e.target.value)}
                              placeholder="Build quality, materials, packaging observations..."
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                              rows={2}
                              data-icod-id={`src_components_researchpanel_tsx_c517_${obs.id}`} />
                          </Field>
                        </div>
                        <div
                          className="sm:col-span-2"
                          data-icod-id={`src_components_researchpanel_tsx_8cec_${obs.id}`}>
                          <Field
                            label="Customer Review Insights"
                            data-icod-id={`src_components_researchpanel_tsx_833f_${obs.id}`}>
                            <textarea
                              value={obs.reviewNotes}
                              onChange={(e) => handleUpdateObservation(obs.id, 'reviewNotes', e.target.value)}
                              placeholder="What do customers praise or complain about?"
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                              rows={2}
                              data-icod-id={`src_components_researchpanel_tsx_f8ae_${obs.id}`} />
                          </Field>
                        </div>
                        <div
                          className="sm:col-span-2"
                          data-icod-id={`src_components_researchpanel_tsx_f98c_${obs.id}`}>
                          <Field
                            label="Differentiation Opportunities"
                            data-icod-id={`src_components_researchpanel_tsx_fdae_${obs.id}`}>
                            <textarea
                              value={obs.differentiationNotes}
                              onChange={(e) => handleUpdateObservation(obs.id, 'differentiationNotes', e.target.value)}
                              placeholder="How could your product be better?"
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                              rows={2}
                              data-icod-id={`src_components_researchpanel_tsx_4ced_${obs.id}`} />
                          </Field>
                        </div>
                        <div
                          className="sm:col-span-2"
                          data-icod-id={`src_components_researchpanel_tsx_a052_${obs.id}`}>
                          <Field
                            label="Customer Complaints"
                            data-icod-id={`src_components_researchpanel_tsx_5731_${obs.id}`}>
                            <textarea
                              value={obs.complaintNotes}
                              onChange={(e) => handleUpdateObservation(obs.id, 'complaintNotes', e.target.value)}
                              placeholder="Common issues customers face..."
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                              rows={2}
                              data-icod-id={`src_components_researchpanel_tsx_1430_${obs.id}`} />
                          </Field>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Evidence Summary */}
        {observations.length > 0 && (
          <section
            className="space-y-3"
            data-icod-id="src_components_researchpanel_tsx_0457">
            <h4
              className="text-sm font-semibold text-foreground flex items-center gap-2"
              data-icod-id="src_components_researchpanel_tsx_1e40">
              <CheckCircle2
                className="h-4 w-4 text-[#9DD37D]"
                data-icod-id="src_components_researchpanel_tsx_50b0" />
              Evidence Summary
            </h4>
            
            {/* Price Comparison Table */}
            <div
              className="overflow-x-auto rounded-lg border border-border"
              data-icod-id="src_components_researchpanel_tsx_07d3">
              <table
                className="w-full text-sm"
                data-icod-id="src_components_researchpanel_tsx_75b8">
                <thead
                  className="bg-muted/50"
                  data-icod-id="src_components_researchpanel_tsx_3a99">
                  <tr data-icod-id="src_components_researchpanel_tsx_8c02">
                    <th
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                      data-icod-id="src_components_researchpanel_tsx_0612">Competitor</th>
                    <th
                      className="px-3 py-2 text-right font-medium text-muted-foreground"
                      data-icod-id="src_components_researchpanel_tsx_509c">Price</th>
                    <th
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                      data-icod-id="src_components_researchpanel_tsx_2aa8">Availability</th>
                    <th
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                      data-icod-id="src_components_researchpanel_tsx_a549">Date</th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-border"
                  data-icod-id="src_components_researchpanel_tsx_4244">
                  {observations.map((obs) => (
                    <tr
                      key={obs.id}
                      className="hover:bg-muted/30"
                      data-icod-id={`src_components_researchpanel_tsx_8e25_${obs.id}`}>
                      <td
                        className="px-3 py-2 font-medium text-foreground"
                        data-icod-id={`src_components_researchpanel_tsx_7895_${obs.id}`}>
                        {obs.competitorName || obs.sellerName || 'Unnamed'}
                      </td>
                      <td
                        className="px-3 py-2 text-right text-foreground"
                        data-icod-id={`src_components_researchpanel_tsx_53de_${obs.id}`}>
                        {obs.price > 0 ? `${obs.currency} ${obs.price.toLocaleString()}` : '—'}
                      </td>
                      <td
                        className="px-3 py-2 text-muted-foreground"
                        data-icod-id={`src_components_researchpanel_tsx_8e47_${obs.id}`}>
                        {obs.availability || '—'}
                      </td>
                      <td
                        className="px-3 py-2 text-muted-foreground"
                        data-icod-id={`src_components_researchpanel_tsx_a577_${obs.id}`}>
                        {obs.dateChecked || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Alert
              variant="info"
              className="text-xs"
              data-icod-id="src_components_researchpanel_tsx_4f0d">
              {observations.length} competitor(s) recorded. This does not represent the full market — continue researching to build a complete picture.
            </Alert>
          </section>
        )}

        {/* Research Summary Notes */}
        <section
          className="space-y-3"
          data-icod-id="src_components_researchpanel_tsx_5320">
          <div
            className="flex items-center justify-between"
            data-icod-id="src_components_researchpanel_tsx_e2b8">
            <h4
              className="text-sm font-semibold text-foreground"
              data-icod-id="src_components_researchpanel_tsx_e2b9">Research Summary</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              className="gap-1 text-xs"
              data-icod-id="src_components_researchpanel_tsx_gen_sum_btn">
              <FileText className="h-3 w-3" data-icod-id="src_components_researchpanel_tsx_gen_sum_icon" />
              Generate Research Summary
            </Button>
          </div>
          <textarea
            value={summaryNotes}
            onChange={(e) => setSummaryNotes(e.target.value)}
            placeholder="Summarize your findings, conclusions, and next steps..."
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={4}
            data-icod-id="src_components_researchpanel_tsx_40a4" />
          
          {/* Generated Summary Display */}
          {generatedSummary && (
            <Card
              variant="lavender"
              className="p-4 space-y-2 bg-muted/30"
              data-icod-id="src_components_researchpanel_tsx_gen_summary_card">
              <div
                className="flex items-start justify-between gap-2"
                data-icod-id="src_components_researchpanel_tsx_gen_summary_header">
                <h5
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                  data-icod-id="src_components_researchpanel_tsx_gen_summary_title">
                  <FileText
                    className="h-4 w-4 text-[#C9D0FC]"
                    data-icod-id="src_components_researchpanel_tsx_c467" />
                  Generated Summary
                </h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedSummary(null)}
                  className="text-xs h-6 px-2"
                  data-icod-id="src_components_researchpanel_tsx_gen_summary_close">
                  Clear
                </Button>
              </div>
              <pre
                className="whitespace-pre-wrap text-xs text-foreground font-mono leading-relaxed"
                data-icod-id="src_components_researchpanel_tsx_gen_summary_content">
                {generatedSummary}
              </pre>
            </Card>
          )}
        </section>

        {/* Save Success Feedback */}
        {saveSuccess && (
          <Alert variant="success" data-icod-id="src_components_researchpanel_tsx_bc43">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_components_researchpanel_tsx_fd65">
              <CheckCircle2 className="h-4 w-4" data-icod-id="src_components_researchpanel_tsx_5c03" />
              <span className="text-sm" data-icod-id="src_components_researchpanel_tsx_8cbe">Research data saved successfully!</span>
            </div>
          </Alert>
        )}
      </div>
    </Modal>
  );
}
