import { FormEvent, useMemo, useState } from "react";
import { Check, RefreshCcw, Sparkles, X } from "lucide-react";
import { Button, Card, Input, Modal, Select, Textarea } from "../components/ui";
import type { Client } from "../types";
import { api } from "../services/api";
import { contentTypes, objectives, platforms } from "../utils/options";

type Idea = {
  title: string;
  description: string;
  caption: string;
  notes: string;
};

type PlannedTask = Idea & {
  client_id: number | null;
  client_name: string;
  content_type: string;
  platform: string;
  due_date: string;
};

const defaultType = "post estatico";
const weeklyCadence: Record<string, number> = {
  "Jade Ibler": 3,
  "Império Pré-Moldados": 3,
  "A+FIT Academia": 2,
  "KnowHow Imob": 8,
  "Braúna": 3
};

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function nextMonday() {
  const date = new Date();
  const day = date.getDay();
  const distance = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + distance);
  return toDateInput(date);
}

export function Assistant({ clients, reload }: { clients: Client[]; reload: () => Promise<void> }) {
  const [clientId, setClientId] = useState(clients[0]?.id ? String(clients[0].id) : "");
  const [contentType, setContentType] = useState(defaultType);
  const [platform, setPlatform] = useState("Instagram");
  const [goal, setGoal] = useState("autoridade");
  const [dueDate, setDueDate] = useState("");
  const [instruction, setInstruction] = useState("");
  const [idea, setIdea] = useState<Idea | null>(null);
  const [planStart, setPlanStart] = useState(nextMonday);
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [planning, setPlanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = useMemo(() => clients.find((client) => String(client.id) === clientId), [clients, clientId]);
  const cadenceClients = useMemo(() => clients
    .filter((client) => weeklyCadence[client.name])
    .map((client) => ({
      id: client.id,
      name: client.name,
      segment: client.segment,
      postsPerWeek: weeklyCadence[client.name],
      notes: client.notes,
      voiceTone: client.voice_tone
    })), [clients]);

  const generate = async (event?: FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const generated = await api.post<Idea>("/ai/idea", {
        clientName: selectedClient?.name ?? "",
        clientSegment: selectedClient?.segment ?? "",
        contentType,
        platform,
        goal,
        instruction
      });
      setIdea(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel gerar a ideia.");
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    if (!idea) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/tasks", {
        title: idea.title,
        client_id: selectedClient?.id ?? null,
        content_type: contentType,
        status: "ideia",
        priority: "media",
        due_date: dueDate || null,
        post_date: dueDate || null,
        platform,
        owner: "Luiz Guilherme",
        description: idea.description,
        caption: idea.caption,
        notes: idea.notes,
        approval_status: "aprovado_interno"
      });
      setIdea(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a tarefa.");
    } finally {
      setSaving(false);
    }
  };

  const generatePlan = async () => {
    setPlanning(true);
    setError("");
    try {
      const data = await api.post<{ tasks: PlannedTask[] }>("/ai/plan", {
        startDate: planStart,
        clients: cadenceClients
      });
      setPlannedTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel gerar o planejamento.");
    } finally {
      setPlanning(false);
    }
  };

  const approvePlan = async () => {
    setSaving(true);
    setError("");
    try {
      await Promise.all(plannedTasks.map((task) => api.post("/tasks", {
        title: task.title,
        client_id: task.client_id,
        content_type: task.content_type,
        status: "ideia",
        priority: "media",
        due_date: task.due_date,
        post_date: task.due_date,
        platform: task.platform,
        owner: "Luiz Guilherme",
        description: task.description,
        caption: task.caption,
        notes: task.notes,
        approval_status: "aprovado_interno"
      })));
      setPlannedTasks([]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar as tarefas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#00f58a]">Assistente IA</p>
            <h2 className="mt-2 text-2xl font-black">Gerar ideia de conteudo</h2>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#063d28] text-[#00f58a]">
            <Sparkles size={23} />
          </div>
        </div>

        <form className="grid gap-4" onSubmit={generate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-[#cbd5e1]">
              Cliente
              <Select value={clientId} onChange={(event) => setClientId(event.target.value)}>
                <option value="">Sem cliente</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </Select>
            </label>
            <label className="grid gap-2 text-sm text-[#cbd5e1]">
              Tipo
              <Select value={contentType} onChange={(event) => setContentType(event.target.value)}>
                {contentTypes.filter((type) => ["post estatico", "carrossel", "reels", "stories", "video", "roteiro"].includes(type)).map((type) => <option key={type}>{type}</option>)}
              </Select>
            </label>
            <label className="grid gap-2 text-sm text-[#cbd5e1]">
              Plataforma
              <Select value={platform} onChange={(event) => setPlatform(event.target.value)}>
                {platforms.map((item) => <option key={item}>{item}</option>)}
              </Select>
            </label>
            <label className="grid gap-2 text-sm text-[#cbd5e1]">
              Objetivo
              <Select value={goal} onChange={(event) => setGoal(event.target.value)}>
                {objectives.map((item) => <option key={item}>{item}</option>)}
              </Select>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-[#cbd5e1]">
            Data da tarefa
            <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm text-[#cbd5e1]">
            O que a IA deve fazer?
            <Textarea
              rows={7}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="Ex.: criar uma ideia de reels para mostrar antes e depois de um ambiente planejado, com gancho forte e CTA para WhatsApp."
            />
          </label>

          {error && <p className="rounded-lg border border-[#5c1b20] bg-[#2a0e11] px-4 py-3 text-sm text-[#ffb4b4]">{error}</p>}

          <div className="flex justify-end">
            <Button disabled={loading}>
              <Sparkles size={17} />
              {loading ? "Gerando..." : "Gerar ideia"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#00f58a]">Planejamento semanal</p>
            <h2 className="mt-2 text-2xl font-black">Criar datas das tarefas</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9ca3af]">A IA distribui os conteudos na semana e cria ideias respeitando a cadencia de cada cliente.</p>
          </div>
          <label className="grid gap-2 text-sm text-[#cbd5e1]">
            Inicio da semana
            <Input type="date" value={planStart} onChange={(event) => setPlanStart(event.target.value)} />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cadenceClients.map((client) => (
            <div key={client.id} className="rounded-lg border border-[#1e2a2f] bg-[#0b0f12] p-4">
              <p className="font-bold text-white">{client.name}</p>
              <p className="mt-1 text-sm text-[#9ca3af]">{client.segment}</p>
              <p className="mt-3 text-sm font-bold text-[#00f58a]">{client.postsPerWeek} posts por semana</p>
            </div>
          ))}
        </div>

        {error && <p className="mt-5 rounded-lg border border-[#5c1b20] bg-[#2a0e11] px-4 py-3 text-sm text-[#ffb4b4]">{error}</p>}

        <div className="mt-6 flex justify-end">
          <Button type="button" disabled={planning || cadenceClients.length === 0} onClick={generatePlan}>
            <Sparkles size={17} />
            {planning ? "Planejando..." : "Gerar semana"}
          </Button>
        </div>
      </Card>

      <Modal title="Aprovar ideia" open={Boolean(idea)} onClose={() => setIdea(null)}>
        {idea && (
          <div className="grid gap-5">
            <div className="rounded-lg border border-[#1e2a2f] bg-[#0b0f12] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#00f58a]">{contentType} | {platform}</p>
              <h3 className="mt-3 text-2xl font-black">{idea.title}</h3>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-[#dbe3ea]">{idea.description}</p>
            </div>
            {idea.caption && <div className="rounded-lg border border-[#1e2a2f] bg-[#070a0c] p-5"><p className="mb-2 font-bold">Legenda sugerida</p><p className="whitespace-pre-wrap text-sm leading-6 text-[#cbd5e1]">{idea.caption}</p></div>}
            {idea.notes && <div className="rounded-lg border border-[#1e2a2f] bg-[#070a0c] p-5"><p className="mb-2 font-bold">Notas de producao</p><p className="whitespace-pre-wrap text-sm leading-6 text-[#cbd5e1]">{idea.notes}</p></div>}
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="danger" disabled={loading || saving} onClick={() => generate()}>
                <RefreshCcw size={17} />
                Nao aprovar, gerar outra
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIdea(null)}>
                <X size={17} />
                Fechar
              </Button>
              <Button type="button" disabled={saving} onClick={approve}>
                <Check size={17} />
                {saving ? "Criando tarefa..." : "Aprovar e criar tarefa"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal title="Aprovar planejamento semanal" open={plannedTasks.length > 0} onClose={() => setPlannedTasks([])}>
        <div className="grid gap-4">
          <div className="max-h-[54vh] overflow-y-auto rounded-lg border border-[#1e2a2f] thin-scroll">
            {plannedTasks.map((task, index) => (
              <div key={`${task.client_id}-${task.due_date}-${index}`} className="border-b border-[#1e2a2f] bg-[#0b0f12] p-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00f58a]">{task.client_name} | {task.due_date}</p>
                    <h3 className="mt-2 font-black text-white">{task.title}</h3>
                  </div>
                  <span className="rounded-md bg-[#2b1648] px-2 py-1 text-xs font-semibold text-[#d8b4fe]">{task.content_type}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#cbd5e1]">{task.description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="danger" disabled={planning || saving} onClick={generatePlan}>
              <RefreshCcw size={17} />
              Gerar outra semana
            </Button>
            <Button type="button" variant="secondary" onClick={() => setPlannedTasks([])}>
              <X size={17} />
              Cancelar
            </Button>
            <Button type="button" disabled={saving} onClick={approvePlan}>
              <Check size={17} />
              {saving ? "Criando tarefas..." : `Aprovar ${plannedTasks.length} tarefas`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
