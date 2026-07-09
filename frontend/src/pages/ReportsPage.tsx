import { Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../services/api";
import { Button, Card, Select, SectionTitle } from "../components/ui";
import type { Client, ReportData } from "../types";
import { formatDate, toDateInput } from "../utils/format";

function currentMonth() {
  return toDateInput(new Date()).slice(0, 7);
}

export function ReportsPage({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    api.get<ReportData>(`/reports?month=${month}${clientId ? `&clientId=${clientId}` : ""}`).then(setReport).catch(console.error);
  }, [clientId, month]);

  const produced = report?.producedByClient ?? [];
  const summaryText = useMemo(() => {
    if (!report) return "";
    return produced.map((client) => {
      const lines = client.tasks.map((task) => `- ${formatDate(task.post_date)}: ${task.title} (${task.content_type})`).join("\n");
      return `${client.name}\nProduzido no mes: ${client.total}/${client.contracted}\nPosts: ${client.posts} | Reels: ${client.reels} | Carrosseis: ${client.carousels} | Stories: ${client.stories}\n${lines || "- Nenhum conteudo postado no periodo."}`;
    }).join("\n\n");
  }, [produced, report]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Relatorio mensal</h2>
          <p className="mt-1 text-sm text-[#9ca3af]">Veja quanto foi produzido para cada cliente no mes selecionado.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input className="h-11 rounded-lg border border-[#1e2a2f] bg-[#0b0f12] px-4 text-sm text-white outline-none" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          <Select value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="">Todos os clientes</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(summaryText)}><Copy size={17} /> Copiar resumo</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-[#9ca3af]">Clientes no relatorio</p><p className="mt-2 text-3xl font-black">{report?.totals.clients ?? 0}</p></Card>
        <Card className="p-5"><p className="text-sm text-[#9ca3af]">Total produzido</p><p className="mt-2 text-3xl font-black text-[#00f58a]">{report?.totals.produced ?? 0}</p></Card>
        <Card className="p-5"><p className="text-sm text-[#9ca3af]">Total contratado</p><p className="mt-2 text-3xl font-black">{report?.totals.contracted ?? 0}</p></Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="p-5">
          <SectionTitle title="Produzido por cliente" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={produced}>
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0b0f12", border: "1px solid #1e2a2f", borderRadius: 10, color: "#fff" }} />
                <Bar dataKey="total" fill="#00f58a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Resumo por cliente" />
          <div className="grid gap-3">
            {produced.map((item) => <div key={item.id} className="rounded-lg border border-[#1e2a2f] bg-[#0b0f12] p-4"><div className="flex justify-between gap-3"><strong>{item.name}</strong><span className="text-[#00f58a]">{item.total}/{item.contracted}</span></div><p className="mt-2 text-sm text-[#9ca3af]">Posts: {item.posts ?? 0} | Reels: {item.reels ?? 0} | Carrosseis: {item.carousels ?? 0} | Stories: {item.stories ?? 0}</p></div>)}
            {produced.length === 0 && <p className="text-sm text-[#9ca3af]">Nenhum cliente no relatorio.</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        {produced.map((client) => (
          <Card key={client.id} className="p-5">
            <SectionTitle title={client.name} action={<span className="text-sm text-[#00f58a]">{client.total} produzidos</span>} />
            <div className="grid gap-2">
              {client.tasks.map((task) => <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1e2a2f] bg-[#0b0f12] p-3 text-sm"><span className="font-semibold">{task.title}</span><span className="text-[#9ca3af]">{task.content_type} | {formatDate(task.post_date)}</span></div>)}
              {client.tasks.length === 0 && <p className="text-sm text-[#9ca3af]">Nenhum conteudo postado para este cliente no periodo.</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
