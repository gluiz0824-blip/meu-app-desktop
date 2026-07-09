export function priorityTone(priority: string) {
  if (priority === "urgente" || priority === "alta" || priority === "Urgente" || priority === "Alta") return "danger";
  if (priority === "media" || priority === "Media") return "warning";
  return "muted";
}

export const statusLabels: Record<string, string> = {
  ideia: "Ideia",
  roteiro: "Roteiro",
  design: "Design",
  edicao: "Edicao",
  aguardando_aprovacao: "Aguardando aprovacao",
  aprovado: "Aprovado",
  agendado: "Agendado",
  postado: "Postado",
  pausado: "Pausado",
  cancelado: "Cancelado"
};

export const statusColumns = ["ideia", "design", "edicao", "aguardando_aprovacao", "postado"];

export function normalizeKanbanStatus(status?: string) {
  if (status === "roteiro") return "ideia";
  if (status === "aprovado" || status === "agendado") return "aguardando_aprovacao";
  if (status === "pausado" || status === "cancelado") return "ideia";
  return statusColumns.includes(status ?? "") ? status ?? "ideia" : "ideia";
}

export function statusLabel(status?: string) {
  return status ? statusLabels[status] ?? status : "Sem status";
}

export function priorityLabel(priority?: string) {
  const labels: Record<string, string> = { baixa: "Baixa", media: "Media", alta: "Alta", urgente: "Urgente" };
  return priority ? labels[priority] ?? priority : "Media";
}

export function formatDate(value?: string) {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

export function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function eventColor(type: string) {
  const colors: Record<string, string> = {
    "Post Feed": "#a855f7",
    Reels: "#f5b642",
    Stories: "#18e889",
    Carrossel: "#a855f7",
    Gravacao: "#ff4d4d",
    Reuniao: "#3b82f6",
    Aprovacao: "#00f58a",
    Entrega: "#38bdf8",
    Legenda: "#3b82f6",
    Roteiro: "#3b82f6",
    "post estatico": "#a855f7",
    carrossel: "#a855f7",
    reels: "#f5b642",
    stories: "#18e889",
    reunião: "#3b82f6",
    reuniao: "#3b82f6",
    gravacao: "#ff4d4d",
    gravação: "#ff4d4d",
    planejamento: "#38bdf8"
  };
  return colors[type] ?? "#00f58a";
}
