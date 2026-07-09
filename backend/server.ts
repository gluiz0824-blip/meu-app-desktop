import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { hasSupabase, requireData, supabase } from "./supabase.js";

type Client = Record<string, any>;
type Task = Record<string, any>;

const app = express();
const port = Number(process.env.PORT ?? 3333);
const localDir = path.join(process.cwd(), "database");
const localPath = path.join(localDir, "local-data.json");

app.use(cors());
app.use(express.json({ limit: "4mb" }));

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthRange(month?: string) {
  const value = month && /^\d{4}-\d{2}$/.test(month) ? month : today().slice(0, 7);
  const [year, monthIndex] = value.split("-").map(Number);
  const endDate = new Date(year, monthIndex, 0);
  return { value, start: `${value}-01`, end: `${value}-${String(endDate.getDate()).padStart(2, "0")}` };
}

function seedClients(): Client[] {
  return [
    ["KnowHow Imob", "Imobiliaria", "Autoridade consultiva para mercado imobiliario local."],
    ["Brauna Moveis Planejados", "Marcenaria / Moveis Planejados", "Moveis planejados premium, acabamento, organizacao e ambientes sob medida."],
    ["Imperio Pre-Moldados", "Construcao / Pre-moldados", "Conteudo tecnico, obra, resistencia e prova visual de qualidade."],
    ["Jade Ibler Estetica", "Estetica", "Educacao, autoridade e autocuidado com comunicacao premium."],
    ["A+FIT Academia", "Academia", "Energia, rotina, comunidade e campanhas para novos alunos."]
  ].map(([name, segment, notes], index) => ({
    id: index + 1,
    name,
    segment,
    notes,
    contact_name: "Luiz Guilherme",
    status: "ativo",
    plan: "Profissional",
    posts_per_month: 12,
    reels_per_month: 4,
    due_day: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

function readLocal() {
  fs.mkdirSync(localDir, { recursive: true });
  if (!fs.existsSync(localPath)) {
    const initial = { clients: seedClients(), tasks: [], settings: { app: {} } };
    fs.writeFileSync(localPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(localPath, "utf8"));
}

function writeLocal(data: any) {
  fs.mkdirSync(localDir, { recursive: true });
  fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
}

function nextId(rows: Array<{ id: number }>) {
  return rows.length ? Math.max(...rows.map((row) => Number(row.id))) + 1 : 1;
}

function normalizeTask(task: any) {
  return { ...task, client_name: task.clients?.name ?? task.client_name ?? null, client_segment: task.clients?.segment ?? task.client_segment ?? null, clients: undefined };
}

async function getClients() {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    return requireData(data, error);
  }
  return readLocal().clients;
}

async function getTasks() {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from("tasks").select("*, clients(name, segment)").order("due_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
    return requireData(data, error).map(normalizeTask);
  }
  const data = readLocal();
  return data.tasks.map((task: Task) => {
    const client = data.clients.find((item: Client) => item.id === task.client_id);
    return { ...task, client_name: client?.name ?? null, client_segment: client?.segment ?? null };
  });
}

app.get("/api/health", (_req, res) => res.json({ ok: true, database: hasSupabase ? "supabase" : "local-json" }));

app.get("/api/clients", async (_req, res, next) => {
  try { res.json(await getClients()); } catch (error) { next(error); }
});

app.post("/api/clients", async (req, res, next) => {
  try {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("clients").insert(req.body).select("*").single();
      return res.status(201).json(requireData(data, error));
    }
    const data = readLocal();
    const row = { ...req.body, id: nextId(data.clients), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    data.clients.unshift(row);
    writeLocal(data);
    res.status(201).json(row);
  } catch (error) { next(error); }
});

app.put("/api/clients/:id", async (req, res, next) => {
  try {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("clients").update(req.body).eq("id", req.params.id).select("*").single();
      return res.json(requireData(data, error));
    }
    const data = readLocal();
    const index = data.clients.findIndex((row: Client) => row.id === Number(req.params.id));
    data.clients[index] = { ...data.clients[index], ...req.body, updated_at: new Date().toISOString() };
    writeLocal(data);
    res.json(data.clients[index]);
  } catch (error) { next(error); }
});

app.delete("/api/clients/:id", async (req, res, next) => {
  try {
    if (hasSupabase && supabase) {
      const { error } = await supabase.from("clients").delete().eq("id", req.params.id);
      if (error) throw new Error(error.message);
    } else {
      const data = readLocal();
      data.clients = data.clients.filter((row: Client) => row.id !== Number(req.params.id));
      data.tasks = data.tasks.map((task: Task) => task.client_id === Number(req.params.id) ? { ...task, client_id: null } : task);
      writeLocal(data);
    }
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get("/api/tasks", async (_req, res, next) => {
  try { res.json(await getTasks()); } catch (error) { next(error); }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("tasks").insert(req.body).select("*, clients(name, segment)").single();
      return res.status(201).json(normalizeTask(requireData(data, error)));
    }
    const data = readLocal();
    const row = { ...req.body, id: nextId(data.tasks), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    data.tasks.unshift(row);
    writeLocal(data);
    const client = data.clients.find((item: Client) => item.id === row.client_id);
    res.status(201).json({ ...row, client_name: client?.name ?? null });
  } catch (error) { next(error); }
});

app.put("/api/tasks/:id", async (req, res, next) => {
  try {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from("tasks").update(req.body).eq("id", req.params.id).select("*, clients(name, segment)").single();
      return res.json(normalizeTask(requireData(data, error)));
    }
    const data = readLocal();
    const index = data.tasks.findIndex((row: Task) => row.id === Number(req.params.id));
    data.tasks[index] = { ...data.tasks[index], ...req.body, updated_at: new Date().toISOString() };
    writeLocal(data);
    const client = data.clients.find((item: Client) => item.id === data.tasks[index].client_id);
    res.json({ ...data.tasks[index], client_name: client?.name ?? null });
  } catch (error) { next(error); }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    if (hasSupabase && supabase) {
      const { error } = await supabase.from("tasks").delete().eq("id", req.params.id);
      if (error) throw new Error(error.message);
    } else {
      const data = readLocal();
      data.tasks = data.tasks.filter((row: Task) => row.id !== Number(req.params.id));
      writeLocal(data);
    }
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get("/api/dashboard", async (_req, res, next) => {
  try {
    const clients = await getClients();
    const tasks = await getTasks();
    const now = today();
    const weekStartDate = new Date();
    weekStartDate.setDate(weekStartDate.getDate() - 6);
    const weekStart = weekStartDate.toISOString().slice(0, 10);
    const open = tasks.filter((task: Task) => !["postado", "cancelado"].includes(task.status));
    const postedWeek = tasks.filter((task: Task) => task.status === "postado" && String(task.post_date || task.updated_at).slice(0, 10) >= weekStart);
    res.json({
      metrics: {
        todayTasks: tasks.filter((task: Task) => task.due_date === now).length,
        overdueTasks: open.filter((task: Task) => task.due_date && task.due_date < now).length,
        inProduction: tasks.filter((task: Task) => ["design", "edicao"].includes(task.status)).length,
        awaitingApproval: tasks.filter((task: Task) => task.status === "aguardando_aprovacao").length,
        completedWeek: postedWeek.length,
        activeClients: clients.filter((client: Client) => client.status === "ativo").length,
        postedMonth: tasks.filter((task: Task) => task.status === "postado" && String(task.post_date || "").startsWith(now.slice(0, 7))).length
      },
      urgent: open.slice(0, 8),
      upcoming: open.filter((task: Task) => task.due_date >= now).slice(0, 8),
      weekly: []
    });
  } catch (error) { next(error); }
});

app.get("/api/reports", async (req, res, next) => {
  try {
    const clientId = req.query.clientId ? Number(req.query.clientId) : null;
    const range = monthRange(String(req.query.month ?? ""));
    const clients = (await getClients()).filter((client: Client) => !clientId || client.id === clientId);
    const posted = (await getTasks()).filter((task: Task) => task.status === "postado" && task.post_date >= range.start && task.post_date <= range.end && (!clientId || task.client_id === clientId));
    const producedByClient = clients.map((client: Client) => {
      const items = posted.filter((task: Task) => task.client_id === client.id);
      return {
        id: client.id,
        name: client.name,
        contracted: Number(client.posts_per_month ?? 0) + Number(client.reels_per_month ?? 0),
        total: items.length,
        reels: items.filter((task: Task) => task.content_type === "reels").length,
        carousels: items.filter((task: Task) => task.content_type === "carrossel").length,
        stories: items.filter((task: Task) => task.content_type === "stories").length,
        posts: items.filter((task: Task) => String(task.content_type).includes("post")).length,
        tasks: items
      };
    });
    res.json({
      month: range.value,
      start: range.start,
      end: range.end,
      producedByClient,
      totals: {
        clients: producedByClient.length,
        produced: producedByClient.reduce((sum: number, item: { total: number }) => sum + item.total, 0),
        contracted: producedByClient.reduce((sum: number, item: { contracted: number }) => sum + item.contracted, 0)
      }
    });
  } catch (error) { next(error); }
});

app.post("/api/backup", (_req, res) => res.json({ file: hasSupabase ? "Use backups do painel Supabase" : localPath }));

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: error.message || "Erro interno" });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`API rodando em http://127.0.0.1:${port} (${hasSupabase ? "Supabase" : "local"})`);
});
