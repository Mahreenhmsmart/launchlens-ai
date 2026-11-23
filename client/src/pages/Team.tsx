import { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Trash2, Shield, Lock, UserPlus, Info } from 'lucide-react';
import { Button, Card, Field, Input, Modal, Alert, EmptyState } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/utils/i18n';
import { usePlanGating } from '@/hooks/usePlanGating';
import { useAppSelector } from '@/store/hooks';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem } from '@/utils/scopedStorage';
import type { TeamMember, TeamRole } from '@/types';
import { buttonClass } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Input';
import { Link } from 'react-router-dom';

interface TeamPageProps {
  className?: string;
}

const ROLES: TeamRole[] = ['Admin', 'Editor', 'Viewer'];

export default function TeamPage({ className }: TeamPageProps) {
  const { t } = useTranslation();
  const { canAccessFeature } = usePlanGating();
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id ?? null;

  const hasTeamAccess = canAccessFeature('teamCollaboration');

  // ── State ────────────────────────────────────────────────────────────────
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Viewer');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  // ── Load members from scoped localStorage ────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const stored = scopedGetItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, userId, []);
    setMembers(stored);
  }, [userId]);

  // ── Persist on change ────────────────────────────────────────────────────
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.TEAM_MEMBERS, userId, members);
  }, [members, userId]);

  // ── Owner entry (current signed-in user) ─────────────────────────────────
  const ownerEntry: TeamMember | null = useMemo(() => {
    if (!user) return null;
    return {
      id: '__owner__',
      name: user.name || 'User',
      email: user.email || '',
      role: 'Admin',
      status: 'Active',
      invitedAt: user.createdAt || new Date().toISOString(),
    };
  }, [user]);

  // Combined list: owner first, then invited members
  const displayMembers = useMemo(() => {
    const list: Array<TeamMember & { isOwner: boolean }> = [];
    if (ownerEntry) {
      list.push({ ...ownerEntry, isOwner: true });
    }
    for (const m of members) {
      list.push({ ...m, isOwner: false });
    }
    return list;
  }, [ownerEntry, members]);

  // ── Invite handler ───────────────────────────────────────────────────────
  const handleInvite = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!inviteName.trim()) {
      newErrors.name = t('Name is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inviteEmail.trim() || !emailRegex.test(inviteEmail.trim())) {
      newErrors.email = t('Valid email is required');
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const newMember: TeamMember = {
      id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Invited',
      invitedAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('Viewer');
    setSuccessMsg(t('In-app invite only — no email sent'));
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ── Remove handler ───────────────────────────────────────────────────────
  const confirmRemove = () => {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
    setRemoveTarget(null);
  };

  // ── Role change handler ──────────────────────────────────────────────────
  const handleRoleChange = (memberId: string, newRole: TeamRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  // ── Locked state for Basic plan ──────────────────────────────────────────
  if (!hasTeamAccess) {
    return (
      <div className={cn('space-y-6', className)} data-icod-id="src_pages_team_tsx_locked">
        <div className="space-y-2" data-icod-id="src_pages_team_tsx_60d7">
          <h1 className="text-2xl font-bold text-foreground" data-icod-id="src_pages_team_tsx_locked_title">
            {t('Team Collaboration')}
          </h1>
          <p className="text-muted-foreground" data-icod-id="src_pages_team_tsx_locked_desc">
            {t('Manage your team members and their access levels.')}
          </p>
        </div>
        <Card className="flex flex-col items-center justify-center gap-4 p-10 text-center" data-icod-id="src_pages_team_tsx_locked_card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent" data-icod-id="src_pages_team_tsx_locked_icon_wrap">
            <Lock className="h-8 w-8 text-accent-foreground" data-icod-id="src_pages_team_tsx_locked_icon" />
          </div>
          <h2 className="text-lg font-semibold text-foreground" data-icod-id="src_pages_team_tsx_locked_heading">
            {t('Team collaboration Business plan mein hai — upgrade karein')}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground" data-icod-id="src_pages_team_tsx_locked_body">
            {t('This feature requires the Business plan. Upgrade now to unlock team collaboration, advanced analytics, and higher usage limits.')}
          </p>
          <Link
            to="/pricing"
            className={buttonClass({ variant: 'primary', size: 'md' })}
            data-icod-id="src_pages_team_tsx_locked_cta">
            {t('Upgrade to Business Plan')}
          </Link>
        </Card>
      </div>
    );
  }

  // ── Full-access UI ───────────────────────────────────────────────────────
  return (
    <div className={cn('space-y-6', className)} data-icod-id="src_pages_team_tsx_full">
      {/* Header */}
      <div className="space-y-2" data-icod-id="src_pages_team_tsx_26c8">
        <h1 className="text-2xl font-bold text-foreground" data-icod-id="src_pages_team_tsx_title">
          {t('Team Collaboration')}
        </h1>
        <p className="text-muted-foreground" data-icod-id="src_pages_team_tsx_subtitle">
          {t('Manage your team members and their access levels.')}
        </p>
      </div>
      {/* Success alert */}
      {successMsg && (
        <Alert variant="info" className="gap-2" data-icod-id="src_pages_team_tsx_success_alert">
          <Info className="h-4 w-4 shrink-0" data-icod-id="src_pages_team_tsx_info_icon" />
          <span data-icod-id="src_pages_team_tsx_success_text">{successMsg}</span>
        </Alert>
      )}
      {/* Invite form */}
      <Card className="space-y-4 p-5" data-icod-id="src_pages_team_tsx_invite_card">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground" data-icod-id="src_pages_team_tsx_invite_heading">
          <UserPlus className="h-4 w-4" data-icod-id="src_pages_team_tsx_invite_icon" />
          {t('Invite Member')}
        </h2>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" data-icod-id="src_pages_team_tsx_invite_form">
          <Field label={t('Member Name')} htmlFor="team-name" error={errors.name} data-icod-id="src_pages_team_tsx_name_field">
            <Input
              id="team-name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder={t('Name')}
              data-icod-id="src_pages_team_tsx_name_input"
            />
          </Field>

          <Field label={t('Email')} htmlFor="team-email" error={errors.email} data-icod-id="src_pages_team_tsx_email_field">
            <Input
              id="team-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('Email')}
              data-icod-id="src_pages_team_tsx_email_input"
            />
          </Field>

          <div className="flex flex-col gap-1.5" data-icod-id="src_pages_team_tsx_role_select_wrap">
            <label htmlFor="team-role" className="text-xs font-medium text-muted-foreground" data-icod-id="src_pages_team_tsx_role_label">
              {t('Role')}
            </label>
            <select
              id="team-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamRole)}
              className={inputClass()}
              data-icod-id="src_pages_team_tsx_role_select">
              {ROLES.map((r) => (
                <option key={r} value={r} data-icod-id={`src_pages_team_tsx_bb8a_${r}`}>{t(r)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1" data-icod-id="src_pages_team_tsx_invite_actions">
          <Button onClick={handleInvite} data-icod-id="src_pages_team_tsx_invite_btn">
            <Plus className="mr-1.5 h-4 w-4" data-icod-id="src_pages_team_tsx_plus_icon" />
            {t('Invite Member')}
          </Button>
        </div>
      </Card>
      {/* Member list */}
      {displayMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('No members invited yet')}
          description={t('Invite team members to collaborate on your product launches.')}
          data-icod-id="src_pages_team_tsx_empty"
        />
      ) : (
        <div className="space-y-3" data-icod-id="src_pages_team_tsx_list">
          {displayMembers.map((member) => (
            <Card
              key={member.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              data-icod-id={`src_pages_team_tsx_member_${member.id}`}>
              {/* Left: name, email, status badge */}
              <div className="min-w-0 space-y-1" data-icod-id="src_pages_team_tsx_member_info">
                <div className="flex items-center gap-2" data-icod-id="src_pages_team_tsx_member_name_row">
                  <span className="truncate font-medium text-foreground" data-icod-id="src_pages_team_tsx_member_name">
                    {member.name}
                  </span>
                  {member.isOwner && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-foreground" data-icod-id="src_pages_team_tsx_owner_badge">
                      <Shield className="h-3 w-3" data-icod-id="src_pages_team_tsx_shield_icon" />
                      {t('Owner')}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground" data-icod-id="src_pages_team_tsx_member_email">
                  {member.email}
                </p>
                <div className="flex items-center gap-2 pt-0.5" data-icod-id="src_pages_team_tsx_member_status_row">
                  <span
                    className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                      member.status === 'Active'
                        ? 'bg-success/15 text-success'
                        : 'bg-warning/15 text-warning'
                    )}
                    data-icod-id="src_pages_team_tsx_status_badge">
                    {t(member.status)}
                  </span>
                </div>
              </div>

              {/* Right: role selector + remove */}
              <div className="flex items-center gap-2" data-icod-id="src_pages_team_tsx_member_actions">
                {member.isOwner ? (
                  <span className="rounded px-2 py-1 text-xs font-medium text-muted-foreground" data-icod-id="src_pages_team_tsx_owner_role">
                    {t('Admin')}
                  </span>
                ) : (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                      className={cn(inputClass(), 'w-28 text-xs')}
                      aria-label={t('Change Role')}
                      data-icod-id={`src_pages_team_tsx_role_changer_${member.id}`}>
                      {ROLES.map((r) => (
                        <option
                          key={r}
                          value={r}
                          data-icod-id={`src_pages_team_tsx_1dd8_${member.id}_${r}`}>{t(r)}</option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('Remove')}
                      onClick={() => setRemoveTarget(member)}
                      data-icod-id={`src_pages_team_tsx_remove_btn_${member.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" data-icod-id="src_pages_team_tsx_trash_icon" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Remove confirmation modal */}
      <Modal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title={t('Remove Member')}
        footer={
          <>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} data-icod-id="src_pages_team_tsx_modal_cancel">
              {t('Cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmRemove} data-icod-id="src_pages_team_tsx_modal_confirm">
              {t('Remove')}
            </Button>
          </>
        }
        className="max-w-sm"
        data-icod-id="src_pages_team_tsx_remove_modal">
        <p className="text-sm text-muted-foreground" data-icod-id="src_pages_team_tsx_modal_body">
          {t('Are you sure you want to remove this member from your team? This action cannot be undone.')}
        </p>
        {removeTarget && (
          <p className="mt-2 text-sm font-medium text-foreground" data-icod-id="src_pages_team_tsx_modal_target">
            {removeTarget.name} ({removeTarget.email})
          </p>
        )}
      </Modal>
    </div>
  );
}
