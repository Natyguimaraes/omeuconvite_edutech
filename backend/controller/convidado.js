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
  removeConvidadoFromAllEventosModel, // Manter se usado em outra rota, mas não em updateConvidado
  inativaAcompanhanteModel,
  getConvidadosModel,
  getConvidadoByTokenModel,
  confirmarPresencaPorTokenModel,
} from "../model/convidado.js";
import conexao from '../configuracao/banco.js';

export async function createConvidado(req, res) {
  try {
    const { nome, telefone, email, limite_acompanhante, evento_id, acompanhantes, administrador_id } = req.body;

    const resultConvidado = await createConvidadoModel({
      nome,
      telefone,
      email,
      limite_acompanhante: limite_acompanhante || 0,
      administrador_id,
      evento_id, // Passa o evento_id para a model criar a associação na mesma transação
    });

    const convidadoId = resultConvidado.id;

    // Se o frontend enviar acompanhantes na criação do convidado principal,
    // eles devem ser criados e associados ao evento_id do convidado principal.
    // Lembre-se que createConvidadoModel já cuida da associação.
    // Este bloco só seria necessário se createConvidadoModel não cuidasse.
    // Se `createConvidadoModel` já adiciona acompanhantes, remova este bloco.
    // No entanto, como a `createConvidadoModel` atual não adiciona acompanhantes em massa,
    // se você quiser que novos acompanhantes sejam criados junto com o convidado
    // via este endpoint, você precisaria adicionar uma lógica aqui ou na model.
    // Por enquanto, o fluxo de acompanhantes é mais forte na rota PUT (updateConvidado).

    res.status(201).json({
      success: true,
      message: "Convidado cadastrado e associado ao evento com sucesso!",
      data: {
        id: convidadoId,
        nome,
        telefone,
        email,
        limite_acompanhante: limite_acompanhante || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao criar convidado:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro interno ao criar convidado",
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
    const { eventoId, ...dadosConvidado } = req.body; // Remove `eventoId` para não passar para a model como dado de convidado principal

    // A `updateConvidadoModel` agora lida com todos os dados do convidado
    // e com os arrays `acompanhantes` e `acompanhantes_to_delete`.
    const resultUpdateConvidado = await updateConvidadoModel(id, dadosConvidado);

    // Se o `eventoId` foi enviado (indicando que o limite de acompanhantes no evento pode ter mudado),
    // chame `updateConvidadoEventoModel` separadamente.
    if (eventoId !== undefined) {
      await updateConvidadoEventoModel(id, eventoId, {
        limite_acompanhante: dadosConvidado.limite_acompanhante,
      });
    }

    res.json({
      success: true,
      message: "Convidado e acompanhantes atualizados com sucesso",
    });
  } catch (err) {
    console.error("Erro ao atualizar convidado:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Erro ao atualizar convidado",
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
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: "Este convidado já está associado a este evento."
      });
    }
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
    const { limite_acompanhante, confirmado, token_usado } = req.body;

    const result = await updateConvidadoEventoModel(convidadoId, eventoId, {
      limite_acompanhante,
      confirmado,
      token_usado,
    });

    if (result.affectedRows === 0) {
      console.warn(`Relação convidado-evento não atualizada para convidadoId: ${convidadoId}, eventoId: ${eventoId}`);
      return res.status(404).json({
        success: false,
        error: "Relação convidado-evento não encontrada ou sem alterações a serem aplicadas.",
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
    console.error("Erro ao remover convidado do evento:", err); // <--- CHECK THIS LOG!
    res.status(500).json({
      success: false,
      error: "Erro ao remover convidado do evento",
    });
  }
}


export async function createAcompanhante(req, res) {
  try {
    const { convidadoId } = req.params;
    const { nome, telefone, email, evento_id, confirmado } = req.body;

    const result = await createAcompanhanteModel({
      nome,
      telefone: telefone || null,
      email: email || null,
      convidado_id: convidadoId,
      evento_id: evento_id,
      confirmado: confirmado || 0,
    });

    res.status(201).json({
      success: true,
      message: "Acompanhante adicionado com sucesso",
      data: {
        id: result.insertId,
        nome,
        telefone,
        email,
        confirmado: confirmado || 0,
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

export async function handleGetAcompanhantes(req, res) {
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
    const { nome, telefone, email, confirmado, token_usado, ativo_acompanhante } = req.body;

    const result = await updateAcompanhanteModel(acompanhanteId, {
      nome,
      telefone,
      email,
      confirmado,
      token_usado,
      ativo_acompanhante
    });

    if (result.affectedRows === 0) {
      console.warn(`Acompanhante não atualizado para ID: ${acompanhanteId}`);
      return res.status(404).json({
        success: false,
        error: "Acompanhante não encontrado ou sem alterações a serem aplicadas.",
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

    const idsToConfirm = acompanhantes
      .filter(a => a?.id && a.confirmado === 1)
      .map(a => a.id);

    if (!idsToConfirm.length) {
      return res.json({
        success: true,
        message: "Nenhum acompanhante válido para confirmar.",
        data: { confirmados: 0 },
      });
    }

    const result = await confirmarAcompanhantesModel(convidadoId, eventoId, idsToConfirm);

    res.json({
      success: true,
      message: `${result.affectedRows} acompanhante(s) confirmado(s) com sucesso.`,
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

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Acompanhante não encontrado para inativação.",
      });
    }

    res.json({
      success: true,
      message: "Acompanhante inativado com sucesso.",
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
    throw err;
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

    if (result.token_usado === 1) { // Verifica se já foi usado (agora ou anteriormente)
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

    const convidadoEventoInfo = await new Promise((resolve, reject) => {
      conexao.query(
        "SELECT token_usado FROM convidado_evento WHERE convidado_id = ? AND evento_id = ?",
        [convidadoId, eventoId],
        (err, results) => {
          if (err) {
            console.error("Erro ao buscar token_usado do convidado_evento:", err);
            return reject(err);
          }
          resolve(results[0]);
        }
      );
    });

    if (!convidadoEventoInfo) {
      return res.status(404).json({
        success: false,
        error: "Relação convidado-evento não encontrada",
      });
    }

    const novoStatusTokenUsado = convidadoEventoInfo.token_usado ? 0 : 1;
    const novoStatusConfirmado = novoStatusTokenUsado === 1 ? 1 : undefined;

    await updateConvidadoEventoModel(convidadoId, eventoId, {
      token_usado: novoStatusTokenUsado,
      confirmado: novoStatusConfirmado
    });

    res.json({
      success: true,
      token_usado: novoStatusTokenUsado,
      message: `Presença ${novoStatusTokenUsado ? "marcada" : "desmarcada"} com sucesso`,
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

    const acompanhanteInfo = await new Promise((resolve, reject) => {
      conexao.query(
        "SELECT token_usado FROM acompanhante WHERE id = ?",
        [acompanhanteId],
        (err, results) => {
          if (err) {
            console.error("Erro ao buscar token_usado do acompanhante:", err);
            return reject(err);
          }
          resolve(results[0]);
        }
      );
    });

    if (!acompanhanteInfo) {
      return res.status(404).json({
        success: false,
        error: "Acompanhante não encontrado",
      });
    }

    const novoStatusTokenUsado = acompanhanteInfo.token_usado ? 0 : 1;
    const novoStatusConfirmado = novoStatusTokenUsado === 1 ? 1 : undefined;

    await updateAcompanhanteModel(acompanhanteId, {
      token_usado: novoStatusTokenUsado,
      confirmado: novoStatusConfirmado
    });

    res.json({
      success: true,
      token_usado: novoStatusTokenUsado,
      message: `Presença ${novoStatusTokenUsado ? "marcada" : "desmarcada"} com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao alternar presença do acompanhante:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

