import { Flame } from 'lucide-react';
import { cn } from '@/utils/cn';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;

interface LaunchLensLogoProps {
  className?: string;
  /** Size preset or custom pixel height value */
  size?: LogoSize;
  /** Theme mode — selects the appropriate logo variant for the background */
  theme?: 'light' | 'dark';
}

/** Height in px for each named size preset */
const SIZE_MAP: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
};

/** Aspect ratio of the horizontal logo (2469 x 680) */
const ASPECT_RATIO = 2469 / 680; // ~3.63

/**
 * Resolve a size prop to a numeric pixel height.
 */
function resolveHeight(size: LogoSize): number {
  if (typeof size === 'number') return size;
  return SIZE_MAP[size] ?? SIZE_MAP.md;
}

/**
 * Logo asset — single rocket logo used across all surfaces.
 * Gold rocket icon + "LaunchLens" in white + "AI" in purple gradient.
 * Designed for dark backgrounds (Deep Plum #201034).
 */
const ROCKET_LOGO_URL = 'https://i.postimg.cc/DZ8cCGfb/Launch-Lens-AI-Rocket-Logo.png';

const LOGO_ASSETS = {
  light: ROCKET_LOGO_URL,
  dark: ROCKET_LOGO_URL,
} as const;

export default function LaunchLensLogo({
  className,
  size = 'md',
  theme = 'light',
}: LaunchLensLogoProps) {
  const height = resolveHeight(size);
  const width = Math.round(height * ASPECT_RATIO);
  const assetPath = LOGO_ASSETS[theme];

  return (
    <img
      src={assetPath}
      alt="LaunchLens AI"
      width={width}
      height={height}
      className={cn('shrink-0 object-contain', className)}
      data-icod-id="src_components_launchlenslogo_tsx_dacb" />
  );
}

/**
 * Icon-only variant for collapsed sidebars and similar contexts where the
 * full horizontal wordmark does not fit. Uses the same rocket logo at a
 * smaller size to show just the rocket icon portion.
 */
export function LaunchLensIcon({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: LogoSize;
}) {
  const height = resolveHeight(size);

  return (
    <img
      src={ROCKET_LOGO_URL}
      alt="LaunchLens AI"
      width={height}
      height={height}
      className={cn('shrink-0 object-contain', className)}
      data-icod-id="src_components_launchlenslogo_tsx_e761" />
  );
}

/**
 * Text-based logo fallback for narrow screens where the image logo gets clipped.
 * Renders a flame icon + "LaunchLens AI" in the brand gold colour.
 */
export function LaunchLensTextLogo({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-1 whitespace-nowrap',
        className
      )}
      data-icod-id="src_components_launchlenslogo_tsx_text_logo">
      <Flame
        className="h-4 w-4 text-[#D4AF37]"
        data-icod-id="src_components_launchlenslogo_tsx_text_flame" />
      <span
        className="text-sm font-bold tracking-tight text-[#D4AF37] sm:text-base"
        data-icod-id="src_components_launchlenslogo_tsx_text_name">
        LaunchLens AI
      </span>
    </span>
  );
}
