import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url'; 
import eventoRoutes from "./rotas/eventos.js";
import convidadoRoutes from "./rotas/convidados.js";
import { credenciaisRouter } from './rotas/credenciais.js';
import process from 'process';
import dotenv from 'dotenv';
import presencaRouter from "./rotas/convidados.js";

dotenv.config({ path: '.env' });

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173", // Frontend local 
    "https://omeuconvite-testing.up.railway.app", // Frontend em produção
    "https://omeuconvite-production.up.railway.app", // Frontend em produção
    "https://omeuconvite.com.br"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(cors());


app.use(express.json({ limit: '10mb' })); 
// Rotas da API
app.use("/api/eventos", eventoRoutes);
app.use("/api/convidados", convidadoRoutes);
app.use('/api/credenciais', credenciaisRouter);

//para confirmar presença

app.use("/api", presencaRouter);

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
