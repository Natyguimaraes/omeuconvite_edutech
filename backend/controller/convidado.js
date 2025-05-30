import {
  createConvidadoModel,
  updateConvidadoModel,
  deleteConvidadoModel,
  createAcompanhanteModel,
  getAcompanhantesByConvidadoIdModel,
  deleteAcompanhanteModel,
  updateAcompanhanteModel,
  confirmarAcompanhantesModel,
  getConvidadoByIdModel,
  addConvidadoToEventoModel,
  updateConvidadoEventoModel,
  removeConvidadoFromEventoModel,
  removeConvidadoFromAllEventosModel, inativaAcompanhanteModel, getConvidadosModelOtimized,
  getConvidadoByTokenModel,
  confirmarPresencaPorTokenModel
} from "../model/convidado.js";
import conexao from '../configuracao/banco.js'

export async function createConvidado(req, res) {
  try {
    const { nome, telefone, email, limite_padrao, eventos, acompanhantes } = req.body;
    
    // 1. Cria o convidado com limite padrão
    const result = await createConvidadoModel({
      nome, 
      telefone, 
      email,
      limite_acompanhante: limite_padrao || 0
    });

    const convidadoId = result.insertId;

    // 2. Associa a eventos usando o limite padrão ou sobrescrevendo
    if (eventos?.length > 0) {
      await Promise.all(
        eventos.map(evento => 
          addConvidadoToEventoModel(
            convidadoId, 
            evento.id, 
            evento.limite_acompanhante || limite_padrao || 0,
            evento.confirmado
          )
        )
      );
    }

    // 3. Adiciona acompanhantes
    if (acompanhantes?.length > 0) {
      await Promise.all(
        acompanhantes.map(a => 
          createAcompanhanteModel({ ...a, convidado_id: convidadoId })
        )
      );
    }

    res.status(201).json({ 
      success: true,
      data: { 
        id: convidadoId,
        limite_padrao: limite_padrao || 0
      }
    });
  } catch (error) {
    console.error("Erro ao criar convidado:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
export async function getAllConvidados(req, res) {
  try {
    console.log()
    // const convidados = await getConvidadosModel();
    const convidados = await getConvidadosModelOtimized();
    res.json({
      success: true,
      data: convidados 
    });
  } catch (err) {
    console.error("Erro ao buscar convidados:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao buscar convidados"
    });
  }
}

export async function updateConvidado(req, res) {
  try {
    const { id } = req.params;
    const { eventos, ...dadosConvidado } = req.body;
    
    // Atualiza dados básicos do convidado
    const result = await updateConvidadoModel(id, dadosConvidado);
    
    if (!result.affectedRows) {
      return res.status(404).json({ 
        success: false,
        error: "Convidado não encontrado" 
      });
    }
    
    // Se houver eventos para atualizar
    if (eventos) {
      // Primeiro remove todas as associações existentes
      await removeConvidadoFromAllEventosModel(id);
      
      // Depois adiciona as novas associações
      await Promise.all(
        eventos.map(evento => 
          addConvidadoToEventoModel(id, evento.id, {
            limite_acompanhante: evento.limite_acompanhante,
            confirmado: evento.confirmado
          })
        )
      );
    }
    
    res.json({ 
      success: true,
      message: "Convidado atualizado com sucesso" 
    });
  } catch (err) {
    console.error("Erro ao atualizar convidado:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao atualizar convidado"
    });
  }
}

export async function deleteConvidadoById(req, res) {
  try {
    const { id } = req.params;
    
    // Remove todas as associações com eventos primeiro
    await removeConvidadoFromAllEventosModel(id);
    
    // Depois remove o convidado
    const result = await deleteConvidadoModel(id);
    
    if (!result.affectedRows) {
      return res.status(404).json({ 
        success: false,
        error: "Convidado não encontrado" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Convidado removido com sucesso" 
    });
  } catch (err) {
    console.error("Erro ao remover convidado:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao remover convidado"
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
        error: "Convidado não encontrado" 
      });
    }
    
    res.json({ 
      success: true,
      data: convidado 
    });
  } catch (err) {
    console.error("Erro ao buscar convidado:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao buscar convidado" 
    });
  }
}

// Corrigindo addConvidadoToEvento
// Certifique-se que a função existe e está exportada
export async function addConvidadoToEvento(req, res) {
  try {
    const { convidadoId, eventoId } = req.params;
    const { limite_acompanhante, confirmado } = req.body;

    const result = await addConvidadoToEventoModel(
      convidadoId, 
      eventoId, 
      limite_acompanhante, // valor direto, não objeto
      confirmado // valor direto, não objeto
    );

    res.status(201).json({
      success: true,
      message: "Convidado associado ao evento com sucesso",
      data: result
    });
  } catch (err) {
    console.error("Erro ao associar convidado ao evento:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao associar convidado ao evento"
    });
  }
}

export async function updateConvidadoEvento(req, res) {
  try {
    const { convidadoId, eventoId } = req.params;
    const { limite_acompanhante, confirmado } = req.body;

    const result = await updateConvidadoEventoModel(
      convidadoId,
      eventoId,
      { limite_acompanhante, confirmado }
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: "Relação convidado-evento não encontrada"
      });
    }

    res.json({
      success: true,
      message: "Relação convidado-evento atualizada com sucesso"
    });
  } catch (err) {
    console.error("Erro ao atualizar relação convidado-evento:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar relação convidado-evento"
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
        error: "Relação convidado-evento não encontrada"
      });
    }

    res.json({
      success: true,
      message: "Convidado removido do evento com sucesso"
    });
  } catch (err) {
    console.error("Erro ao remover convidado do evento:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao remover convidado do evento"
    });
  }
}

export async function confirmarPresencaConvidado(req, res) {
  try {
    const { convidadoId, eventoId } = req.params;
    const { confirmado } = req.body;
    
    // Primeiro busca o convidado para pegar o limite
    const convidado = await getConvidadoByIdModel(convidadoId);
    if (!convidado) {
      return res.status(404).json({ 
        success: false,
        error: "Convidado não encontrado" 
      });
    }
    
    // Atualiza a confirmação na tabela de relação
    const result = await updateConvidadoEventoModel(
      convidadoId, 
      eventoId, 
      { 
        confirmado,
        // Mantém o limite existente ou usa o do convidado
        limite_acompanhante: convidado.limite_acompanhante 
      }
    );

    if (confirmado == 2) {
      await inativaAcompanhanteByIdConvidado(convidadoId)
    }
    
    if (!result.affectedRows) {
      return res.status(404).json({ 
        success: false,
        error: "Relação convidado-evento não encontrada" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Presença do convidado confirmada com sucesso",
      data: {
        limite_acompanhante: convidado.limite_acompanhante
      }
    });
  } catch (err) {
    console.error("Erro ao confirmar presença do convidado:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao confirmar presença do convidado" 
    });
  }
}
export async function createAcompanhante(req, res) {
  try {
    const { convidadoId } = req.params;
       const { nome, telefone, email, eventoId, confirmado } = req.body; // <-- Adicionado 'confirmado' para receber do frontend

    console.log("Dados do acompanhante (params):", req.params);
    console.log("Dados do acompanhante (body):", req.body);

    // Verifica se o convidado existe
    const convidado = await getConvidadoByIdModel(convidadoId);
    if (!convidado) {
      return res.status(404).json({
        success: false,
        error: "Convidado não encontrado"
      });
    }

    // Verifica o limite de acompanhantes para cada evento
    // Sugestão: Acompanhantes já buscados pelo model retornam o evento_id. Use isso.
    const acompanhantesExistentes = (await getAcompanhantesByConvidadoIdModel(convidadoId))
      .filter(a => String(a.evento_id) === String(eventoId));

    const limiteAcompanhanteDoEvento = convidado.eventos?.find(e => String(e.id) === String(eventoId))?.limite_acompanhante || 0;

    console.log("convidado", convidado)
    console.log("acompanhantes Existentes (filtrados pelo evento):", acompanhantesExistentes)
    console.log("Limite de acompanhantes para este evento:", limiteAcompanhanteDoEvento)


    if (acompanhantesExistentes.length >= limiteAcompanhanteDoEvento) {
      return res.status(400).json({
        success: false,
        error: `Limite de ${limiteAcompanhanteDoEvento} acompanhantes atingido para o evento.`
      });
    }

    // Cria o acompanhante
    const result = await createAcompanhanteModel({
      nome,
      telefone: telefone || null,
      email: email || null,
      convidado_id: convidadoId,
      confirmado: confirmado, // <-- AGORA PASSA O VALOR RECEBIDO DO FRONTEND (0 ou 1)
      evento_id: eventoId
    });
    console.log("Resultado da criação do acompanhante:", result)

    res.status(201).json({
      success: true,
      message: "Acompanhante adicionado com sucesso",
      data: {
        id: result.insertId,
        nome,
        telefone,
        email,
        confirmado: confirmado, // <-- E RETORNA ESSE MESMO VALOR NA RESPOSTA
        evento_id: eventoId
      }
    });
  } catch (err) {
    console.error("Erro ao criar acompanhante:", err);
    res.status(500).json({
      success: false,
      error: "Erro interno ao processar solicitação"
    });
  }
}

export async function getAcompanhantesByConvidadoId(req, res) {
  try {
    const { convidadoId } = req.params;
    
    const acompanhantes = await getAcompanhantesByConvidadoIdModel(convidadoId);
    
    res.json({
      success: true,
      data: acompanhantes
    });
  } catch (err) {
    console.error("Erro ao buscar acompanhantes:", err);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar acompanhantes do convidado"
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
        error: "Acompanhante não encontrado" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Acompanhante atualizado com sucesso" 
    });
  } catch (err) {
    console.error("Erro ao atualizar acompanhante:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao atualizar acompanhante"
    });
  }
}

export async function confirmarAcompanhantes(req, res) {
  try {
    const { convidadoId } = req.params;
    const { acompanhantes } = req.body;

    if (!Array.isArray(acompanhantes)) {
      return res.status(400).json({ 
        success: false,
        error: "Lista de acompanhantes inválida" 
      });
    }

    const ids = acompanhantes
      .filter(a => a?.id && a.confirmado)
      .map(a => a.id);

    if (!ids.length) {
      return res.json({ 
        success: true,
        message: "Nenhum acompanhante válido para confirmar",
        data: { confirmados: 0 }
      });
    }

    const result = await confirmarAcompanhantesModel(convidadoId, ids);
    
    res.json({
      success: true,
      message: `${result.affectedRows} acompanhante(s) confirmado(s)`,
      data: { confirmados: result.affectedRows }
    });
  } catch (error) {
    console.error("Erro ao confirmar acompanhantes:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro ao confirmar acompanhantes"
    });
  }
}

export async function deleteAcompanhanteById(req, res) {
  try {
    const { id } = req.params;
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "ID do acompanhante inválido" 
      });
    }

    const result = await deleteAcompanhanteModel(id);
    
    if (!result.affectedRows) {
      return res.status(404).json({ 
        success: false,
        error: "Acompanhante não encontrado" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Acompanhante removido com sucesso" 
    });
  } catch (err) {
    console.error("Erro ao remover acompanhante:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao remover acompanhante"
    });
  }
}

export async function inativaAcompanhanteByIdConvidado(convidadoId) {
  try {
    await inativaAcompanhanteModel(convidadoId);
  } catch (err) {
    console.error("Erro ao atualizar acompanhante:", err);
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
    // Verifica se é um convidado
    const [convidadoResult] = await conexao.promise().query(
      `SELECT ce.*, c.nome 
       FROM convidado_evento ce
       JOIN convidados c ON ce.convidado_id = c.id
       WHERE ce.token = ?`,
      [token]
    );

    if (convidadoResult.length > 0) {
      if (convidadoResult[0].token_usado === 1) {
        return res.status(409).json({ mensagem: "Essa credencial já foi lida"})
      }

      await conexao.promise().query(
        "UPDATE convidado_evento SET token_usado = 1 WHERE token = ?",
        [token]
      );

      return res.json({
        tipo: "convidado",
        nome: convidadoResult[0].nome,
        mensagem: `🎉 Convidado ${convidadoResult[0].nome} presente na festa!`,
      });
    }

    // Verifica se é um acompanhante
    const [acompanhanteResult] = await conexao.promise().query(
      "SELECT * FROM acompanhante WHERE token = ?",
      [token]
    );

    if (acompanhanteResult.length > 0) {
      if (acompanhanteResult[0].token_usado === 1) {
        return res.status(409).json({ mensagem: "Essa credencial já foi lida"})
      }
      await conexao.promise().query(
        "UPDATE acompanhante SET token_usado = 1 WHERE token = ?",
        [token]
      );

      return res.json({
        tipo: "acompanhante",
        nome: acompanhanteResult[0].nome,
        mensagem: `🎉 Acompanhante ${acompanhanteResult[0].nome} presente na festa!`,
      });
    }

    return res.status(404).json({ mensagem: "Token inválido ou não encontrado." });
  } catch (error) {
    console.error("Erro ao confirmar presença por token:", error);
    return res.status(500).json({ mensagem: "Erro interno ao confirmar presença." });
  }
}

// Adicione estas funções ao seu controller

export const togglePresencaConvidado = async (req, res) => {
  try {
    const { convidadoId, eventoId } = req.params;
    
    // 1. Verifica o status atual
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
        error: 'Relação convidado-evento não encontrada' 
      });
    }

    // 2. Alterna o status
    const novoStatus = convidadoEvento.token_usado ? 0 : 1;
    
    await new Promise((resolve, reject) => {
      conexao.query(
        "UPDATE convidado_evento SET token_usado = ? WHERE convidado_id = ? AND evento_id = ?",
        [novoStatus, convidadoId, eventoId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    res.json({ 
      success: true,
      token_usado: novoStatus,
      message: `Presença ${novoStatus ? 'marcada' : 'desmarcada'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alternar presença:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const togglePresencaAcompanhante = async (req, res) => {
  try {
    const { acompanhanteId } = req.params;
    
    // 1. Verifica o status atual
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
        error: 'Acompanhante não encontrado' 
      });
    }

    // 2. Alterna o status
    const novoStatus = acompanhante.token_usado ? 0 : 1;
    
    await new Promise((resolve, reject) => {
      conexao.query(
        "UPDATE acompanhante SET token_usado = ? WHERE id = ?",
        [novoStatus, acompanhanteId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    res.json({ 
      success: true,
      token_usado: novoStatus,
      message: `Presença ${novoStatus ? 'marcada' : 'desmarcada'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alternar presença do acompanhante:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};