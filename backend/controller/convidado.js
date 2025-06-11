import {
  createConvidadoModel,
  updateConvidadoModel,
  deleteConvidadoModel,
  createAcompanhanteModel,
  getAcompanhantesByConvidadoEvento,
  deleteAcompanhanteModel,
  updateAcompanhanteModel,
  confirmarAcompanhantesModel,
  getConvidadoByIdModel,
  addConvidadoToEventoModel,
  updateConvidadoEventoModel,
  removeConvidadoFromEventoModel,
  removeConvidadoFromAllEventosModel,
  inativaAcompanhanteModel,
  getConvidadosModel,
  getConvidadoByTokenModel,
  confirmarPresencaPorTokenModel,
} from "../model/convidado.js";
import conexao from '../configuracao/banco.js';

export async function createConvidado(req, res) {
  try {
    const { nome, telefone, email, limite_padrao, eventos, acompanhantes } = req.body;

    const resultConvidado = await createConvidadoModel({
      nome,
      telefone,
      email,
      limite_acompanhante: limite_padrao || 0,
    });

    const convidadoId = resultConvidado.insertId;

    if (eventos?.length > 0) {
      await Promise.all(
        eventos.map((evento) =>
          addConvidadoToEventoModel(
            convidadoId,
            evento.id,
            evento.limite_acompanhante || limite_padrao || 0,
            evento.confirmado || 0
          )
        )
      );
    }

    if (acompanhantes?.length > 0) {
      await Promise.all(
        acompanhantes.map((a) =>
          createAcompanhanteModel({
            ...a,
            convidado_id: convidadoId,
            evento_id: a.eventoId,
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      data: {
        id: convidadoId,
        limite_padrao: limite_padrao || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao criar convidado:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getAllConvidados(req, res) {
  try {
    const convidados = await getConvidadosModel();
    res.json({
      success: true,
      data: convidados,
    });
  } catch (err) {
    console.error("Erro ao buscar convidados:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar convidados",
    });
  }
}

export async function updateConvidado(req, res) {
  try {
    const { id } = req.params;
    const { eventos, ...dadosConvidado } = req.body;

    const resultUpdateConvidado = await updateConvidadoModel(id, dadosConvidado);

    if (!resultUpdateConvidado.affectedRows) {
      const convidadoExistente = await getConvidadoByIdModel(id);
      if (!convidadoExistente) {
          return res.status(404).json({
              success: false,
              error: "Convidado não encontrado",
          });
      }
    }

    if (eventos) {
        await removeConvidadoFromAllEventosModel(id);

        await Promise.all(
            eventos.map((evento) =>
                addConvidadoToEventoModel(
                    id,
                    evento.id,
                    evento.limite_acompanhante,
                    evento.confirmado
                )
            )
        );
    }

    res.json({
      success: true,
      message: "Convidado atualizado com sucesso",
    });
  } catch (err) {
    console.error("Erro ao atualizar convidado:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar convidado",
    });
  }
}

export async function deleteConvidadoById(req, res) {
  try {
    const { id } = req.params;

    const result = await deleteConvidadoModel(id);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: "Convidado não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Convidado inativado com sucesso (e associações removidas se configurado em cascata)",
    });
  } catch (err) {
    console.error("Erro ao inativar convidado:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao inativar convidado",
    });
  }
}

export async function getConvidadoById(req, res) {
  try {
    const { id } = req.params;
    const convidado = await getConvidadoByIdModel(id);

    if (!convidado) {
      return res.status(404).json({
        success: false,
        error: "Convidado não encontrado",
      });
    }

    res.json({
      success: true,
      data: convidado,
    });
  } catch (err) {
    console.error("Erro ao buscar convidado:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar convidado",
    });
  }
}

export async function addConvidadoToEvento(req, res) {
  try {
    const { convidadoId, eventoId } = req.params;
    const { limite_acompanhante, confirmado } = req.body;

    const result = await addConvidadoToEventoModel(
      convidadoId,
      eventoId,
      limite_acompanhante,
      confirmado
    );

    res.status(201).json({
      success: true,
      message: "Convidado associado ao evento com sucesso",
      data: result,
    });
  } catch (err) {
    console.error("Erro ao associar convidado ao evento:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao associar convidado ao evento",
    });
  }
}

export async function updateConvidadoEvento(req, res) {
  try {
    const { convidadoId, eventoId } = req.params;
    const { limite_acompanhante, confirmado } = req.body;

    const result = await updateConvidadoEventoModel(convidadoId, eventoId, {
      limite_acompanhante,
      confirmado,
    });

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: "Relação convidado-evento não encontrada",
      });
    }

    res.json({
      success: true,
      message: "Relação convidado-evento atualizada com sucesso",
    });
  } catch (err) {
    console.error("Erro ao atualizar relação convidado-evento:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar relação convidado-evento",
    });
  }
}

export async function removeConvidadoFromEvento(req, res) {
  try {
    const { convidadoId, eventoId } = req.params;

    const result = await removeConvidadoFromEventoModel(convidadoId, eventoId);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: "Relação convidado-evento não encontrada",
      });
    }

    res.json({
      success: true,
      message: "Convidado removido do evento com sucesso",
    });
  } catch (err) {
    console.error("Erro ao remover convidado do evento:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao remover convidado do evento",
    });
  }
}

export async function createAcompanhante(req, res) {
  try {
    const { convidadoId } = req.params;
    const { nome, telefone, email, evento_id } = req.body;

    const convidado = await getConvidadoByIdModel(convidadoId);
    if (!convidado) {
      return res.status(404).json({
        success: false,
        error: "Convidado não encontrado",
      });
    }

    const eventoDesteConvidado = convidado.eventos?.find(
      (e) => String(e.id) === String(evento_id)
    );

    if (!eventoDesteConvidado) {
      return res.status(404).json({
        success: false,
        error: "Convidado não associado a este evento. Não é possível adicionar acompanhante.",
      });
    }

    const acompanhantesExistente = await getAcompanhantesByConvidadoEvento(
      convidadoId,
      evento_id
    );

    if (acompanhantesExistente.length >= (eventoDesteConvidado.limite_acompanhante || 0)) {
      return res.status(400).json({
        success: false,
        error: `Limite de acompanhantes (${eventoDesteConvidado.limite_acompanhante}) atingido para o evento: ${eventoDesteConvidado.nome}`,
      });
    }

    const result = await createAcompanhanteModel({
      nome,
      telefone: telefone || null,
      email: email || null,
      convidado_id: convidadoId,
      evento_id: evento_id,
    });

    res.status(201).json({
      success: true,
      message: "Acompanhante adicionado com sucesso",
      data: {
        id: result.insertId,
        nome,
        telefone,
        email,
        confirmado: 1,
        convidado_evento_convidado_id: convidadoId,
        convidado_evento_evento_id: evento_id,
      },
    });
  } catch (err) {
    console.error("Erro ao criar acompanhante:", err);
    res.status(500).json({
      success: false,
      error: "Erro interno ao processar solicitação",
    });
  }
}

export async function handleGetAcompanhantes(req, res) { // <-- AQUI É A MUDANÇA
  try {
    const { convidadoId, eventoId } = req.params;

    const acompanhantes = await getAcompanhantesByConvidadoEvento(convidadoId, eventoId);

    res.json({
      success: true,
      data: acompanhantes,
    });
  } catch (err) {
    console.error("Erro ao buscar acompanhantes:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar acompanhantes do convidado",
    });
  }
}

export async function updateAcompanhanteById(req, res) {
  try {
    const { acompanhanteId } = req.params;
    const result = await updateAcompanhanteModel(acompanhanteId, req.body);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: "Acompanhante não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Acompanhante atualizado com sucesso",
    });
  } catch (err) {
    console.error("Erro ao atualizar acompanhante:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar acompanhante",
    });
  }
}

export async function confirmarAcompanhantes(req, res) {
  try {
    const { convidadoId, eventoId } = req.params;
    const { acompanhantes } = req.body;

    if (!Array.isArray(acompanhantes)) {
      return res.status(400).json({
        success: false,
        error: "Lista de acompanhantes inválida",
      });
    }

    const ids = acompanhantes
      .filter(a => a?.id && a.confirmado)
      .map(a => a.id);

    if (!ids.length) {
      return res.json({
        success: true,
        message: "Nenhum acompanhante válido para confirmar",
        data: { confirmados: 0 },
      });
    }

    const result = await confirmarAcompanhantesModel(convidadoId, eventoId, ids);

    res.json({
      success: true,
      message: `${result.affectedRows} acompanhante(s) confirmado(s)`,
      data: { confirmados: result.affectedRows },
    });
  } catch (error) {
    console.error("Erro ao confirmar acompanhantes:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao confirmar acompanhantes",
    });
  }
}

export async function deleteAcompanhanteById(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID do acompanhante inválido",
      });
    }

    const result = await deleteAcompanhanteModel(id);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: "Acompanhante não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Acompanhante inativado com sucesso",
    });
  } catch (err) {
    console.error("Erro ao inativar acompanhante:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao inativar acompanhante",
    });
  }
}

export async function inativaAcompanhanteByIdConvidado(convidadoId, eventoId) {
  try {
    await inativaAcompanhanteModel(convidadoId, eventoId);
  } catch (err) {
    console.error("Erro ao inativar acompanhantes:", err);
  }
}

export async function validarTokenController(req, res) {
  try {
    const token = req.params.token;
    const convidado = await getConvidadoByTokenModel(token);

    if (!convidado) {
      return res.status(404).json({ valid: false, error: "Token inválido" });
    }

    res.status(200).json({
      valid: true,
      convidado
    });
  } catch (err) {
    console.error("Erro ao validar token:", err);
    res.status(500).json({ valid: false, error: "Erro interno do servidor" });
  }
}

export async function confirmarPresencaPorToken(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ mensagem: "Token não fornecido." });
  }

  try {
    const result = await confirmarPresencaPorTokenModel(token);

    if (!result) {
      return res.status(404).json({ mensagem: "Token inválido ou não encontrado." });
    }

    if (result.token_usado === 1) {
      return res.status(409).json({ mensagem: "Essa credencial já foi lida" });
    }

    if (result.tipo === "convidado") {
      return res.json({
        tipo: "convidado",
        nome: result.nome,
        mensagem: `🎉 Convidado ${result.nome} presente na festa!`,
      });
    } else if (result.tipo === "acompanhante") {
      return res.json({
        tipo: "acompanhante",
        nome: result.nome,
        mensagem: `🎉 Acompanhante ${result.nome} presente na festa!`,
      });
    }
  } catch (error) {
    console.error("Erro ao confirmar presença por token:", error);
    return res.status(500).json({ mensagem: "Erro interno ao confirmar presença." });
  }
}

export const togglePresencaConvidado = async (req, res) => {
  try {
    const { convidadoId, eventoId } = req.params;

    const convidadoEvento = await new Promise((resolve, reject) => {
      conexao.query(
        "SELECT token_usado FROM convidado_evento WHERE convidado_id = ? AND evento_id = ?",
        [convidadoId, eventoId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!convidadoEvento) {
      return res.status(404).json({
        success: false,
        error: "Relação convidado-evento não encontrada",
      });
    }

    const novoStatus = convidadoEvento.token_usado ? 0 : 1;

    await updateConvidadoEventoModel(convidadoId, eventoId, { token_usado: novoStatus });

    res.json({
      success: true,
      token_usado: novoStatus,
      message: `Presença ${novoStatus ? "marcada" : "desmarcada"} com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao alternar presença do convidado:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const togglePresencaAcompanhante = async (req, res) => {
  try {
    const { acompanhanteId } = req.params;

    const acompanhante = await new Promise((resolve, reject) => {
      conexao.query(
        "SELECT token_usado FROM acompanhante WHERE id = ?",
        [acompanhanteId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!acompanhante) {
      return res.status(404).json({
        success: false,
        error: "Acompanhante não encontrado",
      });
    }

    const novoStatus = acompanhante.token_usado ? 0 : 1;

    await updateAcompanhanteModel(acompanhanteId, { token_usado: novoStatus });

    res.json({
      success: true,
      token_usado: novoStatus,
      message: `Presença ${novoStatus ? "marcada" : "desmarcada"} com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao alternar presença do acompanhante:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};