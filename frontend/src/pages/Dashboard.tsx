import { AlertTriangle, CalendarCheck, CheckCircle2, Clock, Edit3, Hourglass, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PriorityBadge, SectionTitle, StatCard } from "../components/ui";
import type { Client, DashboardData, Task } from "../types";
import { formatDate, statusLabel } from "../utils/format";

const emptyDashboard: DashboardData = {
  metrics: { todayTasks: 0, overdueTasks: 0, inProduction: 0, awaitingApproval: 0, completedWeek: 0, activeClients: 0, postedMonth: 0 },
  urgent: [],
  upcoming: [],
  weekly: []
};

export function Dashboard({ clients, tasks, dashboard }: { clients: Client[]; tasks: Task[]; dashboard?: DashboardData | null }) {
  const data = dashboard ?? emptyDashboard;
  const urgent = data.urgent.length ? data.urgent : tasks.filter((task) => task.priority === "urgente" || task.priority === "alta").slice(0, 5);
  const next = data.upcoming.length ? data.upcoming : tasks.filter((task) => task.due_date || task.post_date).slice(0, 5);
  const productivity = data.weekly.length ? data.weekly.map((item) => ({ day: formatDate(item.day).slice(0, 5), total: item.total })) : Array.from({ length: 7 }, (_, index) => ({ day: `${index + 1}`, total: 0 }));
  const platformStats = Object.entries(tasks.reduce<Record<string, number>>((acc, task) => {
    const key = task.platform || "Sem plataforma";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {})).map(([name, total]) => ({ name, total })).slice(0, 6);
  const colors = ["#00f58a", "#18e889", "#f5b642", "#a855f7", "#94a3b8", "#64748b"];
  const contentTypeStats = Object.entries(tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.content_type] = (acc[task.content_type] ?? 0) + 1;
    return acc;
  }, {})).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Tarefas de Hoje" value={data.metrics.todayTasks} detail="Vencem hoje" icon={<CalendarCheck size={22} />} />
        <StatCard title="Atrasadas" value={data.metrics.overdueTasks} detail="Precisam de atencao" icon={<Clock size={22} />} tone="danger" />
        <StatCard title="Em Producao" value={data.metrics.inProduction} detail="Roteiro, design ou edicao" icon={<Edit3 size={22} />} />
        <StatCard title="Aguardando Aprovacao" value={data.metrics.awaitingApproval} detail="Com cliente ou revisao" icon={<Hourglass size={22} />} tone="warning" />
        <StatCard title="Concluidas na Semana" value={data.metrics.completedWeek} detail="Marcadas como postadas" icon={<CheckCircle2 size={22} />} />
        <StatCard title="Clientes Ativos" value={data.metrics.activeClients || clients.filter((client) => client.status === "ativo").length} detail="Na carteira ativa" icon={<Users size={22} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <SectionTitle title="Produtividade" action={<span className="rounded-lg border border-[#1e2a2f] px-3 py-2 text-xs text-[#cbd5e1]">Ultimos 7 dias</span>} />
          <p className="mb-4 text-sm text-[#9ca3af]">Tarefas postadas por dia</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivity}>
                <defs><linearGradient id="greenArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00f58a" stopOpacity={0.45} /><stop offset="100%" stopColor="#00f58a" stopOpacity={0.02} /></linearGradient></defs>
                <XAxis dataKey="day" stroke="#6b7280" axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0b0f12", border: "1px solid #1e2a2f", borderRadius: 10, color: "#fff" }} />
                <Area type="monotone" dataKey="total" stroke="#00f58a" strokeWidth={2} fill="url(#greenArea)" dot={{ fill: "#00f58a", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Conteudos por Plataforma" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformStats}>
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0b0f12", border: "1px solid #1e2a2f", borderRadius: 10, color: "#fff" }} />
                <Bar dataKey="total" fill="#00f58a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[.9fr_1fr_1.1fr]">
        <Card className="p-5">
          <SectionTitle title="Tipos de Conteudo" />
          <div className="grid gap-4 md:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[190px_1fr]">
            <div className="relative h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={contentTypeStats} innerRadius={62} outerRadius={94} paddingAngle={2} dataKey="value">{contentTypeStats.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-black">{tasks.length}</p><p className="text-xs text-[#9ca3af]">conteudos</p></div></div>
            </div>
            <div className="grid content-center gap-3">
              {contentTypeStats.map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-[#d1d5db]"><i className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.name}</span><span className="text-[#9ca3af]">{item.value}</span></div>)}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Proximas Entregas" />
          <div className="divide-y divide-[#1e2a2f]">
            {next.length === 0 && <p className="py-8 text-sm text-[#9ca3af]">Nenhuma entrega cadastrada.</p>}
            {next.map((task) => <div key={task.id} className="flex items-center gap-3 py-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#11171b] text-xs font-black text-[#00f58a]">{(task.client_name ?? "SC").slice(0, 2)}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{task.client_name ?? "Sem cliente"}</p><p className="truncate text-sm text-[#9ca3af]">{task.title}</p></div><div className="text-right text-sm"><p>{formatDate(task.due_date || task.post_date)}</p><p className="text-[#9ca3af]">{statusLabel(task.status)}</p></div><CheckCircle2 size={20} className="text-[#00f58a]" /></div>)}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Tarefas Urgentes" action={<span className="rounded-full bg-[#3c1215] px-2 py-1 text-xs font-bold text-[#ff4d4d]">{urgent.length}</span>} />
          <div className="divide-y divide-[#1e2a2f]">
            {urgent.length === 0 && <p className="py-8 text-sm text-[#9ca3af]">Nenhuma tarefa urgente.</p>}
            {urgent.map((task) => <div key={task.id} className="flex items-center gap-3 py-3"><AlertTriangle size={18} className="text-[#ff4d4d]" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{task.title}</p><p className="truncate text-sm text-[#9ca3af]">Cliente: {task.client_name ?? "Sem cliente"}</p></div><PriorityBadge priority={task.priority} /></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
