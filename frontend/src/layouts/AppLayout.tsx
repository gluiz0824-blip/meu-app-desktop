import {
  Archive,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  SquareCheck,
  Users,
  Zap
} from "lucide-react";
import { ReactNode, useState } from "react";
import type { PageId } from "../types";
import { Avatar, Badge, Button, ProgressBar } from "../components/ui";
import clsx from "clsx";
import { formatDate, statusLabel } from "../utils/format";

const nav: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard; badge?: string }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "tarefas", label: "Tarefas", icon: SquareCheck },
  { id: "kanban", label: "Kanban", icon: KanbanSquare },
  { id: "calendario", label: "Calendario", icon: CalendarDays },
  { id: "assistente", label: "Assistente IA", icon: Sparkles, badge: "IA" },
  { id: "relatorios", label: "Relatorios", icon: BarChart3 },
  { id: "configuracoes", label: "Configuracoes", icon: Settings }
];

const subtitles: Record<PageId, string> = {
  dashboard: "Aqui esta o resumo do seu trabalho hoje.",
  clientes: "Briefings, planos e entregas por marca.",
  cliente: "Dados estrategicos e briefing da marca.",
  tarefas: "Organize prazos, prioridades e producao.",
  kanban: "Acompanhe todas as etapas da producao de conteudo.",
  calendario: "Visualize, organize e acompanhe todo o seu calendario de conteudo.",
  assistente: "Gere rascunhos, roteiros e checklists editaveis.",
  relatorios: "Indicadores de demanda e produtividade.",
  configuracoes: "Preferencias, templates e backup."
};

const titles: Record<PageId, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  cliente: "Cliente / Briefing",
  tarefas: "Tarefas",
  kanban: "Pipeline de Conteudo",
  calendario: "Calendario / Planejamento",
  assistente: "Assistente IA",
  relatorios: "Relatorios",
  configuracoes: "Configuracoes"
};

type NotificationTask = {
  id: number;
  title: string;
  client_name?: string;
  due_date?: string;
  status: string;
  priority: string;
  overdue?: boolean;
};

export function AppLayout({ page, setPage, search, setSearch, notifications, children }: { page: PageId; setPage: (page: PageId) => void; search: string; setSearch: (value: string) => void; notifications: NotificationTask[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const todayCount = notifications.filter((task) => !task.overdue).length;
  const overdueCount = notifications.filter((task) => task.overdue).length;
  const sidebar = (
    <aside className="flex h-full w-[240px] flex-col border-r border-[#1e2a2f] bg-[#070a0c]/95 p-5 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full border border-[#00f58a]/50 bg-[#063d28] text-[#00f58a] shadow-[0_0_28px_rgba(0,245,138,.28)]">
          <Zap size={25} fill="currentColor" />
        </div>
        <div>
          <p className="text-xl font-black tracking-[0.22em] text-white">PULSO</p>
          <p className="text-[10px] font-bold tracking-[0.38em] text-white">SOCIAL</p>
        </div>
      </div>
      <nav className="grid gap-1.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.id === page || (page === "cliente" && item.id === "clientes");
          return (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id);
                setOpen(false);
              }}
              className={clsx("group flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition", active ? "neon-glow border border-[#00f58a]/45 bg-[#063d28]/70 text-[#00f58a]" : "text-[#b4bbc3] hover:bg-[#101418] hover:text-white")}
            >
              <Icon size={19} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <Badge tone="success" className="px-2 py-0.5">{item.badge}</Badge>}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto grid gap-3">
        <div className="glass-card rounded-lg p-4">
          <p className="text-sm font-bold text-white">Plano Profissional</p>
          <p className="mt-3 text-sm text-[#c3c8ce]">23 / 50 usuarios</p>
          <div className="mt-3"><ProgressBar value={46} /></div>
        </div>
        <button className="glass-card flex h-12 items-center justify-between rounded-lg px-4 text-sm text-[#c3c8ce] transition hover:border-[#00f58a]/40 hover:text-white">
          <span className="flex items-center gap-2"><CircleHelp size={17} /> Central de Ajuda</span>
          <ChevronDown size={16} className="-rotate-90" />
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen text-white">
      <div className={clsx("fixed inset-y-0 left-0 z-40 transition lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</div>
      {open && <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-20 flex min-h-24 items-center justify-between gap-4 border-b border-[#111a1f] bg-[#050708]/82 px-5 py-4 backdrop-blur-xl xl:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="lg:hidden" onClick={() => setOpen(true)}><Menu size={19} /></Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">{titles[page]}</h1>
              <p className="mt-1 text-sm text-[#b0b7bf]">{subtitles[page]}</p>
            </div>
          </div>
          <div className="hidden min-w-[380px] max-w-[520px] flex-1 items-center justify-center xl:flex">
            <div className="flex h-12 w-full items-center gap-3 rounded-lg border border-[#1e2a2f] bg-[#0b0f12] px-4 text-[#6b7280]">
              <Search size={18} />
              <input className="h-full flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#6b7280]" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar em tarefas, clientes, campanhas..." />
              <kbd className="rounded-md bg-[#151b20] px-2 py-1 text-xs text-[#cbd5e1]">⌘ K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <button className="relative grid h-11 w-11 place-items-center rounded-lg border border-[#1e2a2f] bg-[#0b0f12] transition hover:border-[#00f58a]/50" onClick={() => setNotificationsOpen((value) => !value)} aria-label="Abrir notificacoes">
                <Bell size={21} className="text-[#cbd5e1]" />
                {notifications.length > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#00f58a] px-1 text-[10px] font-black text-[#04100a]">{notifications.length}</span>}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-xl border border-[#1e2a2f] bg-[#070a0c] shadow-2xl shadow-black/50">
                  <div className="border-b border-[#1e2a2f] p-4">
                    <p className="font-black text-white">O que fazer hoje</p>
                    <p className="mt-1 text-xs text-[#9ca3af]">{todayCount} para hoje • {overdueCount} atrasadas</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto thin-scroll">
                    {notifications.length === 0 && <p className="p-5 text-sm text-[#9ca3af]">Nenhuma tarefa para hoje. Pode respirar um pouco.</p>}
                    {notifications.map((task) => (
                      <button key={task.id} onClick={() => { setPage("tarefas"); setNotificationsOpen(false); }} className="block w-full border-b border-[#111a1f] p-4 text-left transition hover:bg-[#101418]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{task.title}</p>
                            <p className="mt-1 text-xs text-[#9ca3af]">{task.client_name || "Sem cliente"} • {statusLabel(task.status)}</p>
                          </div>
                          <span className={clsx("rounded-md px-2 py-1 text-xs font-bold", task.overdue ? "bg-[#3c1215] text-[#ff6b6b]" : "bg-[#063d28] text-[#00f58a]")}>{task.overdue ? "Atrasada" : "Hoje"}</span>
                        </div>
                        <p className="mt-2 text-xs text-[#6b7280]">Entrega: {formatDate(task.due_date)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden h-9 w-px bg-[#1e2a2f] sm:block" />
            <div className="flex items-center gap-3">
              <Avatar name="Luiz Guilherme" />
              <div className="hidden md:block">
                <p className="text-sm font-bold">Luiz Guilherme</p>
                <p className="text-xs text-[#9ca3af]">Social Media</p>
              </div>
              <ChevronDown size={16} className="text-[#9ca3af]" />
            </div>
          </div>
        </header>
        <main className="p-5 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
