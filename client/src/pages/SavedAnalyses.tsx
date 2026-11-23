import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trash2,
  FolderOpen,
  Calculator,
  Scale,
  TrendingUp,
  AlertCircle,
  Download,
  Share2,
  Lock,
  ClipboardCheck,
  GitCompare,
} from 'lucide-react';
import { Button, Card, EmptyState, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatMultiplier, convertAmount } from '@/utils/currency';
import type { PageId } from '@/components/Sidebar';
import type { SavedSimulatorAnalysis, SavedCodAnalysis, SavedScenarioAnalysis, ProfitActualEntry } from '@/types';
import {
  getSavedSimulatorAnalyses,
  deleteSimulatorAnalysis,
  exportSimulatorToPdf,
  generateWhatsAppSummary,
  shareOnWhatsApp,
  getSavedDecisionEngineAnalyses,
  exportDecisionEngineToPdf,
  generateDecisionEngineWhatsAppSummary,
  getSavedScenarioAnalyses,
  deleteScenarioAnalysis,
  exportScenariosToHtml,
} from '@/utils/saveExport';
import { STORAGE_KEYS, scopedSetItem, scopedGetItem } from '@/utils/scopedStorage';
import { useAppSelector } from '@/store/hooks';
import { usePlanGating } from '@/hooks/usePlanGating';
import UpgradePrompt from '@/components/UpgradePrompt';
import LogActualResultsModal from '@/components/LogActualResultsModal';
import { useTranslation } from '@/utils/i18n';

interface SavedAnalysesProps {
  currency: string;
  onNavigate: (page: PageId) => void;
  onLoadSimulatorAnalysis?: (analysis: SavedSimulatorAnalysis) => void;
  onLoadDecisionEngineAnalysis?: (analysis: SavedCodAnalysis) => void;
  onLoadScenariosAnalysis?: (analysis: SavedScenarioAnalysis) => void;
}

type AnalysisType = 'all' | 'simulator' | 'decision-engine' | 'scenarios';

export default function SavedAnalyses({
  currency,
  onNavigate,
  onLoadSimulatorAnalysis,
  onLoadDecisionEngineAnalysis,
  onLoadScenariosAnalysis,
}: SavedAnalysesProps) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [simulatorAnalyses, setSimulatorAnalyses] = useState<SavedSimulatorAnalysis[]>([]);
  const [decisionEngineAnalyses, setDecisionEngineAnalyses] = useState<SavedCodAnalysis[]>([]);
  const [scenarioAnalyses, setScenarioAnalyses] = useState<SavedScenarioAnalysis[]>([]);
  const [filter, setFilter] = useState<AnalysisType>('all');
  const [showExportUpgradePrompt, setShowExportUpgradePrompt] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [logActualAnalysisId, setLogActualAnalysisId] = useState<string | null>(null);
  const [logActualAnalysisName, setLogActualAnalysisName] = useState<string>('');
  const { t } = useTranslation();

  // Plan gating for export reports
  const { canAccessFeature, getUpgradePrompt } = usePlanGating();
  const canExport = canAccessFeature('exportReports');
  const exportUpgradeMessage = getUpgradePrompt('exportReports');

  // Load analyses on mount and when user changes
  useEffect(() => {
    setSimulatorAnalyses(getSavedSimulatorAnalyses(userId));
    setDecisionEngineAnalyses(getSavedDecisionEngineAnalyses(userId));
    setScenarioAnalyses(getSavedScenarioAnalyses(userId));
  }, [userId]);

  // Refresh after deletion
  const refreshAnalyses = () => {
    setSimulatorAnalyses(getSavedSimulatorAnalyses(userId));
    setDecisionEngineAnalyses(getSavedDecisionEngineAnalyses(userId));
    setScenarioAnalyses(getSavedScenarioAnalyses(userId));
  };

  // Delete simulator analysis
  const handleDeleteSimulator = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteSimulator = () => {
    if (deleteConfirmId === null) return;
    deleteSimulatorAnalysis(deleteConfirmId, userId);
    setDeleteConfirmId(null);
    refreshAnalyses();
  };

  // Delete decision engine analysis
  const handleDeleteDecisionEngine = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDeleteDecisionEngine = () => {
    if (deleteConfirmIndex === null) return;
    const analyses = getSavedDecisionEngineAnalyses(userId);
    const updated = analyses.filter((_, i) => i !== deleteConfirmIndex);
    scopedSetItem(STORAGE_KEYS.COD_ANALYSES, userId, updated);
    setDeleteConfirmIndex(null);
    refreshAnalyses();
  };

  // Log Actual Results handlers
  const handleOpenLogActual = (analysisId: string, analysisName: string) => {
    setLogActualAnalysisId(analysisId);
    setLogActualAnalysisName(analysisName);
  };

  const handleSaveActualResult = (entry: ProfitActualEntry) => {
    const existing = scopedGetItem<ProfitActualEntry[]>(STORAGE_KEYS.PROFIT_ACTUALS, userId, []);
    // One entry per analysis — replace if already exists
    const filtered = existing.filter((e) => e.analysisId !== entry.analysisId);
    filtered.push(entry);
    scopedSetItem(STORAGE_KEYS.PROFIT_ACTUALS, userId, filtered);
    setLogActualAnalysisId(null);
    setLogActualAnalysisName('');
  };

  // Export handlers (downloadable HTML report)
  const handleExportSimulatorReport = (analysis: SavedSimulatorAnalysis) => {
    try {
      exportSimulatorToPdf(analysis, analysis.currency || currency);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Export failed: ' + message);
    }
  };

  const handleExportDecisionEngineReport = (analysis: SavedCodAnalysis) => {
    try {
      exportDecisionEngineToPdf(analysis, currency);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Export failed: ' + message);
    }
  };

  const handleShareSimulatorWhatsApp = (analysis: SavedSimulatorAnalysis) => {
    const text = generateWhatsAppSummary(analysis, analysis.currency || currency);
    shareOnWhatsApp(text);
  };

  const handleShareDecisionEngineWhatsApp = (analysis: SavedCodAnalysis) => {
    const text = generateDecisionEngineWhatsAppSummary(analysis, currency);
    shareOnWhatsApp(text);
  };

  // Load handlers
  const handleLoadSimulator = (analysis: SavedSimulatorAnalysis) => {
    if (onLoadSimulatorAnalysis) {
      onLoadSimulatorAnalysis(analysis);
      onNavigate('simulator');
    }
  };

  const handleLoadDecisionEngine = (analysis: SavedCodAnalysis) => {
    if (onLoadDecisionEngineAnalysis) {
      onLoadDecisionEngineAnalysis(analysis);
      onNavigate('decision-engine');
    }
  };

  // Delete scenario analysis
  const [deleteScenarioId, setDeleteScenarioId] = useState<string | null>(null);

  const handleDeleteScenario = (id: string) => {
    setDeleteScenarioId(id);
  };

  const confirmDeleteScenario = () => {
    if (deleteScenarioId === null) return;
    deleteScenarioAnalysis(deleteScenarioId, userId);
    setDeleteScenarioId(null);
    refreshAnalyses();
  };

  // Export scenario report
  const handleExportScenarioReport = (analysis: SavedScenarioAnalysis) => {
    try {
      exportScenariosToHtml(analysis, analysis.currency || currency);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Export failed: ' + message);
    }
  };

  // Load scenario analysis
  const handleLoadScenario = (analysis: SavedScenarioAnalysis) => {
    if (onLoadScenariosAnalysis) {
      onLoadScenariosAnalysis(analysis);
      onNavigate('scenarios');
    }
  };

  // Filter analyses
  const showSimulator = filter === 'all' || filter === 'simulator';
  const showDecisionEngine = filter === 'all' || filter === 'decision-engine';
  const showScenarios = filter === 'all' || filter === 'scenarios';

  const hasAnalyses = simulatorAnalyses.length > 0 || decisionEngineAnalyses.length > 0 || scenarioAnalyses.length > 0;

  return (
    <div className="space-y-6" data-icod-id="src_pages_savedanalyses_tsx_root">
      {/* Header */}
      <div className="space-y-2" data-icod-id="src_pages_savedanalyses_tsx_header">
        <div className="flex items-center gap-4" data-icod-id="src_pages_savedanalyses_tsx_header_row">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('overview')}
            data-icod-id="src_pages_savedanalyses_tsx_back_btn">
            <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_savedanalyses_tsx_back_icon" />
          </Button>
          <div data-icod-id="src_pages_savedanalyses_tsx_header_text">
            <h1 className="text-3xl font-bold text-[#171717]" data-icod-id="src_pages_savedanalyses_tsx_title">
              Saved Analyses
            </h1>
            <p className="text-muted-foreground" data-icod-id="src_pages_savedanalyses_tsx_subtitle">
              View and manage your saved launch simulations and decisions.
            </p>
          </div>
        </div>
      </div>
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap" data-icod-id="src_pages_savedanalyses_tsx_filters">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          data-icod-id="src_pages_savedanalyses_tsx_filter_all">
          All ({simulatorAnalyses.length + decisionEngineAnalyses.length + scenarioAnalyses.length})
        </Button>
        <Button
          variant={filter === 'simulator' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('simulator')}
          data-icod-id="src_pages_savedanalyses_tsx_filter_simulator">
          Simulator ({simulatorAnalyses.length})
        </Button>
        <Button
          variant={filter === 'decision-engine' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('decision-engine')}
          data-icod-id="src_pages_savedanalyses_tsx_filter_decision">
          Decision Engine ({decisionEngineAnalyses.length})
        </Button>
        <Button
          variant={filter === 'scenarios' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('scenarios')}
          data-icod-id="src_pages_savedanalyses_tsx_filter_scenarios">
          Scenarios ({scenarioAnalyses.length})
        </Button>
      </div>
      {/* Export gating notice when user cannot export */}
      {!canExport && showExportUpgradePrompt && (
        <div className="mt-2" data-icod-id="src_pages_savedanalyses_tsx_export_gated">
          <UpgradePrompt
            message={exportUpgradeMessage || 'Report exports require Standard or Business plan with confirmed payment'}
            className="w-full"
            data-icod-id="src_pages_savedanalyses_tsx_export_upgrade_prompt" />
        </div>
      )}
      {!hasAnalyses ? (
        <Card className="p-8" data-icod-id="src_pages_savedanalyses_tsx_empty_card">
          <EmptyState
            icon={FolderOpen}
            title="No saved analyses yet"
            description="Save analyses from the Launch Simulator or Decision Engine to see them here."
            action={
              <Button
                variant="primary"
                onClick={() => onNavigate('simulator')}
                data-icod-id="src_pages_savedanalyses_tsx_2458">
                Go to Simulator
              </Button>
            }
            data-icod-id="src_pages_savedanalyses_tsx_empty_state"
          />
        </Card>
      ) : (
        <>
          {/* Simulator Analyses */}
          {showSimulator && simulatorAnalyses.length > 0 && (
            <div className="space-y-4" data-icod-id="src_pages_savedanalyses_tsx_simulator_section">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2" data-icod-id="src_pages_savedanalyses_tsx_simulator_title">
                <Calculator className="h-5 w-5" data-icod-id="src_pages_savedanalyses_tsx_simulator_icon" />
                Launch Simulator Analyses
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-icod-id="src_pages_savedanalyses_tsx_simulator_grid">
                {simulatorAnalyses.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className={cn(
                      'p-5 transition-all hover:shadow-md',
                      analysis.verdict === 'Profitable' ? 'border-l-4 border-l-[#9DD37D]' : 'border-l-4 border-l-[#E88B9E]'
                    )}
                    data-icod-id={`src_pages_savedanalyses_tsx_simulator_card_${analysis.id}`}>
                    <div className="mb-3 flex items-start justify-between" data-icod-id={`src_pages_savedanalyses_tsx_simulator_header_${analysis.id}`}>
                      <div data-icod-id={`src_pages_savedanalyses_tsx_simulator_info_${analysis.id}`}>
                        <h3 className="font-semibold text-foreground truncate max-w-[200px]" data-icod-id={`src_pages_savedanalyses_tsx_simulator_name_${analysis.id}`}>
                          {analysis.name || 'Untitled'}
                        </h3>
                        <p className="text-xs text-muted-foreground" data-icod-id={`src_pages_savedanalyses_tsx_simulator_date_${analysis.id}`}>
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          analysis.verdict === 'Profitable'
                            ? 'bg-[#9DD37D]/20 text-[#9DD37D]'
                            : 'bg-[#E88B9E]/20 text-[#E88B9E]'
                        )}
                        data-icod-id={`src_pages_savedanalyses_tsx_simulator_verdict_${analysis.id}`}>
                        {analysis.verdict === 'Profitable' ? 'Profitable' : 'Loss'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4" data-icod-id={`src_pages_savedanalyses_tsx_simulator_metrics_${analysis.id}`}>
                      <div className="flex justify-between text-sm" data-icod-id={`src_pages_savedanalyses_tsx_simulator_revenue_${analysis.id}`}>
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_2bf6_${analysis.id}`}>Revenue:</span>
                        <span
                          className="font-medium text-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_99e6_${analysis.id}`}>{formatCurrency(analysis.results.revenue, currency, { baseCurrency: 'PKR' })}</span>
                      </div>
                      <div className="flex justify-between text-sm" data-icod-id={`src_pages_savedanalyses_tsx_simulator_profit_${analysis.id}`}>
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_c0e3_${analysis.id}`}>Profit/Loss:</span>
                        <span
                          className={cn('font-medium', analysis.results.campaignProfitLoss >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]')}
                          data-icod-id={`src_pages_savedanalyses_tsx_02ca_${analysis.id}`}>
                          {formatCurrency(analysis.results.campaignProfitLoss, currency, { baseCurrency: 'PKR' })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm" data-icod-id={`src_pages_savedanalyses_tsx_simulator_roas_${analysis.id}`}>
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_b9ea_${analysis.id}`}>ROAS:</span>
                        <span
                          className="font-medium text-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_948a_${analysis.id}`}>
                          {analysis.results.roas !== null ? formatMultiplier(analysis.results.roas) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border/50" data-icod-id={`src_pages_savedanalyses_tsx_simulator_actions_${analysis.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadSimulator(analysis)}
                        className="flex-1 gap-1"
                        data-icod-id={`src_pages_savedanalyses_tsx_simulator_load_${analysis.id}`}>
                        <FolderOpen
                          className="h-3.5 w-3.5"
                          data-icod-id={`src_pages_savedanalyses_tsx_0c9c_${analysis.id}`} />
                        Load
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenLogActual(analysis.id, analysis.name || 'Untitled')}
                        title={t('Log Actual Results')}
                        data-icod-id={`src_pages_savedanalyses_tsx_simulator_log_actual_${analysis.id}`}>
                        <ClipboardCheck
                          className="h-3.5 w-3.5"
                          data-icod-id={`src_pages_savedanalyses_tsx_ef51_${analysis.id}`} />
                        {t('Log Actual')}
                      </Button>
                      {canExport ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExportSimulatorReport(analysis)}
                          title="Export Report"
                          data-icod-id={`src_pages_savedanalyses_tsx_simulator_pdf_${analysis.id}`}>
                          <Download
                            className="h-4 w-4"
                            data-icod-id={`src_pages_savedanalyses_tsx_8652_${analysis.id}`} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          className="opacity-60"
                          onClick={() => setShowExportUpgradePrompt(true)}
                          title="Export Report (Pro)"
                          data-icod-id={`src_pages_savedanalyses_tsx_simulator_pdf_locked_${analysis.id}`}>
                          <Lock
                            className="h-4 w-4"
                            data-icod-id={`src_pages_savedanalyses_tsx_simulator_lock_${analysis.id}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareSimulatorWhatsApp(analysis)}
                        title="Share on WhatsApp"
                        data-icod-id={`src_pages_savedanalyses_tsx_simulator_whatsapp_${analysis.id}`}>
                        <Share2
                          className="h-4 w-4"
                          data-icod-id={`src_pages_savedanalyses_tsx_3890_${analysis.id}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSimulator(analysis.id)}
                        title="Delete"
                        data-icod-id={`src_pages_savedanalyses_tsx_simulator_delete_${analysis.id}`}>
                        <Trash2
                          className="h-4 w-4 text-destructive"
                          data-icod-id={`src_pages_savedanalyses_tsx_9ff2_${analysis.id}`} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Decision Engine Analyses */}
          {showDecisionEngine && decisionEngineAnalyses.length > 0 && (
            <div className="space-y-4" data-icod-id="src_pages_savedanalyses_tsx_decision_section">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2" data-icod-id="src_pages_savedanalyses_tsx_decision_title">
                <Scale className="h-5 w-5" data-icod-id="src_pages_savedanalyses_tsx_decision_icon" />
                Decision Engine Analyses
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-icod-id="src_pages_savedanalyses_tsx_decision_grid">
                {decisionEngineAnalyses.map((analysis, index) => (
                  <Card
                    key={`${analysis.inputs.id}-${index}`}
                    className={cn(
                      'p-5 transition-all hover:shadow-md',
                      analysis.decision.decision === 'GO'
                        ? 'border-l-4 border-l-[#9DD37D]'
                        : analysis.decision.decision === 'TEST FIRST'
                          ? 'border-l-4 border-l-amber-400'
                          : 'border-l-4 border-l-red-500'
                    )}
                    data-icod-id={`src_pages_savedanalyses_tsx_decision_card_${index}`}>
                    <div className="mb-3 flex items-start justify-between" data-icod-id={`src_pages_savedanalyses_tsx_decision_header_${index}`}>
                      <div data-icod-id={`src_pages_savedanalyses_tsx_decision_info_${index}`}>
                        <h3 className="font-semibold text-foreground truncate max-w-[200px]" data-icod-id={`src_pages_savedanalyses_tsx_decision_name_${index}`}>
                          {analysis.inputs.productName || 'Untitled'}
                        </h3>
                        <p className="text-xs text-muted-foreground" data-icod-id={`src_pages_savedanalyses_tsx_decision_date_${index}`}>
                          {new Date(analysis.inputs.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          analysis.decision.decision === 'GO'
                            ? 'bg-[#9DD37D]/20 text-[#9DD37D]'
                            : analysis.decision.decision === 'TEST FIRST'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        )}
                        data-icod-id={`src_pages_savedanalyses_tsx_decision_verdict_${index}`}>
                        {analysis.decision.decision}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4" data-icod-id={`src_pages_savedanalyses_tsx_decision_metrics_${index}`}>
                      <div className="flex justify-between text-sm" data-icod-id={`src_pages_savedanalyses_tsx_decision_contribution_${index}`}>
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_0d63_${index}`}>Contribution/Order:</span>
                        <span
                          className="font-medium text-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_24b2_${index}`}>
                          {formatCurrency(analysis.calculations.expectedContributionPerPlacedOrder, currency, { baseCurrency: 'PKR' })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm" data-icod-id={`src_pages_savedanalyses_tsx_decision_breakeven_${index}`}>
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_6277_${index}`}>Break-Even ROAS:</span>
                        <span
                          className="font-medium text-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_8cd1_${index}`}>
                          {analysis.calculations.breakEvenRoas === Infinity ? 'N/A' : `${analysis.calculations.breakEvenRoas.toFixed(2)}x`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm" data-icod-id={`src_pages_savedanalyses_tsx_decision_orders_${index}`}>
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_61a7_${index}`}>Break-Even Orders:</span>
                        <span
                          className="font-medium text-foreground"
                          data-icod-id={`src_pages_savedanalyses_tsx_6c13_${index}`}>
                          {analysis.calculations.breakEvenOrderCount === Infinity ? 'N/A' : Math.ceil(analysis.calculations.breakEvenOrderCount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border/50" data-icod-id={`src_pages_savedanalyses_tsx_decision_actions_${index}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadDecisionEngine(analysis)}
                        className="flex-1 gap-1"
                        data-icod-id={`src_pages_savedanalyses_tsx_decision_load_${index}`}>
                        <FolderOpen
                          className="h-3.5 w-3.5"
                          data-icod-id={`src_pages_savedanalyses_tsx_f973_${index}`} />
                        Load
                      </Button>
                      {canExport ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExportDecisionEngineReport(analysis)}
                          title="Export Report"
                          data-icod-id={`src_pages_savedanalyses_tsx_decision_pdf_${index}`}>
                          <Download
                            className="h-4 w-4"
                            data-icod-id={`src_pages_savedanalyses_tsx_6c78_${index}`} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          className="opacity-60"
                          onClick={() => setShowExportUpgradePrompt(true)}
                          title="Export Report (Pro)"
                          data-icod-id={`src_pages_savedanalyses_tsx_decision_pdf_locked_${index}`}>
                          <Lock
                            className="h-4 w-4"
                            data-icod-id={`src_pages_savedanalyses_tsx_decision_lock_${index}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareDecisionEngineWhatsApp(analysis)}
                        title="Share on WhatsApp"
                        data-icod-id={`src_pages_savedanalyses_tsx_decision_whatsapp_${index}`}>
                        <Share2
                          className="h-4 w-4"
                          data-icod-id={`src_pages_savedanalyses_tsx_8a5f_${index}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDecisionEngine(index)}
                        title="Delete"
                        data-icod-id={`src_pages_savedanalyses_tsx_decision_delete_${index}`}>
                        <Trash2
                          className="h-4 w-4 text-destructive"
                          data-icod-id={`src_pages_savedanalyses_tsx_db80_${index}`} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Scenario Analyses */}
          {showScenarios && scenarioAnalyses.length > 0 && (
            <div className="space-y-4" data-icod-id="src_pages_savedanalyses_tsx_scenario_section">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2" data-icod-id="src_pages_savedanalyses_tsx_scenario_title">
                <GitCompare className="h-5 w-5" data-icod-id="src_pages_savedanalyses_tsx_scenario_icon" />
                Scenario Comparisons
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-icod-id="src_pages_savedanalyses_tsx_scenario_grid">
                {scenarioAnalyses.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className="p-5 transition-all hover:shadow-md border-l-4 border-l-[#C9D0FC]"
                    data-icod-id={`src_pages_savedanalyses_tsx_scenario_card_${analysis.id}`}>
                    <div className="mb-3 flex items-start justify-between" data-icod-id={`src_pages_savedanalyses_tsx_scenario_header_${analysis.id}`}>
                      <div data-icod-id={`src_pages_savedanalyses_tsx_scenario_info_${analysis.id}`}>
                        <h3 className="font-semibold text-foreground truncate max-w-[200px]" data-icod-id={`src_pages_savedanalyses_tsx_scenario_name_${analysis.id}`}>
                          {analysis.name || 'Untitled'}
                        </h3>
                        <p className="text-xs text-muted-foreground" data-icod-id={`src_pages_savedanalyses_tsx_scenario_product_${analysis.id}`}>
                          {analysis.productName || 'No product'}
                        </p>
                        <p className="text-xs text-muted-foreground" data-icod-id={`src_pages_savedanalyses_tsx_scenario_date_${analysis.id}`}>
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className="rounded-full bg-[#C9D0FC]/20 px-2 py-0.5 text-xs font-medium text-[#C9D0FC]"
                        data-icod-id={`src_pages_savedanalyses_tsx_scenario_badge_${analysis.id}`}>
                        {analysis.scenarios.length} scenarios
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4" data-icod-id={`src_pages_savedanalyses_tsx_scenario_metrics_${analysis.id}`}>
                      {analysis.results.slice(0, 3).map((r) => (
                        <div key={r.scenarioName} className="flex justify-between text-sm" data-icod-id={`src_pages_savedanalyses_tsx_scenario_row_${analysis.id}_${r.scenarioName}`}>
                          <span
                            className="text-muted-foreground"
                            data-icod-id={`src_pages_savedanalyses_tsx_ab1d_${analysis.id}_${r.scenarioName}`}>{r.scenarioName}:</span>
                          <span
                            className={cn('font-medium', r.campaignProfitLoss >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]')}
                            data-icod-id={`src_pages_savedanalyses_tsx_d1ed_${analysis.id}_${r.scenarioName}`}>
                            {formatCurrency(r.campaignProfitLoss, currency, { baseCurrency: analysis.currency || 'PKR' })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border/50" data-icod-id={`src_pages_savedanalyses_tsx_scenario_actions_${analysis.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadScenario(analysis)}
                        className="flex-1 gap-1"
                        data-icod-id={`src_pages_savedanalyses_tsx_scenario_load_${analysis.id}`}>
                        <FolderOpen
                          className="h-3.5 w-3.5"
                          data-icod-id={`src_pages_savedanalyses_tsx_a01f_${analysis.id}`} />
                        Load
                      </Button>
                      {canExport ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExportScenarioReport(analysis)}
                          title="Export Report"
                          data-icod-id={`src_pages_savedanalyses_tsx_scenario_pdf_${analysis.id}`}>
                          <Download
                            className="h-4 w-4"
                            data-icod-id={`src_pages_savedanalyses_tsx_6fb0_${analysis.id}`} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          className="opacity-60"
                          onClick={() => setShowExportUpgradePrompt(true)}
                          title="Export Report (Pro)"
                          data-icod-id={`src_pages_savedanalyses_tsx_scenario_pdf_locked_${analysis.id}`}>
                          <Lock
                            className="h-4 w-4"
                            data-icod-id={`src_pages_savedanalyses_tsx_c073_${analysis.id}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteScenario(analysis.id)}
                        title="Delete"
                        data-icod-id={`src_pages_savedanalyses_tsx_scenario_delete_${analysis.id}`}>
                        <Trash2
                          className="h-4 w-4 text-destructive"
                          data-icod-id={`src_pages_savedanalyses_tsx_4326_${analysis.id}`} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {/* Delete Confirmation Modal — Simulator */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Analysis"
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_savedanalyses_tsx_f0cf">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              data-icod-id="src_pages_savedanalyses_tsx_e1b4">Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDeleteSimulator}
              data-icod-id="src_pages_savedanalyses_tsx_438e">Delete</Button>
          </div>
        }
        data-icod-id="src_pages_savedanalyses_tsx_394d">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_savedanalyses_tsx_d9c2">Are you sure you want to delete this analysis? This action cannot be undone.</p>
      </Modal>
      {/* Delete Confirmation Modal — Decision Engine */}
      <Modal
        open={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        title="Delete Analysis"
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_savedanalyses_tsx_4e53">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmIndex(null)}
              data-icod-id="src_pages_savedanalyses_tsx_9042">Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDeleteDecisionEngine}
              data-icod-id="src_pages_savedanalyses_tsx_fd12">Delete</Button>
          </div>
        }
        data-icod-id="src_pages_savedanalyses_tsx_11c8">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_savedanalyses_tsx_b2c8">Are you sure you want to delete this analysis? This action cannot be undone.</p>
      </Modal>
      {/* Delete Confirmation Modal — Scenarios */}
      <Modal
        open={deleteScenarioId !== null}
        onClose={() => setDeleteScenarioId(null)}
        title="Delete Analysis"
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_savedanalyses_tsx_scenario_delete_footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteScenarioId(null)}
              data-icod-id="src_pages_savedanalyses_tsx_scenario_delete_cancel">Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDeleteScenario}
              data-icod-id="src_pages_savedanalyses_tsx_scenario_delete_confirm">Delete</Button>
          </div>
        }
        data-icod-id="src_pages_savedanalyses_tsx_scenario_delete_modal">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_savedanalyses_tsx_scenario_delete_text">Are you sure you want to delete this scenario comparison? This action cannot be undone.</p>
      </Modal>
      {/* Log Actual Results Modal */}
      <LogActualResultsModal
        open={logActualAnalysisId !== null}
        onClose={() => {
          setLogActualAnalysisId(null);
          setLogActualAnalysisName('');
        }}
        analysisId={logActualAnalysisId ?? ''}
        analysisName={logActualAnalysisName}
        productCost={simulatorAnalyses.find((a) => a.id === logActualAnalysisId)?.inputs.productCost ?? 0}
        otherCosts={simulatorAnalyses.find((a) => a.id === logActualAnalysisId)?.inputs.otherVariableCosts ?? 0}
        onSave={handleSaveActualResult}
        data-icod-id="src_pages_savedanalyses_tsx_f302" />
    </div>
  );
}
