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
  handleGetAcompanhantes // <-- Importação do controller corrigida
} from "../controller/convidado.js";

const router = express.Router();

// --- Rotas para Convidados ---
router.get("/", getAllConvidados); // Retorna todos os convidados (filtrados por adminId no frontend)
router.post("/", createConvidado); // Cria um novo convidado (e pode associá-lo a um evento e criar acompanhantes)
router.get("/:id", getConvidadoById); // Retorna um convidado específico com seus eventos e acompanhantes
router.put("/:id", updateConvidado); // Atualiza dados do convidado e gerencia seus acompanhantes (cria, atualiza, inativa)
router.delete("/:id", deleteConvidadoById); // Inativa um convidado (marca como inativo)

// --- Rotas para Relacionamento Convidado-Evento ---
// Adiciona um convidado existente a um evento
router.post("/:convidadoId/eventos/:eventoId", addConvidadoToEvento);

// Atualiza a relação de um convidado com um evento (limite_acompanhante, status de confirmação)
// Esta rota é usada pelo frontend quando a confirmação ou o limite de acompanhantes é alterado no contexto do evento.
router.put("/:convidadoId/eventos/:eventoId", updateConvidadoEvento);

// Remove a associação de um convidado com um evento (não deleta o convidado)
router.delete("/:convidadoId/eventos/:eventoId", removeConvidadoFromEvento);

// --- Rotas para Acompanhantes ---
// Para buscar acompanhantes de um convidado em um evento específico
// Embora getConvidadoById já retorne acompanhantes, esta rota pode ser útil para casos específicos.
router.get("/:convidadoId/eventos/:eventoId/acompanhantes", handleGetAcompanhantes);

// Rota para criar um acompanhante para um convidado (diretamente, sem ser pela rota PUT do convidado principal)
// Usado principalmente se você quiser adicionar acompanhantes de forma isolada, fora do fluxo de edição do convidado principal.
// O frontend agora envia `evento_id` no body para este endpoint.
router.post("/:convidadoId/acompanhantes", createAcompanhante);

// Rotas específicas para um acompanhante (usando acompanhanteId)
// Atualiza dados de um acompanhante específico.
router.put("/acompanhantes/:acompanhanteId", updateAcompanhanteById);

// Inativa (deleta logicamente) um acompanhante específico.
router.delete('/acompanhantes/:acompanhanteId', deleteAcompanhanteById);

// --- Rotas de Presença e Confirmação (Status) ---

// Alterna o status de "token_usado" (presença) para um convidado principal em um evento.
router.put("/:convidadoId/eventos/:eventoId/presenca", togglePresencaConvidado);

// Alterna o status de "confirmado" (confirmado/pendente) para um convidado principal em um evento.
// Esta rota é para o toggle de confirmação, que no seu frontend usa o mesmo endpoint PUT,
// mas a lógica no controller `updateConvidadoEvento` lida com o campo `confirmado`.
// Não é necessário uma rota separada para "confirmacao" se `updateConvidadoEvento` já lida com isso.
// Se você quiser uma rota mais semântica para o "toggle confirmado", pode ser assim:
router.put("/:convidadoId/eventos/:eventoId/confirmar", updateConvidadoEvento); // Ou criar um toggleConfirmacaoConvidado se a lógica for diferente da presenca

// Alterna o status de "token_usado" (presença) para um acompanhante.
router.put("/acompanhantes/:acompanhanteId/presenca", togglePresencaAcompanhante);

// Alterna o status de "confirmado" para um acompanhante (similar ao convidado).
// Se o seu frontend também tem um toggle para o `confirmado` do acompanhante, você pode usar:
router.put("/acompanhantes/:acompanhanteId/confirmar", updateAcompanhanteById); // Passará { confirmado: true/false } no body

// Rota para confirmar em massa acompanhantes de um convidado para UM EVENTO
// `req.body` esperará um array de acompanhantes com `id` e `confirmado: 1`
router.post("/:convidadoId/eventos/:eventoId/confirmar-acompanhantes", confirmarAcompanhantes);

// Rota global para confirmação de presença via QR Code/Token
router.post('/presenca', confirmarPresencaPorToken);


export default router;