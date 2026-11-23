import { Globe } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage, type Language } from '@/store/slices/uiSlice';
import { STORAGE_KEYS, scopedSetRaw, scopedGetRaw } from '@/utils/scopedStorage';
import { useEffect } from 'react';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);

  // Load persisted language on mount / user change
  useEffect(() => {
    if (userId) {
      const stored = scopedGetRaw(STORAGE_KEYS.LANGUAGE, userId, 'en');
      if (stored === 'en' || stored === 'ur') {
        dispatch(setLanguage(stored as Language));
      }
    }
  }, [userId, dispatch]);

  const handleToggle = () => {
    const next: Language = language === 'en' ? 'ur' : 'en';
    dispatch(setLanguage(next));
    if (userId) {
      scopedSetRaw(STORAGE_KEYS.LANGUAGE, userId, next);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition-all duration-150',
        'hover:border-white/40 hover:bg-white/20',
        className,
      )}
      aria-label={`Switch to ${language === 'en' ? 'Roman Urdu' : 'English'}`}
      data-icod-id="src_components_languagetoggle_tsx_root"
    >
      <Globe className="h-3.5 w-3.5" data-icod-id="src_components_languagetoggle_tsx_icon" />
      <span data-icod-id="src_components_languagetoggle_tsx_label">
        {language === 'en' ? (
          <>
            <span
              className="hidden sm:inline"
              data-icod-id="src_components_languagetoggle_tsx_80fb">English</span>
            <span
              className="sm:hidden"
              data-icod-id="src_components_languagetoggle_tsx_ee3d">EN</span>
          </>
        ) : (
          <>
            <span
              className="hidden sm:inline"
              data-icod-id="src_components_languagetoggle_tsx_a74c">Roman Urdu</span>
            <span
              className="sm:hidden"
              data-icod-id="src_components_languagetoggle_tsx_8578">UR</span>
          </>
        )}
      </span>
    </button>
  );
}
