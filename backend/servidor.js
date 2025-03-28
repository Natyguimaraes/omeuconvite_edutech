import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url'; 
import eventoRoutes from "./rotas/eventos.js";
import adminRoutes from "./rotas/administradores.js";
import convidadoRoutes from "./rotas/convidados.js";
import superadminRoutes from "./rotas/superadmin.js";
import process from 'process';

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(cors());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use("/api/eventos", eventoRoutes);
app.use("/api/administradores", adminRoutes);
app.use("/api/convidados", convidadoRoutes);
app.use("/api/superadmin", superadminRoutes);


app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "online",
    message: "API rodando no Railway"
  });
});

//railway e local

const PORT = process.env.PORT || 5000;


app.listen(PORT, "0.0.0.0", () => {
  console.log(`🟢 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesse em: http://localhost:${PORT} (local)`);
});