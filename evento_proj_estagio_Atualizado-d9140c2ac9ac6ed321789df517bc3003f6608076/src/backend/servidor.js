import express from "express";
import cors from "cors";
import path from "path"; // Importando path para manipular caminhos de diretórios
import eventoRoutes from "./rotas/eventos.js";
import adminRoutes from "./rotas/administradores.js";
import convidadoRoutes from "./rotas/convidados.js";
import superadminRoutes from "./rotas/superadmin.js";

// Obtendo o diretório atual com 'import.meta.url'
const app = express();

const __dirname = path.dirname(new URL(import.meta.url).pathname); // Corrigindo __dirname para o modo ESM

app.use(express.json());
app.use(cors());

// Configuração para servir arquivos estáticos da pasta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/eventos", eventoRoutes);
app.use("/api/eventos/:id", eventoRoutes);
app.use("/api/administradores", adminRoutes);
app.use("/convidados", convidadoRoutes);
app.use("/api/convidados", convidadoRoutes);
app.use("/api/convidados/:id", convidadoRoutes);
app.use("/api/convidados/:id/confirmacao", convidadoRoutes);
app.use("/api/convidados/:id/acompanhantes/:id", convidadoRoutes);
app.use("/api/superadmin", superadminRoutes);

app.listen(5000, () => {
  console.log(`Servidor rodando na porta 5000`);
});
