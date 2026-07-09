import { Card, Button } from "../components/ui";

export function Placeholder({ title }: { title: string }) {
  return <Card className="p-8"><h2 className="text-2xl font-black">{title}</h2><p className="mt-2 max-w-2xl text-[#9ca3af]">Tela preparada dentro do design system Pulso Social. A estrutura visual, sidebar, header, cards e tokens ja estao prontos para evoluir este modulo com dados reais.</p><Button className="mt-6">Criar novo registro</Button></Card>;
}
