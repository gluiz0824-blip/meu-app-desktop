export type PageId =
  | "dashboard"
  | "clientes"
  | "cliente"
  | "tarefas"
  | "kanban"
  | "calendario"
  | "assistente"
  | "relatorios"
  | "configuracoes";

export type Client = {
  id: number;
  name: string;
  segment: string;
  company_name?: string;
  contact_name?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  plan?: string;
  posts_per_month?: number;
  reels_per_month?: number;
  monthly_value?: number;
  due_day?: number;
  notes?: string;
  status: string;
  voice_tone?: string;
  main_colors?: string;
  fonts?: string;
  audience?: string;
  services?: string;
  differentiators?: string;
  words_to_use?: string;
  words_to_avoid?: string;
  default_hashtags?: string;
  reference_links?: string;
  drive_folder?: string;
  brand_identity?: string;
  created_at?: string;
  updated_at?: string;
};

export type TaskStatus = "ideia" | "design" | "edicao" | "aguardando_aprovacao" | "postado";
export type Priority = "baixa" | "media" | "alta" | "urgente";

export type Task = {
  id: number;
  title: string;
  client_id?: number | null;
  client_name?: string;
  client_segment?: string;
  content_type: string;
  status: TaskStatus | string;
  priority: Priority | string;
  created_at?: string;
  due_date?: string;
  post_date?: string;
  owner?: string;
  description?: string;
  reference_links?: string;
  caption?: string;
  notes?: string;
  platform?: string;
  format?: string;
  approval_status?: string;
  client_feedback?: string;
  sent_for_approval_at?: string;
  requested_changes?: string;
  approved_at?: string;
  updated_at?: string;
};

export type DashboardData = {
  metrics: {
    todayTasks: number;
    overdueTasks: number;
    inProduction: number;
    awaitingApproval: number;
    completedWeek: number;
    activeClients: number;
    postedMonth: number;
  };
  urgent: Task[];
  upcoming: Task[];
  weekly: Array<{ day: string; total: number }>;
};

export type ReportData = {
  month: string;
  start: string;
  end: string;
  totals: {
    clients: number;
    produced: number;
    contracted: number;
  };
  producedByClient: Array<{
    id: number;
    name: string;
    contracted: number;
    total: number;
    reels: number;
    carousels: number;
    stories: number;
    posts: number;
    tasks: Task[];
  }>;
};

export type AnyRecord = Record<string, string | number | boolean | null | undefined>;
