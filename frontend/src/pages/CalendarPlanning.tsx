import { CalendarDays, ChevronLeft, ChevronRight, Lightbulb, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../services/api";
import { Badge, Button, Card, Input, Modal, Select, SectionTitle } from "../components/ui";
import type { Client, Task } from "../types";
import { eventColor, formatDate, toDateInput } from "../utils/format";
import { contentTypes } from "../utils/options";

const week = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const monthNames = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function CalendarPlanning({ tasks, clients, search, reload }: { tasks: Task[]; clients: Client[]; search: string; reload: () => Promise<void> }) {
  const [month, setMonth] = useState(new Date());
  const [clientFilter, setClientFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("post estatico");
  const [clientId, setClientId] = useState("");
  const days = useMemo(() => monthDays(month), [month]);
  const filtered = tasks.filter((task) => {
    const haystack = `${task.title} ${task.client_name ?? ""} ${task.content_type}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (!clientFilter || String(task.client_id ?? "") === clientFilter);
  });
  const today = toDateInput(new Date());
  const nextEvents = filtered.filter((task) => (task.post_date || task.due_date || "") >= today).slice(0, 6);

  const createTask = async () => {
    if (!title.trim()) return;
    await api.post("/tasks", { title, content_type: type, client_id: clientId ? Number(clientId) : null, status: "ideia", priority: "media", due_date: selectedDate, post_date: selectedDate, platform: "Instagram", owner: "Luiz Guilherme" });
    setOpen(false);
    setTitle("");
    await reload();
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></Button>
            <Button variant="secondary">{monthNames[month.getMonth()]} {month.getFullYear()}</Button>
            <Button variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></Button>
            <Button variant="secondary" onClick={() => setMonth(new Date())}>Hoje</Button>
            <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}><option value="">Todos os clientes</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select>
          </div>
          <div className="rounded-lg border border-[#1e2a2f] bg-[#0b0f12] p-1"><button className="rounded-md bg-[#063d28] px-5 py-2 text-sm font-semibold text-[#00f58a]">Mes</button><button className="px-5 py-2 text-sm text-[#9ca3af]">Semana</button></div>
        </div>
        <Card className="overflow-hidden">
          <div className="grid calendar-grid border-b border-[#1e2a2f] bg-[#0b0f12]">{week.map((day) => <div key={day} className="p-3 text-center text-sm font-bold">{day}</div>)}</div>
          <div className="grid calendar-grid">
            {days.map((date) => {
              const value = toDateInput(date);
              const muted = date.getMonth() !== month.getMonth();
              const events = filtered.filter((task) => task.post_date === value || task.due_date === value);
              const active = value === today;
              return (
                <button key={value} onClick={() => { setSelectedDate(value); setOpen(true); }} className={`min-h-[138px] border-b border-r border-[#1e2a2f] p-3 text-left ${muted ? "text-[#4b5563]" : "text-white"} ${active ? "ring-1 ring-inset ring-[#00f58a]" : "hover:bg-[#0b0f12]"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${active ? "bg-[#00f58a] text-[#04100a]" : ""}`}>{date.getDate()}</span>
                  <div className="mt-2 grid gap-1.5">
                    {events.slice(0, 3).map((task) => <div key={task.id} className="rounded-lg border border-[#26343a] bg-[#11171b] p-2"><p className="flex items-center gap-1.5 truncate text-xs font-bold"><i className="h-2 w-2 rounded-full" style={{ background: eventColor(task.content_type) }} />{task.content_type}</p><p className="truncate text-xs text-[#cbd5e1]">{task.title}</p><p className="text-xs font-bold text-[#00f58a]">{task.client_name ?? "Sem cliente"}</p></div>)}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
        <div className="flex flex-wrap gap-4 text-xs text-[#9ca3af]">{contentTypes.slice(0, 8).map((type) => <span key={type} className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: eventColor(type) }} />{type}</span>)}</div>
      </div>
      <aside className="grid content-start gap-4">
        <Card className="p-5">
          <SectionTitle title="Proximos Eventos" />
          <div className="divide-y divide-[#1e2a2f]">
            {nextEvents.length === 0 && <p className="py-6 text-sm text-[#9ca3af]">Nenhum evento futuro.</p>}
            {nextEvents.map((task) => <div key={task.id} className="flex gap-3 py-3"><div className="w-20 text-sm text-[#9ca3af]">{formatDate(task.post_date || task.due_date)}</div><div className="grid h-11 w-11 place-items-center rounded-lg border" style={{ color: eventColor(task.content_type), borderColor: `${eventColor(task.content_type)}55`, background: `${eventColor(task.content_type)}14` }}><CalendarDays size={18} /></div><div><p className="font-semibold">{task.content_type}</p><p className="text-sm text-[#cbd5e1]">{task.title}</p><p className="text-xs text-[#9ca3af]">{task.client_name ?? "Sem cliente"}</p></div></div>)}
          </div>
        </Card>
        <Card className="p-5"><SectionTitle title="Resumo do Mes" action={<Badge>{monthNames[month.getMonth()]}</Badge>} />{["Total de conteudos", "Publicacoes", "Aguardando", "Atrasadas"].map((label, i) => <div key={label} className="mt-3 flex justify-between text-sm"><span className="text-[#cbd5e1]">{label}</span><strong>{[filtered.length, filtered.filter((t) => t.status === "postado").length, filtered.filter((t) => t.status === "aguardando_aprovacao").length, filtered.filter((t) => t.due_date && t.due_date < today && t.status !== "postado").length][i]}</strong></div>)}</Card>
        <Card className="p-5"><SectionTitle title="Acoes Rapidas" /><div className="grid gap-3"><Button onClick={() => { setSelectedDate(today); setOpen(true); }}><Plus size={18} /> Criar Tarefa</Button><Button variant="secondary"><Lightbulb size={18} /> Nova Ideia</Button></div></Card>
      </aside>
      <Modal title={`Criar tarefa em ${formatDate(selectedDate)}`} open={open} onClose={() => setOpen(false)}>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Titulo<Input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Cliente<Select value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Sem cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select></label>
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Tipo<Select value={type} onChange={(e) => setType(e.target.value)}>{contentTypes.map((item) => <option key={item}>{item}</option>)}</Select></label>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={createTask}>Criar tarefa</Button></div>
        </div>
      </Modal>
    </div>
  );
}
