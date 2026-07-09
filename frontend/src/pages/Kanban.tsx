import { AlertTriangle, Calendar, CheckCircle2, Filter, Hourglass, Plus, Scissors, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../services/api";
import { Button, Card, PriorityBadge, Select } from "../components/ui";
import type { Client, Task } from "../types";
import { formatDate, normalizeKanbanStatus, statusColumns, statusLabel } from "../utils/format";
import { contentTypes, priorityOptions } from "../utils/options";

const columnMeta: Record<string, { icon: typeof Sparkles; color: string }> = {
  ideia: { icon: Sparkles, color: "#f5b642" },
  design: { icon: Sparkles, color: "#a855f7" },
  edicao: { icon: Scissors, color: "#00f58a" },
  aguardando_aprovacao: { icon: Hourglass, color: "#f5b642" },
  postado: { icon: CheckCircle2, color: "#00f58a" }
};

function Platform({ name }: { name?: string }) {
  const label = name ? name.slice(0, 2).toUpperCase() : "--";
  return <span className="grid h-5 min-w-5 place-items-center rounded bg-[#0b2448] px-1 text-[10px] font-black text-[#60a5fa]">{label}</span>;
}

export function Kanban({ tasks, clients, search, reload, onNewTask }: { tasks: Task[]; clients: Client[]; search: string; reload: () => Promise<void>; onNewTask: (status?: string) => void }) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const filtered = useMemo(() => tasks.filter((task) => {
    const haystack = `${task.title} ${task.client_name ?? ""} ${task.content_type} ${task.status}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (!clientFilter || String(task.client_id ?? "") === clientFilter) &&
      (!priorityFilter || task.priority === priorityFilter) &&
      (!typeFilter || task.content_type === typeFilter);
  }), [tasks, search, clientFilter, priorityFilter, typeFilter]);

  const moveTask = async (taskId: number, status: string) => {
    setDragging(null);
    await api.put(`/tasks/${taskId}`, { status });
    await reload();
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}><option value="">Todos os clientes</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}><option value="">Todas prioridades</option>{priorityOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">Todos os tipos</option>{contentTypes.map((type) => <option key={type}>{type}</option>)}</Select>
        </div>
        <div className="flex gap-2"><Button variant="secondary"><Filter size={18} /> Filtros</Button><Button onClick={() => onNewTask()}><Plus size={18} /> Nova Tarefa</Button></div>
      </div>
      <div className="grid auto-cols-[292px] grid-flow-col gap-3 overflow-x-auto pb-4 thin-scroll">
        {statusColumns.map((status) => {
          const meta = columnMeta[status];
          const Icon = meta.icon;
          const items = filtered.filter((task) => normalizeKanbanStatus(task.status) === status);
          return (
            <Card key={status} className="p-3" onDragOver={(event) => event.preventDefault()} onDrop={() => dragging && moveTask(dragging, status)}>
              <div className="mb-4 flex items-center gap-3 px-1">
                <Icon size={19} style={{ color: meta.color }} />
                <h2 className="flex-1 text-sm font-bold">{statusLabel(status)}</h2>
                <span className="text-sm text-[#cbd5e1]">{items.length}</span>
              </div>
              <div className="grid gap-3">
                {items.map((task) => {
                  const overdue = task.due_date && task.due_date < new Date().toISOString().slice(0, 10) && !["postado", "cancelado"].includes(task.status);
                  return (
                    <div key={task.id} draggable onDragStart={() => setDragging(task.id)} className="cursor-grab rounded-lg border border-[#1e2a2f] bg-[#11171b]/70 p-4 transition hover:-translate-y-0.5 hover:border-[#00f58a]/35 hover:bg-[#141b20]">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div><p className="text-xs text-[#b9c0c8]">{task.client_name ?? "Sem cliente"}</p><h3 className="mt-1 text-sm font-semibold leading-snug text-white">{task.title}</h3></div>
                        {overdue && <AlertTriangle size={16} className="text-[#ff4d4d]" />}
                        {task.status === "postado" && <CheckCircle2 size={16} className="text-[#00f58a]" />}
                      </div>
                      <div className="flex flex-wrap gap-2"><span className="rounded-md bg-[#2b1648] px-2 py-1 text-xs font-semibold text-[#d8b4fe]">{task.content_type}</span><PriorityBadge priority={task.priority} /></div>
                      <div className="mt-4 flex items-center justify-between text-xs text-[#9ca3af]"><span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(task.due_date)}</span><Platform name={task.platform} /></div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => onNewTask(status)} className="mt-3 h-10 w-full rounded-lg border border-dashed border-[#26343a] text-sm text-[#9ca3af] transition hover:border-[#00f58a]/50 hover:text-[#00f58a]">+ Adicionar tarefa</button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
