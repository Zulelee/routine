import {
  Task,
  DailyLog,
  WeeklyReview,
  User,
  Invoice,
  Payment,
  Client,
} from "@prisma/client";

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type Priority = "low" | "medium" | "high";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type PaymentMethod =
  | "bank_transfer"
  | "credit_card"
  | "cash"
  | "check"
  | "paypal"
  | "stripe"
  | "other";

export type TaskWithUser = Task & {
  user: User;
};

export type DailyLogWithUser = DailyLog & {
  user: User;
};

export type WeeklyReviewWithUser = WeeklyReview & {
  user: User;
};

export type InvoiceWithClient = Invoice & {
  client: Client;
  payments: Payment[];
};

export type PaymentWithInvoice = Payment & {
  invoice: Invoice;
};

export type ClientWithInvoices = Client & {
  invoices: Invoice[];
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
  tax_rate?: number;
  status?: InvoiceStatus;
  issue_date?: Date | string;
  due_date?: Date | string;
  sent_date?: Date | string;
  paid_date?: Date | string;
  notes?: string;
}

export interface CreatePaymentData {
  invoice_id: string;
  amount: number;
  payment_date: Date | string;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  payment_date?: Date | string;
  payment_method?: PaymentMethod;
  reference?: string;
  notes?: string;
}
