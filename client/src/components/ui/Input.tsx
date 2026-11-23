import { forwardRef, useCallback, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * The form-control look as a class string. Use it directly on <textarea> and
 * <select>; use <Input> for <input>.
 *   <textarea className={inputClass('min-h-24 resize-none')} />
 *   <select className={inputClass()} />
 */
export function inputClass(className?: string): string {
  return cn(
    'w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground',
    'placeholder:text-muted-foreground/70 transition-colors',
    'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40',
    'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
    className,
  );
}

export type InputProps = ComponentPropsWithoutRef<'input'>;

/**
 * Round a number to exactly 2 decimal places using the exponential-notation
 * trick to avoid IEEE 754 float64 multiplication artefacts.
 * E.g. Math.round(1500.555 * 100) / 100 → 1500.55 (WRONG, because
 * 1500.555 * 100 = 150055.49999999997 in float64).
 * The string-shift approach avoids this entirely.
 */
function roundTwoSafe(value: number): number {
  if (!Number.isFinite(value)) return value;
  const shifted = Number(`${value}e2`);
  const rounded = Math.round(shifted);
  return Number(`${rounded}e-2`);
}

/**
 * Sanitise a parsed numeric value to remove floating-point artefacts.
 * Rounds to 2 decimal places for decimal fields, or to integer for
 * integer-only fields (type="number" with step="1").
 */
function sanitizeNumericValue(value: number, step?: string | number | null): number {
  if (!Number.isFinite(value)) return value;
  // Integer fields: step="1" or step=1 explicitly indicates integers
  if (step === '1' || step === 1) return Math.round(value);
  // Decimal fields: use robust rounding that avoids float64 multiply errors
  return roundTwoSafe(value);
}

/** Every <input> in the app. Wrap it in <Field> to get a label and error text. */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, onChange, type, step, ...rest },
  ref,
) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // For numeric inputs, sanitise the parsed value before it propagates
      // to parent callbacks or state setters. This prevents floating-point
      // artefacts from entering the data layer regardless of how the parent
      // reads the value (e.target.value string or e.target.valueAsNumber).
      if (type === 'number' && e.target.value !== '') {
        const parsed = parseFloat(e.target.value);
        if (Number.isFinite(parsed)) {
          const sanitized = sanitizeNumericValue(parsed, step);
          // Overwrite valueAsNumber so any downstream reader sees the clean
          // value. Use a getter/setter pair that stays compatible with
          // React's internal controlled-component reconciliation.
          try {
            Object.defineProperty(e.target, 'valueAsNumber', {
              value: sanitized,
              writable: true,
              configurable: true,
            });
          } catch {
            // Some environments seal the DOM element — ignore silently
          }
        }
      }
      onChange?.(e);
    },
    [onChange, type, step],
  );

  return (
    <input
      ref={ref}
      type={type}
      step={step}
      className={inputClass(className)}
      onChange={handleChange}
      data-icod-id="src_components_ui_input_tsx_578c"
      {...rest} />
  );
});

export default Input;
