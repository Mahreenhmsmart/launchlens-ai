/**
 * HeroSlider — full-width static hero banner image with a loading skeleton.
 */

import { useState } from 'react';
import { useTranslation } from '@/utils/i18n';

const HERO_IMAGE = '/assets/1795052257815_slide-1-1920x1080-upload.webp';

export default function HeroSlider() {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full select-none" data-icod-id="src_components_heroslider_tsx_87be">
      {/* Banner container — fixed responsive height with overflow-hidden */}
      <div
        className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl shadow-xl h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px]"
        data-icod-id="src_components_heroslider_tsx_677c"
      >
        {/* Loading skeleton — visible until the image finishes loading */}
        {!loaded && (
          <div
            className="absolute inset-0 z-10 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #C9D0FC 0%, #E88B9E 50%, #9DD37D 100%)',
            }}
            aria-hidden="true"
            data-icod-id="src_components_heroslider_tsx_skeleton"
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
              data-icod-id="src_components_heroslider_tsx_c3ba"
            />
          </div>
        )}

        {/* Static hero image */}
        <img
          src={HERO_IMAGE}
          alt={t('Hero slide')}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
          width={1920}
          height={1080}
          onLoad={() => setLoaded(true)}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in',
          }}
          data-icod-id="src_components_heroslider_tsx_img_0"
        />
      </div>
      {/* Illustrative-example caption */}
      <p
        className="mt-2 text-center text-xs italic text-muted-foreground"
        data-icod-id="src_components_heroslider_tsx_caption"
      >
        {t('Dashboard figures shown are an illustrative example using the demo product (Premium Skincare Serum).')}
      </p>
    </div>
  );
}
