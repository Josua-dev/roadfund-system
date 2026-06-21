import { Severity, ReportStatus, IssueType, TaskStatus, TaskPriority } from '../types';

export const formatDate = (d: string) =>
  !d ? 'N/A' : new Date(d).toLocaleDateString('en-NA', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (d: string) =>
  !d ? 'N/A' : new Date(d).toLocaleString('en-NA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
};

export const formatCurrency = (n?: number | null) =>
  n == null ? 'N/A' : `N$ ${Number(n).toLocaleString('en-NA', { minimumFractionDigits: 2 })}`;

export const truncate = (s: string, n: number) => (s?.length > n ? s.slice(0, n) + '...' : s);

/* Severity → tag class + dot color.
   Fixed from audit finding: 'high' was previously mapped to the
   navy/info palette, which doesn't escalate visually relative to
   medium — it read as a *different category*, not a *worse* one.
   Severity should read on a single rising scale: info → amber →
   burnt-amber → red. */
export const severityConfig: Record<Severity, { label: string; tag: string; dotColor: string }> = {
  low:      { label: 'Low',      tag: 'tag-info',    dotColor: 'var(--info)' },
  medium:   { label: 'Medium',   tag: 'tag-warning', dotColor: 'var(--warning)' },
  high:     { label: 'High',     tag: 'tag-warning', dotColor: '#8A4A1E' },
  critical: { label: 'Critical', tag: 'tag-error',   dotColor: 'var(--error)' },
};

/* Status → tag class.
   The previous version carried a dead `icon: ''` field on every
   entry — leftover from an emoji pass that was later stripped.
   Removed rather than left blank; if status icons come back, add
   a typed `Icon?: LucideIcon` field deliberately, not a string. */
export const statusConfig: Record<ReportStatus, { label: string; tag: string }> = {
  reported:     { label: 'Reported',     tag: 'tag-neutral' },
  under_review: { label: 'Under Review', tag: 'tag-info' },
  verified:     { label: 'Verified',     tag: 'tag-info' },
  assigned:     { label: 'Assigned',     tag: 'tag-warning' },
  in_progress:  { label: 'In Progress',  tag: 'tag-warning' },
  completed:    { label: 'Completed',    tag: 'tag-success' },
  rejected:     { label: 'Rejected',     tag: 'tag-error' },
};

export const issueTypeConfig: Record<IssueType, { label: string; mapColor: string }> = {
  pothole:              { label: 'Pothole',         mapColor: '#963B3B' },
  damaged_sign:         { label: 'Damaged Sign',     mapColor: '#A8762E' },
  broken_traffic_light: { label: 'Traffic Light',    mapColor: '#7A6A1E' },
  flooded_road:         { label: 'Flooded Road',     mapColor: '#3C5E78' },
  cracked_road:         { label: 'Cracked Surface',  mapColor: '#5C4A78' },
  road_blockage:        { label: 'Road Blockage',    mapColor: '#3C7A5C' },
  other:                { label: 'Other',            mapColor: '#5C5950' },
};

export const taskStatusConfig: Record<TaskStatus, { label: string; tag: string }> = {
  pending:     { label: 'Pending',     tag: 'tag-neutral' },
  in_progress: { label: 'In Progress', tag: 'tag-warning' },
  completed:   { label: 'Completed',   tag: 'tag-success' },
  paused:      { label: 'Paused',      tag: 'tag-info' },
};

export const priorityConfig: Record<TaskPriority, { label: string; tag: string }> = {
  low:    { label: 'Low',    tag: 'tag-neutral' },
  normal: { label: 'Normal', tag: 'tag-info' },
  high:   { label: 'High',   tag: 'tag-warning' },
  urgent: { label: 'Urgent', tag: 'tag-error' },
};

export const roleConfig: Record<string, { label: string; tag: string }> = {
  citizen:             { label: 'Citizen',             tag: 'tag-neutral' },
  inspector:           { label: 'Inspector',           tag: 'tag-info' },
  maintenance_officer: { label: 'Maintenance Officer', tag: 'tag-warning' },
  admin:               { label: 'Administrator',       tag: 'tag-success' },
};
