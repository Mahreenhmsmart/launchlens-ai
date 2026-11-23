import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

export type CardVariant = 'default' | 'lavender' | 'mint' | 'cream';

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-card',
  lavender: 'bg-[rgb(var(--card-lavender))]',
  mint: 'bg-[rgb(var(--card-mint))]',
  cream: 'bg-[rgb(var(--card-cream))]',
};

/**
 * Bordered surface: content card, dashboard tile, form panel, list row.
 * Pass padding and layout through className — <Card className="p-4 flex gap-3">.
 * Use `variant` to apply a soft pastel background tint.
 */
export default function Card({ className, variant = 'default', ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 text-card-foreground',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]',
        'transition-shadow duration-200 ease-in-out',
        variantStyles[variant],
        className,
      )}
      data-icod-id="src_components_ui_card_tsx_be60"
      {...rest} />
  );
}
