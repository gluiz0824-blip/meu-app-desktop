import { Copy, Lightbulb, MessageSquareText, Mic, PenLine, Plus, Sparkles } from "lucide-react";
import { Button, Card, Select, Textarea } from "../components/ui";
import type { Client } from "../types";

const tools = [
  { title: "Gerar legenda", icon: MessageSquareText, text: "Legenda estrategica com gancho, desenvolvimento e CTA." },
  { title: "Roteiro de reels", icon: Mic, text: "Estrutura com gancho, cenas, falas e chamada final." },
  { title: "Ideias de conteudo", icon: Lightbulb, text: "Lista de ideias por pilar, objetivo e etapa do funil." },
  { title: "Checklist de gravacao", icon: PenLine, text: "Passo a passo para captacao, audio, luz e takes." },
  { title: "Gerar CTA", icon: Sparkles, text: "Chamadas diretas para WhatsApp, Direct e landing page." }
];

export function Assistant({ clients }: { clients: Client[] }) {
  const draft = `Roteiro sugerido para Brauna Moveis Planejados

Gancho: Voce ja percebeu como um ambiente planejado muda a rotina da casa?

Cena 1: mostrar detalhe do acabamento em close.
Cena 2: revelar o ambiente completo com movimento suave.
Cena 3: destacar organizacao, aproveitamento de espaco e personalizacao.

CTA: Chame a Brauna e transforme seu projeto em um ambiente sob medida.`;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return <Card key={tool.title} className="p-5"><div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-[#063d28] text-[#00f58a]"><Icon size={22} /></div><h2 className="text-lg font-black">{tool.title}</h2><p className="mt-2 text-sm leading-6 text-[#9ca3af]">{tool.text}</p><Button className="mt-5"><Plus size={17} /> Criar agora</Button></Card>;
        })}
      </div>
      <aside className="grid content-start gap-5">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-black">Novo rascunho</h2>
          <div className="grid gap-3">
            <Select>{clients.map((client) => <option key={client.id}>{client.name}</option>)}</Select>
            <Select><option>Roteiro para reels</option><option>Legenda</option><option>Ideias de posts</option></Select>
            <Select><option>Autoridade</option><option>Venda</option><option>Relacionamento</option></Select>
            <Textarea rows={12} value={draft} readOnly />
            <div className="flex gap-2"><Button><Sparkles size={17} /> Gerar</Button><Button variant="secondary"><Copy size={17} /> Copiar</Button></div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-black">Historico de geracoes</h2>
          {["Legenda Dia dos Namorados", "Roteiro Reels Institucional", "Checklist gravacao A+FIT"].map((item) => <div key={item} className="border-b border-[#1e2a2f] py-3 text-sm text-[#cbd5e1] last:border-0">{item}<p className="text-xs text-[#6b7280]">Gerado hoje</p></div>)}
        </Card>
      </aside>
    </div>
  );
}
