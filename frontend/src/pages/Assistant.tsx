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

const defaultType = "post estatico";

export function Assistant({ clients, reload }: { clients: Client[]; reload: () => Promise<void> }) {
  const [clientId, setClientId] = useState(clients[0]?.id ? String(clients[0].id) : "");
  const [contentType, setContentType] = useState(defaultType);
  const [platform, setPlatform] = useState("Instagram");
  const [goal, setGoal] = useState("autoridade");
  const [dueDate, setDueDate] = useState("");
  const [instruction, setInstruction] = useState("");
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = useMemo(() => clients.find((client) => String(client.id) === clientId), [clients, clientId]);

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
    </div>
  );
}
