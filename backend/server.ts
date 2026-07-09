import "dotenv/config";
import app from "./app.js";
import { hasSupabase } from "./supabase.js";

const port = Number(process.env.PORT ?? 3333);

app.listen(port, "127.0.0.1", () => {
  console.log(`API rodando em http://127.0.0.1:${port} (${hasSupabase ? "Supabase" : "local"})`);
});
