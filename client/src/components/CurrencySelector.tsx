import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CURRENCIES, searchCurrencies, type Currency } from '@/utils/currency';

interface CurrencySelectorProps {
  value: string;
  onChange: (currencyCode: string) => void;
  className?: string;
}

export default function CurrencySelector({ value, onChange, className }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter currencies based on search query
  const filteredCurrencies = searchCurrencies(searchQuery);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' && filteredCurrencies.length === 1) {
      onChange(filteredCurrencies[0].code);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Get current currency display info
  const currentCurrency = CURRENCIES.find((c) => c.code === value) || CURRENCIES[0];

  return (
    <div ref={containerRef} className={cn('relative', className)} data-icod-id="src_components_currencyselector_tsx_0a1b">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-medium text-foreground transition-all duration-150',
          'hover:border-primary hover:bg-accent/50',
          isOpen && 'border-primary ring-2 ring-primary/20'
        )}
        data-icod-id="src_components_currencyselector_tsx_1c2d">
        <span className="shrink-0" data-icod-id="src_components_currencyselector_tsx_2e3f">{currentCurrency.code}</span>
        {currentCurrency.symbol && (
          <span className="shrink-0 text-muted-foreground" data-icod-id="src_components_currencyselector_tsx_3g4h">
            ({currentCurrency.symbol})
          </span>
        )}
        <ChevronDown
          className={cn(
            'ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
          data-icod-id="src_components_currencyselector_tsx_4i5j" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
          data-icod-id="src_components_currencyselector_tsx_5k6l">
          {/* Search input */}
          <div className="border-b border-border p-2" data-icod-id="src_components_currencyselector_tsx_6m7n">
            <div className="relative" data-icod-id="src_components_currencyselector_tsx_7o8p">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" data-icod-id="src_components_currencyselector_tsx_8q9r" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search currency..."
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                data-icod-id="src_components_currencyselector_tsx_9s0t" />
            </div>
          </div>

          {/* Currency list */}
          <div
            ref={listRef}
            className="max-h-64 overflow-y-auto py-1"
            data-icod-id="src_components_currencyselector_tsx_au1v">
            {filteredCurrencies.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground" data-icod-id="src_components_currencyselector_tsx_bw2w">
                No currencies found
              </div>
            ) : (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors duration-150',
                    value === currency.code
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground hover:bg-muted'
                  )}
                  data-icod-id={`src_components_currencyselector_tsx_cx3y_${currency.code}`}>
                  <div className="flex flex-col" data-icod-id={`src_components_currencyselector_tsx_dy4z_${currency.code}`}>
                    <span className="font-medium" data-icod-id={`src_components_currencyselector_tsx_ez5a_${currency.code}`}>
                      {currency.code}
                      {currency.symbol && (
                        <span className="ml-1 text-muted-foreground" data-icod-id={`src_components_currencyselector_tsx_fa6b_${currency.code}`}>
                          {currency.symbol}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground" data-icod-id={`src_components_currencyselector_tsx_gb7c_${currency.code}`}>
                      {currency.name}
                    </span>
                  </div>
                  {value === currency.code && (
                    <Check className="h-4 w-4 text-primary" data-icod-id={`src_components_currencyselector_tsx_hd8d_${currency.code}`} />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer disclaimer */}
          <div className="border-t border-border bg-muted/30 px-3 py-2" data-icod-id="src_components_currencyselector_tsx_ie9e">
            <p className="text-[10px] italic text-muted-foreground" data-icod-id="src_components_currencyselector_tsx_jf0f">
              Values are automatically converted when you change currency.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
