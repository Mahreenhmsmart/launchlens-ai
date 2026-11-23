import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/utils/i18n';
import { useAppSelector } from '@/store/hooks';

interface UpgradePromptProps {
  message: string;
  className?: string;
}

export default function UpgradePrompt({ message, className }: UpgradePromptProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  // Admin users should never see upgrade prompts
  if (user?.role === 'admin') return null;

  return (
    <Card
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border p-6 text-center',
        className
      )}
      style={{ borderColor: '#D8B779', backgroundColor: 'rgba(216, 183, 121, 0.08)' }}
      data-icod-id="src_components_upgrade_prompt_tsx_root">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(139, 114, 232, 0.15)' }}
        data-icod-id="src_components_upgrade_prompt_tsx_icon_bg">
        <Lock
          className="h-6 w-6 text-[#8B72E8]"
          data-icod-id="src_components_upgrade_prompt_tsx_icon" />
      </div>
      <p
        className="text-sm font-medium text-[#29213D]"
        data-icod-id="src_components_upgrade_prompt_tsx_message">
        {message}
      </p>
      <Button
        onClick={() => navigate('/pricing')}
        className="rounded-xl px-6 py-2 text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #8B72E8 0%, #29213D 100%)' }}
        data-icod-id="src_components_upgrade_prompt_tsx_cta">
        {t('View Plans')}
        <ArrowRight className="ml-1 h-4 w-4" data-icod-id="src_components_upgrade_prompt_tsx_arrow" />
      </Button>
    </Card>
  );
}
