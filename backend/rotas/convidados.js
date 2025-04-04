import express from "express";
import {
  getAllConvidados,
  getConvidadoById,
  createConvidado,
  updateConvidado,
  deleteConvidadoById,
  getAcompanhantesByConvidadoId,
  createAcompanhante,
  deleteAcompanhanteById,
  updateAcompanhanteById,
  confirmarPresencaConvidado,
  confirmarAcompanhantes,
  addConvidadoToEvento,
  updateConvidadoEvento,
  removeConvidadoFromEvento
} from "../controller/convidado.js";

const router = express.Router();

// Rotas para convidados
router.get("/", getAllConvidados);
router.post("/", createConvidado);
router.get("/:id", getConvidadoById);
router.put("/:id", updateConvidado);
router.delete("/:id", deleteConvidadoById);

// Rotas para relacionamento convidado-evento
router.post("/:convidadoId/eventos/:eventoId", addConvidadoToEvento);
router.put("/:convidadoId/eventos/:eventoId", updateConvidadoEvento);
router.delete("/:convidadoId/eventos/:eventoId", removeConvidadoFromEvento);
router.put("/:convidadoId/eventos/:eventoId/confirmacao", confirmarPresencaConvidado);

// Rotas para acompanhantes (agrupadas de forma consistente)
router.get("/:convidadoId/acompanhantes", getAcompanhantesByConvidadoId);
router.post("/:convidadoId/acompanhantes", createAcompanhante);
// Rotas específicas para um acompanhante (usando acompanhanteId)
router.put("/:convidadoId/acompanhantes/:acompanhanteId", updateAcompanhanteById);
router.delete('/acompanhantes/:id', deleteAcompanhanteById);

// Confirmação em massa de acompanhantes
router.post("/:convidadoId/confirmar-acompanhantes", confirmarAcompanhantes);

export default router;