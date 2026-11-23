import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Modal, Alert } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/utils/i18n';
import { parseCsv, downloadCsvTemplate, type CsvParseResult } from '@/utils/csvParser';
import type { ImportedOrder, CsvImportSummary, SavedSimulatorAnalysis } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  analyses: SavedSimulatorAnalysis[];
  currency: string;
  onImport: (orders: ImportedOrder[], analysisId: string) => void;
}

type TabMode = 'upload' | 'paste';

export default function CsvImportModal({
  open,
  onClose,
  analyses,
  currency,
  onImport,
}: CsvImportModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabMode>('upload');
  const [csvText, setCsvText] = useState('');
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setCsvText('');
    setParseResult(null);
    setSelectedAnalysisId('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // ── File upload handler ────────────────────────────────────────────────────

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setCsvText(text);
        setParseResult(parseCsv(text));
      }
    };
    reader.readAsText(file);
  }, []);

  // ── Drag & drop handlers ───────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.csv')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setCsvText(text);
        setParseResult(parseCsv(text));
      }
    };
    reader.readAsText(file);
  }, []);

  // ── Paste parse ────────────────────────────────────────────────────────────

  const handlePasteParse = () => {
    if (!csvText.trim()) return;
    setParseResult(parseCsv(csvText));
  };

  // ── Import ─────────────────────────────────────────────────────────────────

  const handleImport = () => {
    if (!parseResult || parseResult.orders.length === 0 || !selectedAnalysisId) return;
    onImport(parseResult.orders, selectedAnalysisId);
    handleClose();
  };

  // ── Summary display helper ─────────────────────────────────────────────────

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div
      className="flex justify-between py-1"
      data-icod-id="src_components_csvimportmodal_tsx_0e85">
      <span
        className="text-sm text-muted-foreground"
        data-icod-id="src_components_csvimportmodal_tsx_3af4">{label}</span>
      <span
        className="text-sm font-medium text-foreground"
        data-icod-id="src_components_csvimportmodal_tsx_6512">{value}</span>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('Import Orders')}
      className="max-w-2xl"
      footer={
        parseResult && parseResult.orders.length > 0 ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              data-icod-id="src_components_csvimportmodal_tsx_7de1">
              {t('Cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImport}
              disabled={!selectedAnalysisId}
              data-icod-id="src_components_csvimportmodal_tsx_2f82">
              {t('Import into Tracker')}
            </Button>
          </>
        ) : undefined
      }
      data-icod-id="src_components_csvimportmodal_tsx_0a60">
      {/* Disclaimer */}
      <Alert
        variant="info"
        className="mb-4 text-xs leading-relaxed"
        data-icod-id="src_components_csvimportmodal_tsx_146a">
        {t('There is no live Daraz or Shopify API connection. Import reads the CSV file you manually export from those platforms.')}
      </Alert>
      {/* Guide */}
      <p
        className="mb-4 text-sm text-muted-foreground leading-relaxed"
        data-icod-id="src_components_csvimportmodal_tsx_075a">
        {t('Export your orders from Daraz Seller Center (Orders → Export) or Shopify (Orders → Export all orders as CSV), then upload or paste the file here.')}
      </p>
      {/* Template download */}
      <div
        className="mb-4 flex items-center gap-2"
        data-icod-id="src_components_csvimportmodal_tsx_bafb">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadCsvTemplate}
          data-icod-id="src_components_csvimportmodal_tsx_4112">
          <Download
            className="mr-1.5 h-3.5 w-3.5"
            data-icod-id="src_components_csvimportmodal_tsx_1a7c" />
          {t('Download CSV Template')}
        </Button>
      </div>
      {!parseResult || parseResult.errors.length > 0 ? (
        <>
          {/* Tabs */}
          <div
            className="mb-3 flex gap-1 rounded-lg bg-muted/50 p-1"
            data-icod-id="src_components_csvimportmodal_tsx_9f83">
            <button
              onClick={() => setTab('upload')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'upload'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              data-icod-id="src_components_csvimportmodal_tsx_0995">
              {t('File Upload')}
            </button>
            <button
              onClick={() => setTab('paste')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'paste'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              data-icod-id="src_components_csvimportmodal_tsx_fccb">
              {t('Paste CSV')}
            </button>
          </div>

          {/* Upload zone */}
          {tab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 transition-colors hover:border-ring hover:bg-muted/50"
              data-icod-id="src_components_csvimportmodal_tsx_a539">
              <Upload
                className="h-8 w-8 text-muted-foreground"
                data-icod-id="src_components_csvimportmodal_tsx_fb06" />
              <p
                className="text-sm text-muted-foreground text-center"
                data-icod-id="src_components_csvimportmodal_tsx_5ce0">
                {t('Drag & drop a .csv file here, or click to browse')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                data-icod-id="src_components_csvimportmodal_tsx_737c" />
            </div>
          )}

          {/* Paste zone */}
          {tab === 'paste' && (
            <div
              className="space-y-3"
              data-icod-id="src_components_csvimportmodal_tsx_ab57">
              <label
                className="text-sm font-medium text-foreground"
                data-icod-id="src_components_csvimportmodal_tsx_12d6">
                {t('Paste your CSV data below:')}
              </label>
              <textarea
                className={inputClass('min-h-32 resize-none font-mono text-xs')}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="date,product,selling_price,..."
                data-icod-id="src_components_csvimportmodal_tsx_5c5c" />
              <Button
                variant="primary"
                size="sm"
                onClick={handlePasteParse}
                disabled={!csvText.trim()}
                data-icod-id="src_components_csvimportmodal_tsx_fda5">
                {t('Parse CSV')}
              </Button>
            </div>
          )}

          {/* Parse errors */}
          {parseResult && parseResult.errors.length > 0 && (
            <div
              className="mt-3 space-y-1"
              data-icod-id="src_components_csvimportmodal_tsx_429f">
              {parseResult.errors.map((err, i) => (
                <Alert
                  key={i}
                  variant="error"
                  className="text-xs"
                  data-icod-id={`src_components_csvimportmodal_tsx_f224_${i}`}>
                  {err}
                </Alert>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Parse success: summary + analysis selector ─────────────── */
        (<div
          className="space-y-4"
          data-icod-id="src_components_csvimportmodal_tsx_ce03">
          <div
            className="flex items-center gap-2 text-[#9DD37D]"
            data-icod-id="src_components_csvimportmodal_tsx_382d">
            <CheckCircle2 className="h-5 w-5" data-icod-id="src_components_csvimportmodal_tsx_e985" />
            <span
              className="font-medium"
              data-icod-id="src_components_csvimportmodal_tsx_b08b">{t('CSV parsed successfully')}</span>
          </div>
          {/* Summary card */}
          <div
            className="rounded-xl border border-border bg-muted/20 p-4"
            data-icod-id="src_components_csvimportmodal_tsx_3f67">
            <h4
              className="mb-2 text-sm font-semibold text-foreground"
              data-icod-id="src_components_csvimportmodal_tsx_a9d3">{t('Import Summary')}</h4>
            <SummaryRow
              label={t('Total Rows')}
              value={String(parseResult.summary.totalRows)}
              data-icod-id="src_components_csvimportmodal_tsx_fe16" />
            <SummaryRow
              label={t('Delivered')}
              value={String(parseResult.summary.deliveredCount)}
              data-icod-id="src_components_csvimportmodal_tsx_4bc5" />
            <SummaryRow
              label={t('Returned')}
              value={String(parseResult.summary.returnedCount)}
              data-icod-id="src_components_csvimportmodal_tsx_2e18" />
            <SummaryRow
              label={t('Date Range')}
              value={`${parseResult.summary.dateRange.min} — ${parseResult.summary.dateRange.max}`}
              data-icod-id="src_components_csvimportmodal_tsx_d712" />
            <SummaryRow
              label={t('Revenue')}
              value={formatCurrency(parseResult.summary.totalRevenue, currency, { baseCurrency: 'PKR' })}
              data-icod-id="src_components_csvimportmodal_tsx_a6d4" />
            <SummaryRow
              label={t('Ad Spend')}
              value={formatCurrency(parseResult.summary.totalAdSpend, currency, { baseCurrency: 'PKR' })}
              data-icod-id="src_components_csvimportmodal_tsx_3ed5" />
          </div>
          {/* Analysis selector */}
          <div
            className="space-y-2"
            data-icod-id="src_components_csvimportmodal_tsx_b4b5">
            <label
              className="text-sm font-medium text-foreground"
              data-icod-id="src_components_csvimportmodal_tsx_c655">
              {t('Select an analysis to compare against:')}
            </label>
            {analyses.length === 0 ? (
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_components_csvimportmodal_tsx_cd96">
                {t('No saved analyses available for comparison.')}
              </p>
            ) : (
              <select
                className={inputClass()}
                value={selectedAnalysisId}
                onChange={(e) => setSelectedAnalysisId(e.target.value)}
                data-icod-id="src_components_csvimportmodal_tsx_9fc7">
                <option value="" data-icod-id="src_components_csvimportmodal_tsx_0966">— Select —</option>
                {analyses.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                    data-icod-id={`src_components_csvimportmodal_tsx_2ad9_${a.id}`}>
                    {a.name || 'Untitled'} ({new Date(a.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>)
      )}
    </Modal>
  );
}
