import { 
  createConvidadoModel,
  getConvidadosModel,
  updateConvidadoModel,
  deleteConvidadoModel,
  createAcompanhanteModel,
  getAcompanhantesByConvidadoIdModel,
  deleteAcompanhanteModel,
  updateAcompanhanteModel,
  confirmarAcompanhantesModel,
  getConvidadoByIdModel,
  
} from "../model/convidado.js";

export async function createConvidado(req, res) {
  try {
    const { nome, telefone, email, limite_acompanhante, acompanhantes, evento_id } = req.body;
    
    const result = await createConvidadoModel({
      nome, 
      telefone, 
      email, 
      limite_acompanhante, 
      evento_id
    });

    if (acompanhantes?.length > 0) {
      await Promise.all(
        acompanhantes.map(a => 
          createAcompanhanteModel({ ...a, convidado_id: result.insertId })
        )
      );
    }

    res.status(201).json({ 
      success: true,
      message: "Convidado e acompanhantes cadastrados com sucesso",
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error("Erro ao criar convidado:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro interno ao processar solicitação"
    });
  }
}

export async function getAllConvidados(req, res) {
  try {
    const convidados = await getConvidadosModel();
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
    const result = await updateConvidadoModel(id, req.body);
    
    if (!result.affectedRows) {
      return res.status(404).json({ 
        success: false,
        error: "Convidado não encontrado" 
      });
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


export async function updateAcompanhanteById(req, res) {
  try {
    const { acompanhanteId } = req.params; // Mudou de 'id' para 'acompanhanteId'
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

export async function confirmarPresencaConvidado(req, res) {
  try {
    const { id } = req.params;
    const { confirmado } = req.body;
    
    const result = await updateConvidadoModel(id, { confirmado });
    
    if (!result.affectedRows) {
      return res.status(404).json({ 
        success: false,
        error: "Convidado não encontrado" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Presença do convidado confirmada com sucesso" 
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
    const { convidadoId } = req.params; // Alterado de 'id' para 'convidadoId'
    const { nome, telefone, email } = req.body;

   
    const convidado = await getConvidadoByIdModel(convidadoId);
    if (!convidado) {
      return res.status(404).json({ 
        success: false,
        error: "Convidado não encontrado" 
      });
    }

    // Verifica o limite de acompanhantes
    const acompanhantes = await getAcompanhantesByConvidadoIdModel(convidadoId);
    if (acompanhantes.length >= convidado.limite_acompanhante) {
      return res.status(400).json({ 
        success: false,
        error: `Limite de ${convidado.limite_acompanhante} acompanhantes atingido` 
      });
    }

    // Cria o acompanhante
    const result = await createAcompanhanteModel({
      nome,
      telefone: telefone || null,
      email: email || null,
      convidado_id: convidadoId,
      confirmado: true
    });

    if (result?.insertId){
      await updateAcompanhanteModel (result?.insertId, {
        nome,
        telefone: telefone || null,
        email: email || null,
        convidado_id: convidadoId,
        confirmado: 1
      })
    }

    res.status(201).json({ 
      success: true,
      message: "Acompanhante adicionado com sucesso",
      data: {
        id: result.insertId,
        nome,
        telefone,
        email,
        confirmado: true
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

// ÚNICA DECLARAÇÃO da função getConvidadoById
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
    
    if (!convidado.evento_id) {
      return res.status(400).json({
        success: false,
        error: "Convidado não está associado a nenhum evento"
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

export async function deleteAcompanhanteById(req, res) {
  try {
    const { id } = req.params; // Recebe apenas o ID do acompanhante
    
    // Validação básica do ID
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