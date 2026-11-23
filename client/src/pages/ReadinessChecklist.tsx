import { useState, useMemo } from 'react';
import {
  CheckSquare,
  Circle,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Lightbulb,
  ListChecks,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { PageId } from '@/components/Sidebar';
import type { ChecklistTask } from '../App';
import { useTranslation } from '@/utils/i18n';

interface ReadinessChecklistProps {
  onNavigate: (page: PageId) => void;
  tasks: ChecklistTask[];
  onTaskToggle: (taskId: string) => void;
  onReset: () => void;
  onAddCustomTask?: (task: Omit<ChecklistTask, 'id'>) => void;
  onDeleteCustomTask?: (taskId: string) => void;
}

export default function ReadinessChecklist({
  onNavigate,
  tasks,
  onTaskToggle,
  onReset,
  onAddCustomTask,
  onDeleteCustomTask,
}: ReadinessChecklistProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { t } = useTranslation();
  // Calculate completion stats
  const completedCount = useMemo(() => tasks.filter((t) => t.checked).length, [tasks]);
  const remainingCount = tasks.length - completedCount;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Separate incomplete tasks
  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.checked), [tasks]);

  // Handle reset with confirmation dialog
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    onReset();
  };

  // Handle adding a custom task
  const handleAddCustomTask = () => {
    if (!newTaskName.trim() || !onAddCustomTask) return;
    
    onAddCustomTask({
      label: newTaskName.trim(),
      description: 'Custom task added by user',
      priority: 'Medium',
      suggestion: 'Complete this task as part of your launch preparation',
      checked: false,
    });
    setNewTaskName('');
  };

  // Handle key press in custom task input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomTask();
    }
  };

  return (
    <div
      className="space-y-6"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_readinesschecklist_tsx_e8d8">
      {/* Page Header */}
      <div className="space-y-2" data-icod-id="src_pages_readinesschecklist_tsx_604b">
        <div className="flex items-center gap-4" data-icod-id="src_pages_readinesschecklist_tsx_header_row">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('overview')}
            data-icod-id="src_pages_readinesschecklist_tsx_back_btn">
            <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_readinesschecklist_tsx_back_icon" />
          </Button>
          <div data-icod-id="src_pages_readinesschecklist_tsx_header_text">
            <h1
              className="text-3xl font-bold text-[#171717]"
              data-icod-id="src_pages_readinesschecklist_tsx_a358">
              {t('Launch Readiness Checklist')}
            </h1>
            <p
              className="text-muted-foreground"
              data-icod-id="src_pages_readinesschecklist_tsx_24af">
              {t("Ensure you've covered all the bases before launching your product.")}
            </p>
          </div>
        </div>
      </div>
      {/* Progress Summary Card */}
      <Card variant="lavender" className="p-6" data-icod-id="src_pages_readinesschecklist_tsx_progress_card">
        <div className="flex flex-col gap-6 md:flex-row md:items-center" data-icod-id="src_pages_readinesschecklist_tsx_progress_layout">
          {/* Circular Progress */}
          <div className="flex shrink-0 flex-col items-center gap-2" data-icod-id="src_pages_readinesschecklist_tsx_circular_wrap">
            <div className="relative h-32 w-32" data-icod-id="src_pages_readinesschecklist_tsx_circular_container">
              <svg
                className="h-full w-full -rotate-90 transform"
                viewBox="0 0 36 36"
                data-icod-id="src_pages_readinesschecklist_tsx_circular_svg">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted"
                  data-icod-id="src_pages_readinesschecklist_tsx_circular_bg" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeLinecap="round"
                  className={cn(
                    'transition-all duration-500',
                    completionPercentage >= 75 ? 'text-[#9DD37D]' : completionPercentage >= 50 ? 'text-[#C9D0FC]' : 'text-[#E88B9E]'
                  )}
                  data-icod-id="src_pages_readinesschecklist_tsx_circular_progress" />
              </svg>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                data-icod-id="src_pages_readinesschecklist_tsx_circular_center">
                <span
                  className="text-2xl font-bold text-foreground"
                  data-icod-id="src_pages_readinesschecklist_tsx_circular_percent">
                  {completionPercentage}%
                </span>
                <span
                  className="text-[10px] font-medium uppercase text-muted-foreground"
                  data-icod-id="src_pages_readinesschecklist_tsx_circular_label">
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex-1 space-y-4" data-icod-id="src_pages_readinesschecklist_tsx_stats_wrap">
            <div className="flex flex-wrap gap-4" data-icod-id="src_pages_readinesschecklist_tsx_stats_row">
              <div className="rounded-lg bg-[#9DD37D]/20 px-4 py-2" data-icod-id="src_pages_readinesschecklist_tsx_stat_completed">
                <p
                  className="text-xs font-medium uppercase text-muted-foreground"
                  data-icod-id="src_pages_readinesschecklist_tsx_e5d8">Completed</p>
                <p
                  className="text-2xl font-bold text-[#9DD37D]"
                  data-icod-id="src_pages_readinesschecklist_tsx_228c">{completedCount}</p>
              </div>
              <div className="rounded-lg bg-[#E88B9E]/10 px-4 py-2" data-icod-id="src_pages_readinesschecklist_tsx_stat_remaining">
                <p
                  className="text-xs font-medium uppercase text-muted-foreground"
                  data-icod-id="src_pages_readinesschecklist_tsx_097c">Remaining</p>
                <p
                  className="text-2xl font-bold text-[#E88B9E]"
                  data-icod-id="src_pages_readinesschecklist_tsx_27be">{remainingCount}</p>
              </div>
              <div className="rounded-lg bg-[#C9D0FC]/10 px-4 py-2" data-icod-id="src_pages_readinesschecklist_tsx_stat_total">
                <p
                  className="text-xs font-medium uppercase text-muted-foreground"
                  data-icod-id="src_pages_readinesschecklist_tsx_a815">Total Tasks</p>
                <p
                  className="text-2xl font-bold text-[#C9D0FC]"
                  data-icod-id="src_pages_readinesschecklist_tsx_77b6">{tasks.length}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2" data-icod-id="src_pages_readinesschecklist_tsx_progress_bar_wrap">
              <div className="flex justify-between text-sm" data-icod-id="src_pages_readinesschecklist_tsx_progress_labels">
                <span
                  className="font-medium text-foreground"
                  data-icod-id="src_pages_readinesschecklist_tsx_f068">Progress</span>
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_readinesschecklist_tsx_3be2">{completedCount} of {tasks.length} tasks</span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted" data-icod-id="src_pages_readinesschecklist_tsx_progress_track">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    completionPercentage >= 75 ? 'bg-[#9DD37D]' : completionPercentage >= 50 ? 'bg-[#C9D0FC]' : 'bg-[#E88B9E]'
                  )}
                  style={{ width: `${completionPercentage}%` }}
                  data-icod-id="src_pages_readinesschecklist_tsx_progress_fill" />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end gap-2 pt-2" data-icod-id="src_pages_readinesschecklist_tsx_actions">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
                data-icod-id="src_pages_readinesschecklist_tsx_reset_btn">
                <RotateCcw className="h-4 w-4" data-icod-id="src_pages_readinesschecklist_tsx_reset_icon" />
                Reset Checklist
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {/* Add Custom Task Section */}
      {onAddCustomTask && (
        <Card className="p-4" data-icod-id="src_pages_readinesschecklist_tsx_add_task_card">
          <div
            className="flex items-center gap-3"
            data-icod-id="src_pages_readinesschecklist_tsx_2b46">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10"
              data-icod-id="src_pages_readinesschecklist_tsx_012c">
              <Plus className="h-5 w-5 text-accent-foreground" data-icod-id="src_pages_readinesschecklist_tsx_add_task_icon" />
            </div>
            <div className="flex-1" data-icod-id="src_pages_readinesschecklist_tsx_26d3">
              <label className="mb-1 block text-sm font-medium text-foreground" data-icod-id="src_pages_readinesschecklist_tsx_add_task_label">
                Add Custom Task
              </label>
              <div
                className="flex gap-2"
                data-icod-id="src_pages_readinesschecklist_tsx_7be1">
                <Input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter custom task name..."
                  className="flex-1"
                  data-icod-id="src_pages_readinesschecklist_tsx_add_task_input"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddCustomTask}
                  disabled={!newTaskName.trim()}
                  className="gap-1"
                  data-icod-id="src_pages_readinesschecklist_tsx_add_task_btn">
                  <Plus className="h-4 w-4" data-icod-id="src_pages_readinesschecklist_tsx_eeda" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
      {/* All Tasks Grid */}
      <div className="grid gap-6 lg:grid-cols-2" data-icod-id="src_pages_readinesschecklist_tsx_tasks_grid">
        {/* High Priority Tasks */}
        <Card variant="cream" className="p-6" data-icod-id="src_pages_readinesschecklist_tsx_high_priority_card">
          <div className="mb-4 flex items-center gap-2" data-icod-id="src_pages_readinesschecklist_tsx_high_header">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E88B9E]/20"
              data-icod-id="src_pages_readinesschecklist_tsx_high_icon_wrap">
              <AlertCircle className="h-5 w-5 text-[#E88B9E]" data-icod-id="src_pages_readinesschecklist_tsx_high_icon" />
            </div>
            <h2 className="text-lg font-semibold text-foreground" data-icod-id="src_pages_readinesschecklist_tsx_high_title">
              High Priority
            </h2>
          </div>
          <div className="space-y-3" data-icod-id="src_pages_readinesschecklist_tsx_high_list">
            {tasks
              .filter((t) => t.priority === 'High')
              .map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'group cursor-pointer rounded-lg border p-4 transition-all duration-150',
                    task.checked
                      ? 'border-[#9DD37D] bg-[#9DD37D]/10'
                      : 'border-border bg-card hover:border-[#C9D0FC]/30 hover:bg-muted/50'
                  )}
                  onClick={() => onTaskToggle(task.id)}
                  data-icod-id={`src_pages_readinesschecklist_tsx_task_${task.id}`}>
                  <div className="flex items-start gap-3" data-icod-id={`src_pages_readinesschecklist_tsx_task_content_${task.id}`}>
                    {task.checked ? (
                      <CheckSquare
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD37D]"
                        data-icod-id={`src_pages_readinesschecklist_tsx_check_${task.id}`} />
                    ) : (
                      <Circle
                        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground group-hover:text-[#C9D0FC]"
                        data-icod-id={`src_pages_readinesschecklist_tsx_circle_${task.id}`} />
                    )}
                    <div className="flex-1" data-icod-id={`src_pages_readinesschecklist_tsx_task_body_${task.id}`}>
                      <p
                        className={cn(
                          'font-medium transition-all',
                          task.checked ? 'text-foreground line-through opacity-60' : 'text-foreground'
                        )}
                        data-icod-id={`src_pages_readinesschecklist_tsx_task_label_${task.id}`}>
                        {task.label}
                      </p>
                      <p
                        className="mt-1 text-xs text-muted-foreground"
                        data-icod-id={`src_pages_readinesschecklist_tsx_task_desc_${task.id}`}>
                        {task.description}
                      </p>
                      {!task.checked && (
                        <div
                          className="mt-2 flex items-start gap-1.5 rounded-md bg-[#C9D0FC]/5 px-2 py-1.5 text-xs text-muted-foreground"
                          data-icod-id={`src_pages_readinesschecklist_tsx_suggestion_${task.id}`}>
                          <Lightbulb
                            className="mt-0.5 h-3 w-3 shrink-0 text-[#C9D0FC]"
                            data-icod-id={`src_pages_readinesschecklist_tsx_4dac_${task.id}`} />
                          <span data-icod-id={`src_pages_readinesschecklist_tsx_0122_${task.id}`}>{task.suggestion}</span>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id={`src_pages_readinesschecklist_tsx_3c6e_${task.id}`}>
                      {task.autoChecked && (
                        <span
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#C9D0FC]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#7C3AED]"
                          title={t('Auto-detected from your data')}
                          data-icod-id={`src_pages_readinesschecklist_tsx_auto_badge_${task.id}`}>
                          <Sparkles
                            className="h-2.5 w-2.5"
                            data-icod-id={`src_pages_readinesschecklist_tsx_0be9_${task.id}`} />
                          {t('Auto')}
                        </span>
                      )}
                      <span
                        className="shrink-0 rounded-full bg-[#E88B9E]/20 px-2 py-0.5 text-[10px] font-semibold text-[#E88B9E]"
                        data-icod-id={`src_pages_readinesschecklist_tsx_badge_${task.id}`}>
                        High
                      </span>
                      {task.id.startsWith('custom-') && onDeleteCustomTask && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomTask(task.id);
                          }}
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete custom task"
                          data-icod-id={`src_pages_readinesschecklist_tsx_delete_${task.id}`}>
                          <Trash2
                            className="h-3.5 w-3.5"
                            data-icod-id={`src_pages_readinesschecklist_tsx_d05a_${task.id}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Medium Priority Tasks */}
        <Card variant="mint" className="p-6" data-icod-id="src_pages_readinesschecklist_tsx_medium_priority_card">
          <div className="mb-4 flex items-center gap-2" data-icod-id="src_pages_readinesschecklist_tsx_medium_header">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9D0FC]/10"
              data-icod-id="src_pages_readinesschecklist_tsx_medium_icon_wrap">
              <ListChecks className="h-5 w-5 text-[#C9D0FC]" data-icod-id="src_pages_readinesschecklist_tsx_medium_icon" />
            </div>
            <h2 className="text-lg font-semibold text-foreground" data-icod-id="src_pages_readinesschecklist_tsx_medium_title">
              Medium Priority
            </h2>
          </div>
          <div className="space-y-3" data-icod-id="src_pages_readinesschecklist_tsx_medium_list">
            {tasks
              .filter((t) => t.priority === 'Medium')
              .map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'group cursor-pointer rounded-lg border p-4 transition-all duration-150',
                    task.checked
                      ? 'border-[#9DD37D] bg-[#9DD37D]/10'
                      : 'border-border bg-card hover:border-[#C9D0FC]/30 hover:bg-muted/50'
                  )}
                  onClick={() => onTaskToggle(task.id)}
                  data-icod-id={`src_pages_readinesschecklist_tsx_task_${task.id}`}>
                  <div className="flex items-start gap-3" data-icod-id={`src_pages_readinesschecklist_tsx_task_content_${task.id}`}>
                    {task.checked ? (
                      <CheckSquare
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD37D]"
                        data-icod-id={`src_pages_readinesschecklist_tsx_check_${task.id}`} />
                    ) : (
                      <Circle
                        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground group-hover:text-[#C9D0FC]"
                        data-icod-id={`src_pages_readinesschecklist_tsx_circle_${task.id}`} />
                    )}
                    <div className="flex-1" data-icod-id={`src_pages_readinesschecklist_tsx_task_body_${task.id}`}>
                      <p
                        className={cn(
                          'font-medium transition-all',
                          task.checked ? 'text-foreground line-through opacity-60' : 'text-foreground'
                        )}
                        data-icod-id={`src_pages_readinesschecklist_tsx_task_label_${task.id}`}>
                        {task.label}
                      </p>
                      <p
                        className="mt-1 text-xs text-muted-foreground"
                        data-icod-id={`src_pages_readinesschecklist_tsx_task_desc_${task.id}`}>
                        {task.description}
                      </p>
                      {!task.checked && (
                        <div
                          className="mt-2 flex items-start gap-1.5 rounded-md bg-[#C9D0FC]/5 px-2 py-1.5 text-xs text-muted-foreground"
                          data-icod-id={`src_pages_readinesschecklist_tsx_suggestion_${task.id}`}>
                          <Lightbulb
                            className="mt-0.5 h-3 w-3 shrink-0 text-[#C9D0FC]"
                            data-icod-id={`src_pages_readinesschecklist_tsx_c1cf_${task.id}`} />
                          <span data-icod-id={`src_pages_readinesschecklist_tsx_b4f4_${task.id}`}>{task.suggestion}</span>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id={`src_pages_readinesschecklist_tsx_2700_${task.id}`}>
                      {task.autoChecked && (
                        <span
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#C9D0FC]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#7C3AED]"
                          title={t('Auto-detected from your data')}
                          data-icod-id={`src_pages_readinesschecklist_tsx_auto_badge_${task.id}`}>
                          <Sparkles
                            className="h-2.5 w-2.5"
                            data-icod-id={`src_pages_readinesschecklist_tsx_f58f_${task.id}`} />
                          {t('Auto')}
                        </span>
                      )}
                      <span
                        className="shrink-0 rounded-full bg-[#C9D0FC]/10 px-2 py-0.5 text-[10px] font-semibold text-[#C9D0FC]"
                        data-icod-id={`src_pages_readinesschecklist_tsx_badge_${task.id}`}>
                        Medium
                      </span>
                      {task.id.startsWith('custom-') && onDeleteCustomTask && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomTask(task.id);
                          }}
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete custom task"
                          data-icod-id={`src_pages_readinesschecklist_tsx_delete_${task.id}`}>
                          <Trash2
                            className="h-3.5 w-3.5"
                            data-icod-id={`src_pages_readinesschecklist_tsx_e18e_${task.id}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
      {/* Incomplete Tasks Section */}
      {incompleteTasks.length > 0 && (
        <Card variant="lavender" className="p-6" data-icod-id="src_pages_readinesschecklist_tsx_incomplete_card">
          <div className="mb-4 flex items-center gap-2" data-icod-id="src_pages_readinesschecklist_tsx_incomplete_header">
            <AlertCircle className="h-5 w-5 text-[#E88B9E]" data-icod-id="src_pages_readinesschecklist_tsx_incomplete_icon" />
            <h2 className="text-lg font-semibold text-foreground" data-icod-id="src_pages_readinesschecklist_tsx_incomplete_title">
              Remaining Tasks ({incompleteTasks.length})
            </h2>
          </div>
          <div className="space-y-2" data-icod-id="src_pages_readinesschecklist_tsx_incomplete_list">
            {incompleteTasks.map((task) => (
              <div
                key={`incomplete-${task.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                data-icod-id={`src_pages_readinesschecklist_tsx_incomplete_item_${task.id}`}>
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" data-icod-id={`src_pages_readinesschecklist_tsx_incomplete_circle_${task.id}`} />
                <span className="flex-1 text-sm font-medium text-foreground" data-icod-id={`src_pages_readinesschecklist_tsx_incomplete_label_${task.id}`}>
                  {task.label}
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    task.priority === 'High'
                      ? 'bg-[#E88B9E]/20 text-[#E88B9E]'
                      : 'bg-[#C9D0FC]/10 text-[#C9D0FC]'
                  )}
                  data-icod-id={`src_pages_readinesschecklist_tsx_incomplete_badge_${task.id}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Completion Message */}
      {completionPercentage === 100 && (
        <Card className="border-[#9DD37D] bg-[#9DD37D]/10 p-6 text-center" data-icod-id="src_pages_readinesschecklist_tsx_complete_card">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#9DD37D] text-[#171717]" data-icod-id="src_pages_readinesschecklist_tsx_complete_icon_wrap">
            <CheckSquare className="h-8 w-8" data-icod-id="src_pages_readinesschecklist_tsx_complete_icon" />
          </div>
          <h3 className="text-xl font-bold text-foreground" data-icod-id="src_pages_readinesschecklist_tsx_complete_title">
            All Tasks Complete!
          </h3>
          <p className="mt-2 text-muted-foreground" data-icod-id="src_pages_readinesschecklist_tsx_complete_text">
            You've completed all launch readiness tasks. You're ready to proceed with confidence.
          </p>
        </Card>
      )}
      {/* Reset Confirmation Modal */}
      <Modal
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Checklist"
        footer={
          <div
            className="flex gap-2"
            data-icod-id="src_pages_readinesschecklist_tsx_aa36">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetConfirm(false)}
              data-icod-id="src_pages_readinesschecklist_tsx_9b0b">Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmReset}
              data-icod-id="src_pages_readinesschecklist_tsx_a264">Reset</Button>
          </div>
        }
        data-icod-id="src_pages_readinesschecklist_tsx_46ca">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_readinesschecklist_tsx_3f81">{t('This will reset all manual overrides and custom tasks. Auto-detected tasks will be restored based on your current data. This action cannot be undone.')}</p>
      </Modal>
    </div>
  );
}
