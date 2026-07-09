import { ArrowRight, Edit3, Plus, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { api } from "../services/api";
import { Badge, Button, Card, Input, Modal, Select, Textarea } from "../components/ui";
import type { AnyRecord, Client, PageId, Task } from "../types";

const emptyClient: AnyRecord = {
  name: "",
  segment: "",
  company_name: "",
  contact_name: "Luiz Guilherme",
  whatsapp: "",
  instagram: "",
  email: "",
  plan: "Profissional",
  posts_per_month: 0,
  reels_per_month: 0,
  monthly_value: 0,
  due_day: 1,
  status: "ativo",
  voice_tone: "",
  main_colors: "",
  audience: "",
  services: "",
  differentiators: "",
  default_hashtags: "",
  drive_folder: "",
  reference_links: "",
  notes: ""
};

function ClientForm({ initial, onCancel, onSaved }: { initial?: AnyRecord | null; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AnyRecord>({ ...emptyClient, ...(initial ?? {}) });
  const set = (key: string, value: string | number) => setForm((old) => ({ ...old, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.id) await api.put(`/clients/${form.id}`, form);
    else await api.post("/clients", form);
    onSaved();
  };
  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Nome<Input required value={String(form.name ?? "")} onChange={(e) => set("name", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Segmento<Input required value={String(form.segment ?? "")} onChange={(e) => set("segment", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Empresa<Input value={String(form.company_name ?? "")} onChange={(e) => set("company_name", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Responsavel<Input value={String(form.contact_name ?? "")} onChange={(e) => set("contact_name", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">WhatsApp<Input value={String(form.whatsapp ?? "")} onChange={(e) => set("whatsapp", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Instagram<Input value={String(form.instagram ?? "")} onChange={(e) => set("instagram", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">E-mail<Input value={String(form.email ?? "")} onChange={(e) => set("email", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Plano<Input value={String(form.plan ?? "")} onChange={(e) => set("plan", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Status<Select value={String(form.status ?? "")} onChange={(e) => set("status", e.target.value)}><option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="encerrado">Encerrado</option></Select></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Posts/mes<Input type="number" value={String(form.posts_per_month ?? 0)} onChange={(e) => set("posts_per_month", Number(e.target.value))} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Reels/mes<Input type="number" value={String(form.reels_per_month ?? 0)} onChange={(e) => set("reels_per_month", Number(e.target.value))} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Valor mensal<Input type="number" value={String(form.monthly_value ?? 0)} onChange={(e) => set("monthly_value", Number(e.target.value))} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Briefing / observacoes<Textarea rows={5} value={String(form.notes ?? "")} onChange={(e) => set("notes", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Tom de voz<Textarea rows={5} value={String(form.voice_tone ?? "")} onChange={(e) => set("voice_tone", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Cores principais<Textarea rows={3} value={String(form.main_colors ?? "")} onChange={(e) => set("main_colors", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Publico-alvo<Textarea rows={3} value={String(form.audience ?? "")} onChange={(e) => set("audience", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Servicos<Textarea rows={3} value={String(form.services ?? "")} onChange={(e) => set("services", e.target.value)} /></label>
        <label className="grid gap-2 text-sm text-[#cbd5e1]">Hashtags<Textarea rows={3} value={String(form.default_hashtags ?? "")} onChange={(e) => set("default_hashtags", e.target.value)} /></label>
      </div>
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button>Salvar cliente</Button></div>
    </form>
  );
}

export function ClientsPage({ clients, tasks, search, setPage, setSelectedClientId, reload }: { clients: Client[]; tasks: Task[]; search: string; setPage: (page: PageId) => void; setSelectedClientId: (id: number) => void; reload: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const filtered = useMemo(() => clients.filter((client) => `${client.name} ${client.segment} ${client.company_name ?? ""}`.toLowerCase().includes(search.toLowerCase())), [clients, search]);
  const remove = async (client: Client) => {
    if (!confirm(`Excluir cliente "${client.name}"? As tarefas vinculadas ficarao sem cliente.`)) return;
    await api.delete(`/clients/${client.id}`);
    await reload();
  };
  return (
    <div className="grid gap-5">
      <div className="flex justify-end"><Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Novo Cliente</Button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((client) => {
          const count = tasks.filter((task) => task.client_id === client.id).length;
          return <Card key={client.id} className="p-5"><div className="mb-5 flex items-start justify-between"><div className="grid h-14 w-14 place-items-center rounded-xl border border-[#00f58a]/30 bg-[#063d28]/35 text-xl font-black text-[#00f58a]">{client.name.slice(0, 1)}</div><Badge tone={client.status === "ativo" ? "success" : "muted"}>{client.status}</Badge></div><h2 className="text-xl font-black">{client.name}</h2><p className="mt-1 text-sm text-[#9ca3af]">{client.segment}</p><p className="mt-4 line-clamp-3 text-sm leading-6 text-[#cbd5e1]">{client.notes || "Sem briefing cadastrado."}</p><div className="mt-5 flex items-center justify-between"><span className="text-sm text-[#9ca3af]">{client.instagram || "Sem Instagram"}</span><strong>{count} tarefas</strong></div><div className="mt-5 flex flex-wrap gap-2"><Button className="flex-1" variant="secondary" onClick={() => { setSelectedClientId(client.id); setPage("cliente"); }}>Abrir briefing <ArrowRight size={17} /></Button><Button variant="secondary" className="h-11 px-3" onClick={() => { setEditing(client as unknown as AnyRecord); setOpen(true); }}>Editar</Button><Button variant="danger" className="h-11 px-3" onClick={() => remove(client)}>Excluir</Button></div></Card>;
        })}
      </div>
      <Modal title={editing ? "Editar cliente" : "Novo cliente"} open={open} onClose={() => setOpen(false)}>
        <ClientForm initial={editing} onCancel={() => setOpen(false)} onSaved={async () => { setOpen(false); await reload(); }} />
      </Modal>
    </div>
  );
}
