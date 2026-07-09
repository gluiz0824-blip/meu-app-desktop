import { CheckSquare, Plus, Square, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { api } from "../services/api";
import { Badge, Button, Card, Input, Modal, PriorityBadge, Select } from "../components/ui";
import type { AnyRecord, Client, Task } from "../types";
import { formatDate, statusLabel } from "../utils/format";
import { contentTypes, platforms, priorityOptions, statusOptions } from "../utils/options";

const emptyTask: AnyRecord = {
  title: "",
  client_id: "",
  content_type: "post estatico",
  status: "ideia",
  priority: "media",
  due_date: "",
  post_date: "",
  platform: "Instagram"
};

function TaskForm({ clients, initial, onCancel, onSaved }: { clients: Client[]; initial?: AnyRecord | null; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AnyRecord>({ ...emptyTask, ...(initial ?? {}) });
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: string | number | null) => setForm((old) => ({ ...old, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = { ...form, client_id: form.client_id ? Number(form.client_id) : null };
    if (form.id) await api.put(`/tasks/${form.id}`, payload);
    else await api.post("/tasks", payload);
    setSaving(false);
    onSaved();
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Titulo<Input required value={String(form.title ?? "")} onChange={(e) => set("title", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Cliente<Select value={String(form.client_id ?? "")} onChange={(e) => set("client_id", e.target.value)}><option value="">Sem cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Tipo<Select value={String(form.content_type ?? "")} onChange={(e) => set("content_type", e.target.value)}>{contentTypes.map((type) => <option key={type}>{type}</option>)}</Select></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Status<Select value={String(form.status ?? "")} onChange={(e) => set("status", e.target.value)}>{statusOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Prioridade<Select value={String(form.priority ?? "")} onChange={(e) => set("priority", e.target.value)}>{priorityOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Entrega<Input type="date" value={String(form.due_date ?? "")} onChange={(e) => set("due_date", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Postagem<Input type="date" value={String(form.post_date ?? "")} onChange={(e) => set("post_date", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Plataforma<Select value={String(form.platform ?? "")} onChange={(e) => set("platform", e.target.value)}>{platforms.map((platform) => <option key={platform}>{platform}</option>)}</Select></label>
      </div>
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button disabled={saving}>{saving ? "Salvando..." : "Salvar tarefa"}</Button></div>
    </form>
  );
}

export function TasksPage({ tasks, clients, search, reload }: { tasks: Task[]; clients: Client[]; search: string; reload: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => tasks.filter((task) => {
    const haystack = `${task.title} ${task.client_name ?? ""} ${task.content_type} ${task.status}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (!clientFilter || String(task.client_id ?? "") === clientFilter) &&
      (!statusFilter || task.status === statusFilter) &&
      (!priorityFilter || task.priority === priorityFilter);
  }), [tasks, search, clientFilter, statusFilter, priorityFilter]);

  const remove = async (task: Task) => {
    if (!confirm(`Excluir a tarefa "${task.title}"?`)) return;
    await api.delete(`/tasks/${task.id}`);
    await reload();
  };

  const filteredIds = filtered.map((task) => task.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.includes(id));
  const selectedInFilter = selected.filter((id) => filteredIds.includes(id));

  const toggleTask = (taskId: number) => {
    setSelected((current) => current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]);
  };

  const toggleAllFiltered = () => {
    setSelected((current) => {
      if (allFilteredSelected) return current.filter((id) => !filteredIds.includes(id));
      return Array.from(new Set([...current, ...filteredIds]));
    });
  };

  const removeSelected = async () => {
    if (!selected.length) return;
    const count = selected.length;
    if (!confirm(`Excluir ${count} tarefa${count > 1 ? "s" : ""} selecionada${count > 1 ? "s" : ""}?`)) return;
    setDeleting(true);
    await Promise.all(selected.map((taskId) => api.delete(`/tasks/${taskId}`)));
    setSelected([]);
    setDeleting(false);
    await reload();
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}><option value="">Todos os clientes</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">Todos os status</option>{statusOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}><option value="">Todas prioridades</option>{priorityOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.length > 0 && (
            <Button variant="danger" disabled={deleting} onClick={removeSelected}>
              <Trash2 size={17} />
              {deleting ? "Excluindo..." : `Excluir ${selected.length}`}
            </Button>
          )}
          <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Nova Tarefa</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1e2a2f] bg-[#0b0f12] px-4 py-3 text-sm text-[#cbd5e1]">
        <span>{selected.length ? `${selected.length} selecionada${selected.length > 1 ? "s" : ""}` : "Selecione tarefas para excluir em lote"}</span>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="h-9" disabled={filtered.length === 0} onClick={toggleAllFiltered}>
            {allFilteredSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            {allFilteredSelected ? "Limpar lista" : "Selecionar todas"}
          </Button>
          {selectedInFilter.length > 0 && <Button type="button" variant="ghost" className="h-9" onClick={() => setSelected((current) => current.filter((id) => !filteredIds.includes(id)))}>Limpar filtradas</Button>}
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-[#1e2a2f] bg-[#0b0f12] text-xs uppercase tracking-wide text-[#6b7280]">
              <tr>
                <th className="w-12 px-5 py-4">
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-[#cbd5e1] transition hover:bg-[#11171b] hover:text-[#00f58a]" onClick={toggleAllFiltered} aria-label="Selecionar todas">
                    {allFilteredSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                {["Tarefa", "Cliente", "Tipo", "Status", "Prioridade", "Entrega", "Postagem", "Acoes"].map((head) => <th key={head} className="px-5 py-4">{head}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a2f]">
              {filtered.map((task) => (
                <tr key={task.id} className="transition hover:bg-[#11171b]">
                  <td className="px-5 py-4">
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-[#cbd5e1] transition hover:bg-[#0b0f12] hover:text-[#00f58a]" onClick={() => toggleTask(task.id)} aria-label={`Selecionar ${task.title}`}>
                      {selected.includes(task.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">{task.title}</td>
                  <td className="px-5 py-4 text-[#cbd5e1]">{task.client_name ?? "Sem cliente"}</td>
                  <td className="px-5 py-4"><Badge tone="purple">{task.content_type}</Badge></td>
                  <td className="px-5 py-4"><Badge tone={task.status === "postado" ? "success" : task.status === "aguardando_aprovacao" ? "warning" : "blue"}>{statusLabel(task.status)}</Badge></td>
                  <td className="px-5 py-4"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-5 py-4 text-[#cbd5e1]">{formatDate(task.due_date)}</td>
                  <td className="px-5 py-4 text-[#cbd5e1]">{formatDate(task.post_date)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button variant="secondary" className="h-9 px-3" onClick={() => { setEditing(task as unknown as AnyRecord); setOpen(true); }}>Editar</Button>
                      <Button variant="danger" className="h-9 px-3" onClick={() => remove(task)}>Excluir</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-10 text-center text-[#9ca3af]">Nenhuma tarefa encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal title={editing ? "Editar tarefa" : "Nova tarefa"} open={open} onClose={() => setOpen(false)}>
        <TaskForm clients={clients} initial={editing} onCancel={() => setOpen(false)} onSaved={async () => { setOpen(false); await reload(); }} />
      </Modal>
    </div>
  );
}
