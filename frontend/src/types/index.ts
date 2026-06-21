// ── User ──────────────────────────────────────────────────────
export type UserRole = 'citizen' | 'inspector' | 'maintenance_officer' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  region_id: number | null;
  region_name?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  report_count?: number;
}

// ── Report ────────────────────────────────────────────────────
export type IssueType = 'pothole' | 'damaged_sign' | 'broken_traffic_light' | 'flooded_road' | 'cracked_road' | 'road_blockage' | 'other';
export type Severity  = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'reported' | 'under_review' | 'verified' | 'assigned' | 'in_progress' | 'completed' | 'rejected';

export interface Report {
  id: number;
  report_number: string;
  title: string;
  description: string;
  issue_type: IssueType;
  severity: Severity;
  status: ReportStatus;
  region_id: number;
  region_name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  reported_by: number;
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string;
  assigned_to?: number;
  assignee_name?: string;
  progress_percent: number;
  rejection_reason?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  attachment_count?: number;
  attachments?: Attachment[];
  history?: StatusHistory[];
  maintenance_task?: MaintenanceTask;
}

// ── Attachment ────────────────────────────────────────────────
export interface Attachment {
  id: number;
  report_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

// ── Status History ────────────────────────────────────────────
export interface StatusHistory {
  id: number;
  report_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: number;
  changed_by_name: string;
  notes?: string;
  created_at: string;
}

// ── Maintenance Task ──────────────────────────────────────────
export type TaskStatus   = 'pending' | 'in_progress' | 'completed' | 'paused';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface MaintenanceTask {
  id: number;
  report_id: number;
  report_number?: string;
  report_title?: string;
  assigned_team?: string;
  assigned_officer?: number;
  officer_name?: string;
  inspector_id?: number;
  inspector_name?: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date?: string;
  estimated_completion?: string;
  actual_completion?: string;
  progress_percent: number;
  notes?: string;
  cost_estimate?: number;
  actual_cost?: number;
  region_name?: string;
  severity?: Severity;
  created_at: string;
  updated_at: string;
}

// ── Notification ──────────────────────────────────────────────
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'status_update' | 'assignment' | 'alert' | 'info' | 'success';
  report_id?: number;
  report_number?: string;
  is_read: boolean;
  created_at: string;
}

// ── Region ────────────────────────────────────────────────────
export interface Region {
  id: number;
  name: string;
  code: string;
}

// ── Analytics ─────────────────────────────────────────────────
export interface OverviewStats {
  reports: {
    total_reports: number;
    completed: number;
    pending: number;
    in_progress: number;
    critical_count: number;
    high_count: number;
    this_week: number;
    this_month: number;
  };
  users: {
    total_users: number;
    citizens: number;
    inspectors: number;
    officers: number;
  };
  tasks: {
    total_tasks: number;
    completed_tasks: number;
    active_tasks: number;
    avg_progress: number;
    total_cost: number;
    estimated_cost: number;
  };
  completion_rate: number;
}

// ── API Response ──────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ── Auth ──────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
