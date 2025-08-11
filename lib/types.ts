import {
  Task,
  DailyLog,
  User,
  Invoice,
  Client,
  Project,
  ProjectMember,
  TeamMember,
} from "@prisma/client";

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type Priority = "low" | "medium" | "high";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled";
export type PaymentType = "fixed_budget" | "hourly_rate";
export type PaymentStatus = "pending" | "paid" | "overdue";

export type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "JPY";

export type TaskWithUser = Task & {
  user: User;
};

export type DailyLogWithUser = DailyLog & {
  user: User;
};

export type InvoiceWithClient = Invoice & {
  client: Client;
};

export type ClientWithInvoices = Client & {
  invoices: Invoice[];
};

export type ProjectWithClient = Project & {
  client: Client;
};

export type ProjectWithClientAndMembers = Project & {
  client: Client;
  members: ProjectMember[];
};

export type TeamMemberWithAssignments = TeamMember & {
  assignments: ProjectMember[];
};

export type ProjectMemberWithTeamMember = ProjectMember & {
  teamMember: TeamMember | null;
};

export type ClientWithProjects = Client & {
  projects: Project[];
};

export interface CreateTaskData {
  title: string;
  description?: string;
  notes?: string;
  date: Date | string;
  status?: TaskStatus;
  pinned?: boolean;
  priority?: Priority;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  notes?: string;
  status?: TaskStatus;
  pinned?: boolean;
  priority?: Priority;
}

export interface CreateDailyLogData {
  date: Date | string;
  journal_entry?: string;
  mood?: string;
  water_glasses?: number;
  exercised?: boolean;
  sleep_hours?: number;
  day_complete?: boolean;
}

export interface UpdateDailyLogData {
  journal_entry?: string;
  mood?: string;
  water_glasses?: number;
  exercised?: boolean;
  sleep_hours?: number;
  day_complete?: boolean;
}

export interface CreateWeeklyReviewData {
  week_start: Date | string;
  tasks_completed: number;
  tasks_rolled_over: number;
  average_water: number;
  exercise_days: number;
  notes?: string;
}

export interface EndDayData {
  what_went_well: string;
  what_to_improve: string;
  notes_for_tomorrow: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CreateInvoiceData {
  client_id: string;
  invoice_number: string;
  title: string;
  description?: string;
  amount: number;
  currency?: Currency;
  tax_rate?: number;
  issue_date: Date | string;
  due_date: Date | string;
  notes?: string;
}

export interface UpdateInvoiceData {
  client_id?: string;
  invoice_number?: string;
  title?: string;
  description?: string;
  amount?: number;
  currency?: Currency;
  tax_rate?: number;
  status?: InvoiceStatus;
  issue_date?: Date | string;
  due_date?: Date | string;
  sent_date?: Date | string;
  paid_date?: Date | string;
  notes?: string;
}

export interface CreateProjectData {
  client_id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: Date | string;
  end_date?: Date | string;
  budget?: number;
  hourly_rate?: number;
  payment_type?: PaymentType;
  notes?: string;
  personal_project?: boolean;
}

export interface UpdateProjectData {
  client_id?: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: Date | string;
  end_date?: Date | string;
  budget?: number;
  hourly_rate?: number;
  payment_type?: PaymentType;
  notes?: string;
  personal_project?: boolean;
}

export interface CreateProjectMemberData {
  project_id: string;
  name: string;
  role?: string;
  email?: string;
  hourly_rate?: number;
  payment_type?: PaymentType;
  payment_amount?: number;
  notes?: string;
}

export interface UpdateProjectMemberData {
  name?: string;
  role?: string;
  email?: string;
  hourly_rate?: number;
  payment_type?: PaymentType;
  payment_amount?: number;
  payment_status?: PaymentStatus;
  is_active?: boolean;
  left_date?: Date | string;
  notes?: string;
}

export interface CreateTeamMemberData {
  name: string;
  email: string;
  role: string;
  hourly_rate: number;
  notes?: string;
}

export interface UpdateTeamMemberData {
  name?: string;
  email?: string;
  role?: string;
  hourly_rate?: number;
  is_active?: boolean;
  notes?: string;
}

export interface AssignToProjectData {
  project_id: string;
  hourly_rate?: number;
  payment_type?: PaymentType;
  payment_amount?: number;
  role?: string;
  notes?: string;
}
