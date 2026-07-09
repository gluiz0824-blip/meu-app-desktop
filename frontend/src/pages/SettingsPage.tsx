import { DatabaseBackup } from "lucide-react";
import { useState } from "react";
import { api } from "../services/api";
import { Button, Card, Input, Select, SectionTitle } from "../components/ui";

export function SettingsPage() {
  const [userName, setUserName] = useState("Luiz Guilherme");
  const [theme, setTheme] = useState("dark");
  const [backupPath, setBackupPath] = useState("");
  const backup = async () => {
    const result = await api.post<{ file: string }>("/backup");
    setBackupPath(result.file);
  };
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5">
        <SectionTitle title="Preferencias" />
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Nome do usuario<Input value={userName} onChange={(e) => setUserName(e.target.value)} /></label>
          <label className="grid gap-2 text-sm text-[#cbd5e1]">Tema<Select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="dark">Dark premium</option></Select></label>
          <Button onClick={() => alert("Preferencias salvas localmente nesta versao.")}>Salvar preferencias</Button>
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle title="Backup local" />
        <p className="text-sm leading-6 text-[#9ca3af]">Com Supabase, os backups devem ser feitos pelo painel do projeto ou por dump do banco Postgres.</p>
        <Button className="mt-5" onClick={backup}><DatabaseBackup size={18} /> Fazer backup</Button>
        {backupPath && <p className="mt-4 rounded-lg border border-[#1e2a2f] bg-[#0b0f12] p-3 text-sm text-[#00f58a]">{backupPath}</p>}
      </Card>
    </div>
  );
}
