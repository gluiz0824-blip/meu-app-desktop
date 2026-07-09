import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { Assistant } from "./pages/Assistant";
import { CalendarPlanning } from "./pages/CalendarPlanning";
import { ClientBriefing } from "./pages/ClientBriefing";
import { ClientsPage } from "./pages/ClientsPage";
import { Dashboard } from "./pages/Dashboard";
import { Kanban } from "./pages/Kanban";
import { Placeholder } from "./pages/Placeholder";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TasksPage } from "./pages/TasksPage";
import { api } from "./services/api";
import { Button, Input, Modal, Select } from "./components/ui";
import type { AnyRecord, Client, DashboardData, PageId, Task } from "./types";
import { contentTypes, statusOptions } from "./utils/options";
import { toDateInput } from "./utils/format";

const pathToPage: Record<string, PageId> = {
  "/dashboard": "dashboard",
  "/clientes": "clientes",
  "/clientes/2": "cliente",
  "/tarefas": "tarefas",
  "/kanban": "kanban",
  "/calendario": "calendario",
  "/assistente": "assistente",
  "/relatorios": "relatorios",
  "/configuracoes": "configuracoes"
};

const pageToPath: Record<PageId, string> = {
  dashboard: "/dashboard",
  clientes: "/clientes",
  cliente: "/clientes/2",
  tarefas: "/tarefas",
  kanban: "/kanban",
  calendario: "/calendario",
  assistente: "/assistente",
  relatorios: "/relatorios",
  configuracoes: "/configuracoes"
};

function QuickTaskModal({ open, status, clients, onClose, onSaved }: { open: boolean; status?: string; clients: Client[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AnyRecord>({ title: "", client_id: "", content_type: "post estatico", status: status ?? "ideia", priority: "media", due_date: "", post_date: "", platform: "Instagram" });
  useEffect(() => {
    if (open) setForm((old) => ({ ...old, status: status ?? "ideia" }));
  }, [open, status]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/tasks", { ...form, client_id: form.client_id ? Number(form.client_id) : null });
    onSaved();
  };
  return (
    <Modal title="Nova tarefa" open={open} onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Titulo<Input required value={String(form.title ?? "")} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Cliente<Select value={String(form.client_id ?? "")} onChange={(e) => setForm({ ...form, client_id: e.target.value })}><option value="">Sem cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select></label>
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Tipo<Select value={String(form.content_type ?? "")} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>{contentTypes.map((type) => <option key={type}>{type}</option>)}</Select></label>
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Status<Select value={String(form.status ?? "")} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statusOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select></label>
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Entrega<Input type="date" value={String(form.due_date ?? "")} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label>
        </div>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button>Criar tarefa</Button></div>
      </form>
    </Modal>
  );
}

export function App() {
  const [page, setPageState] = useState<PageId>(() => pathToPage[window.location.pathname] ?? "dashboard");
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickStatus, setQuickStatus] = useState<string | undefined>();

  const setPage = (next: PageId) => {
    setPageState(next);
    window.history.pushState({}, "", pageToPath[next]);
  };

  const load = async () => {
    setLoading(true);
    const [clientRows, taskRows, dashboardData] = await Promise.all([
      api.get<Client[]>("/clients"),
      api.get<Task[]>("/tasks"),
      api.get<DashboardData>("/dashboard")
    ]);
    setClients(clientRows);
    setTasks(taskRows);
    setDashboard(dashboardData);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const onPop = () => setPageState(pathToPage[window.location.pathname] ?? "dashboard");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? clients[0];
  const today = toDateInput(new Date());
  const notifications = tasks
    .filter((task) => task.status !== "postado" && task.status !== "cancelado" && task.due_date && task.due_date <= today)
    .map((task) => ({ ...task, overdue: Boolean(task.due_date && task.due_date < today) }))
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return String(a.due_date).localeCompare(String(b.due_date));
    });
  const content = useMemo(() => {
    if (loading) return <Placeholder title="Carregando sistema" />;
    if (page === "dashboard") return <Dashboard clients={clients} tasks={tasks} dashboard={dashboard} />;
    if (page === "clientes") return <ClientsPage clients={clients} tasks={tasks} search={search} setPage={setPage} setSelectedClientId={setSelectedClientId} reload={load} />;
    if (page === "cliente") return <ClientBriefing client={selectedClient} tasks={tasks} goBack={() => setPage("clientes")} reload={load} />;
    if (page === "tarefas") return <TasksPage tasks={tasks} clients={clients} search={search} reload={load} />;
    if (page === "kanban") return <Kanban tasks={tasks} clients={clients} search={search} reload={load} onNewTask={(status) => { setQuickStatus(status); setQuickOpen(true); }} />;
    if (page === "calendario") return <CalendarPlanning tasks={tasks} clients={clients} search={search} reload={load} />;
    if (page === "assistente") return <Assistant clients={clients} />;
    if (page === "relatorios") return <ReportsPage clients={clients} />;
    if (page === "configuracoes") return <SettingsPage />;
    return <Placeholder title="Modulo" />;
  }, [page, loading, clients, tasks, dashboard, search, selectedClient]);

  return (
    <AppLayout page={page} setPage={setPage} search={search} setSearch={setSearch} notifications={notifications}>
      {content}
      <QuickTaskModal open={quickOpen} status={quickStatus} clients={clients} onClose={() => setQuickOpen(false)} onSaved={async () => { setQuickOpen(false); await load(); }} />
    </AppLayout>
  );
}
