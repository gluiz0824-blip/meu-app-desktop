import { Check, Edit3, ExternalLink, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { api } from "../services/api";
import { Avatar, Badge, Button, Card, Modal, SectionTitle, Textarea } from "../components/ui";
import type { Client, Task } from "../types";

function splitList(value?: string) {
  return (value || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

export function ClientBriefing({ client, tasks, goBack, reload }: { client?: Client; tasks: Task[]; goBack: () => void; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(client?.notes ?? "");
  if (!client) return <Card className="p-8"><p className="text-[#9ca3af]">Cliente nao encontrado.</p><Button className="mt-4" onClick={goBack}>Voltar</Button></Card>;
  const linked = tasks.filter((task) => task.client_id === client.id);
  const monthly = Number(client.posts_per_month ?? 0) + Number(client.reels_per_month ?? 0);
  const services = splitList(client.services);
  const audience = splitList(client.audience);
  const hashtags = splitList(client.default_hashtags);
  const colors = splitList(client.main_colors);
  const tones = splitList(client.voice_tone);
  const saveBriefing = async () => {
    await api.put(`/clients/${client.id}`, { notes });
    setEditing(false);
    await reload();
  };

  return (
    <div className="grid gap-5">
      <button onClick={goBack} className="w-fit text-sm text-[#cbd5e1] hover:text-[#00f58a]">← Voltar para clientes</button>
      <Card className="p-7">
        <div className="grid gap-6 xl:grid-cols-[180px_1fr_1fr_1fr]">
          <div className="grid place-items-center gap-3">
            <div className="grid h-36 w-36 place-items-center rounded-full border border-[#00f58a]/50 bg-[#063d28]/20 text-[#00f58a] shadow-[0_0_40px_rgba(0,245,138,.16)]"><span className="text-5xl font-black">{client.name.slice(0, 1)}</span></div>
            <Badge tone={client.status === "ativo" ? "success" : "muted"}>{client.status}</Badge>
          </div>
          <div>
            <h2 className="text-2xl font-black">{client.name} <span className="text-[#00f58a]">✦</span></h2>
            <p className="mt-1 text-[#9ca3af]">{client.segment}</p>
            <div className="mt-6"><p className="text-sm text-[#9ca3af]">Plano ativo</p><p className="font-bold">{client.plan || "Sem plano"}</p><p className="mt-1 text-xs text-[#00f58a]">● Vencimento dia {client.due_day ?? 1}</p></div>
          </div>
          <div>
            <p className="mb-3 text-sm text-[#9ca3af]">Redes sociais</p>
            <div className="flex flex-wrap gap-3"><Badge tone="purple">{client.instagram || "Instagram"}</Badge><Badge>WhatsApp</Badge></div>
            <div className="mt-8"><p className="text-sm text-[#9ca3af]">Entregas mensais</p><p className="text-5xl font-black">{monthly} <span className="text-base font-normal text-[#9ca3af]">conteudos/mes</span></p></div>
          </div>
          <div className="flex flex-col gap-4">
            <Button variant="secondary" className="self-end" onClick={() => { setNotes(client.notes ?? ""); setEditing(true); }}><Edit3 size={17} /> Editar briefing</Button>
            <p className="text-sm text-[#9ca3af]">Responsavel</p>
            <div className="flex items-center gap-3"><Avatar name={client.contact_name || "Luiz Guilherme"} /><div><p className="font-bold">{client.contact_name || "Luiz Guilherme"}</p><p className="text-sm text-[#9ca3af]">Social Media</p></div></div>
            <p className="flex items-center gap-2 text-sm text-[#cbd5e1]"><Mail size={16} /> {client.email || "Sem e-mail"}</p>
            <p className="flex items-center gap-2 text-sm text-[#cbd5e1]"><Phone size={16} /> {client.whatsapp || "Sem telefone"}</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_320px]">
        <Card className="p-5 xl:col-span-2"><SectionTitle title="Briefing da Marca" /><p className="leading-relaxed text-[#cbd5e1]">{client.notes || "Briefing ainda nao cadastrado."}</p></Card>
        <Card className="p-5"><SectionTitle title="Tom de Voz" /><div className="flex flex-wrap gap-2">{(tones.length ? tones : ["Profissional"]).map((item) => <Badge key={item} tone="success">{item}</Badge>)}</div></Card>
        <Card className="p-5 xl:row-span-2"><SectionTitle title="Historico de Entregas" /><div className="grid gap-4">{linked.filter((task) => task.status === "postado").slice(0, 6).map((task) => <div key={task.id} className="flex items-center justify-between"><span className="text-sm text-[#cbd5e1]">● {task.title}</span><Badge tone="success">Postado</Badge></div>)}{linked.filter((task) => task.status === "postado").length === 0 && <p className="text-sm text-[#9ca3af]">Nenhuma entrega postada ainda.</p>}</div></Card>
        <Card className="p-5"><SectionTitle title="Cores e Fontes" /><div className="flex flex-wrap gap-3">{(colors.length ? colors : ["#063d28", "#f8f5f0", "#050708"]).map((color) => <div key={color}><div className="h-11 w-11 rounded-full border border-white/20" style={{ background: color.startsWith("#") ? color : "#11171b" }} /><p className="mt-1 text-[10px] text-[#9ca3af]">{color}</p></div>)}</div><p className="mt-5 text-sm text-[#9ca3af]">Fontes principais</p><p className="mt-2 text-2xl">Aa <span className="text-sm text-[#9ca3af]">{client.fonts || "Inter / Sora"}</span></p></Card>
        <Card className="p-5"><SectionTitle title="Servicos Principais" />{(services.length ? services : ["Gestao de Redes Sociais", "Criacao de Conteudo"]).map((item) => <p key={item} className="mt-3 flex items-center gap-2 text-sm text-[#cbd5e1]"><Check size={16} className="text-[#00f58a]" /> {item}</p>)}</Card>
        <Card className="p-5"><SectionTitle title="Publico-Alvo" />{(audience.length ? audience : ["Nao informado"]).map((item) => <p key={item} className="mt-3 flex items-center gap-2 text-sm text-[#cbd5e1]"><UserRound size={16} className="text-[#9ca3af]" /> {item}</p>)}</Card>
        <Card className="p-5"><SectionTitle title="Links Importantes" />{splitList(`${client.reference_links ?? ""}\n${client.drive_folder ?? ""}`).map((item) => <p key={item} className="mt-3 flex items-center gap-2 text-sm text-[#00f58a]"><ExternalLink size={15} /> {item}</p>)}{!client.reference_links && !client.drive_folder && <p className="text-sm text-[#9ca3af]">Nenhum link cadastrado.</p>}</Card>
        <Card className="p-5 xl:col-span-3"><SectionTitle title="Observacoes e Diretrizes" /><div className="grid gap-5 lg:grid-cols-[1fr_430px]"><p className="text-sm leading-7 text-[#cbd5e1]">{client.differentiators || "Adicione diferenciais, diretrizes e pontos de atencao no cadastro do cliente."}</p><div className="rounded-xl border border-[#00f58a]/20 bg-[#063d28]/30 p-5"><p className="mb-3 font-bold">Hashtags oficiais</p><div className="flex flex-wrap gap-2">{(hashtags.length ? hashtags : ["#SemHashtags"]).map((tag) => <Badge key={tag} tone="success">{tag}</Badge>)}</div></div></div></Card>
        <Card className="p-5"><SectionTitle title="Tarefas Vinculadas" />{["Em andamento", "Aguardando aprovacao", "Programadas", "Concluidas este mes"].map((label, i) => <div key={label} className="mt-4 flex justify-between text-sm"><span className="text-[#cbd5e1]">{label}</span><strong>{[linked.filter((t) => ["roteiro", "design", "edicao"].includes(t.status)).length, linked.filter((t) => t.status === "aguardando_aprovacao").length, linked.filter((t) => t.status === "agendado").length, linked.filter((t) => t.status === "postado").length][i]}</strong></div>)}</Card>
      </div>
      <Modal title="Editar briefing" open={editing} onClose={() => setEditing(false)}>
        <div className="grid gap-4"><Textarea rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} /><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button><Button onClick={saveBriefing}>Salvar briefing</Button></div></div>
      </Modal>
    </div>
  );
}
