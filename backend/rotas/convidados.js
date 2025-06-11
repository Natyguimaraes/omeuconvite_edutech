import express from "express";
import {
  getAllConvidados,
  getConvidadoById,
  createConvidado,
  updateConvidado,
  deleteConvidadoById,
  createAcompanhante,
  deleteAcompanhanteById,
  updateAcompanhanteById,
  confirmarAcompanhantes,
  addConvidadoToEvento,
  updateConvidadoEvento,
  removeConvidadoFromEvento,
  confirmarPresencaPorToken,
  togglePresencaConvidado,
  togglePresencaAcompanhante,
  handleGetAcompanhantes // <--- CORRIGIDO PARA handleGetAcompanhantes
} from "../controller/convidado.js";

const router = express.Router();

// --- Rotas para Convidados ---
router.get("/", getAllConvidados);
router.post("/", createConvidado);
router.get("/:id", getConvidadoById);
router.put("/:id", updateConvidado);
router.delete("/:id", deleteConvidadoById); // Chamará deleteConvidadoById (que inativa)

// --- Rotas para Relacionamento Convidado-Evento ---
router.post("/:convidadoId/eventos/:eventoId", addConvidadoToEvento);
router.put("/:convidadoId/eventos/:eventoId", updateConvidadoEvento); // Usado para atualizar limite_acompanhante, confirmado, etc.
router.delete("/:convidadoId/eventos/:eventoId", removeConvidadoFromEvento);

// Rota para confirmar/alternar presença do convidado em um evento
router.put("/:convidadoId/eventos/:eventoId/confirmacao", updateConvidadoEvento);

// Rotas para alternar presença (token_usado)
router.put("/:convidadoId/eventos/:eventoId/presenca", togglePresencaConvidado);

// --- Rotas para Acompanhantes ---
// Para buscar acompanhantes de um convidado em um evento específico
router.get("/:convidadoId/eventos/:eventoId/acompanhantes", handleGetAcompanhantes);

// Rota para criar um acompanhante para um convidado em um evento
router.post("/:convidadoId/acompanhantes", createAcompanhante);

// Rotas específicas para um acompanhante (usando acompanhanteId)
router.put("/acompanhantes/:acompanhanteId", updateAcompanhanteById); // Rota simplificada e correta

// Rota para inativar (deletar) um acompanhante
router.delete('/acompanhantes/:id', deleteAcompanhanteById); // Rota mantida, chama deleteAcompanhanteById (que inativa)

// Rota para alternar presença de um acompanhante
router.put("/acompanhantes/:acompanhanteId/presenca", togglePresencaAcompanhante); // Rota simplificada e correta

// Rota para confirmar em massa acompanhantes de um convidado para UM EVENTO
router.post("/:convidadoId/eventos/:eventoId/confirmar-acompanhantes", confirmarAcompanhantes); // Rota ajustada

// --- Rota para Confirmação de Presença por Token ---
router.post('/presenca', confirmarPresencaPorToken); // Rota global para leitura de QR Code/Token

export default router;