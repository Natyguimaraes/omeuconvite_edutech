import { create, getAcompanhantesByConvidadoId, read, update, deleteConvidado, createAcompanhante, deleteAcompanhante, updateAcompanhante } from "../model/convidado.js";

export async function createConvidado(req, res) {
  const { nome, telefone, email, acompanhantes, evento_id } = req.body;

  try {
    const result = await create(nome, telefone, email, evento_id);
    const convidadoId = result.insertId;

    if (acompanhantes && acompanhantes.length > 0) {
      for (const a of acompanhantes) {
        await createAcompanhante(a.nome, a.telefone, a.email, convidadoId);
      }
    }

    res.status(201).json({ mensagem: "Convidado e acompanhantes cadastrados com sucesso" });
  } catch (err) {
    console.error("Erro ao adicionar convidado:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function getAllConvidados(req, res) {
  try {
    const convidados = await read();

    // Buscar acompanhantes para cada convidado e adicionar ao convidado
    for (const convidado of convidados) {
      const acompanhantes = await getAcompanhantesByConvidadoId(convidado.id);
      convidado.acompanhantes = acompanhantes; // Armazenar acompanhantes completos
    }

    res.json(convidados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function updateConvidado(req, res) {
  const { id } = req.params;
  const novosDados = req.body;

  try {
    const result = await update(id, novosDados);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nenhum convidado encontrado para atualizar." });
    }
    res.status(200).json({ message: "Convidado atualizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteConvidadoById(req, res) {
  const { id } = req.params;
  try {
    const result = await deleteConvidado(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Convidado não encontrado para exclusão." });
    }
    res.status(200).json({ message: "Convidado excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAcompanhanteById(req, res) {
  const { id } = req.params;

  try {
    const result = await deleteAcompanhante(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Acompanhante não encontrado para exclusão." });
    }
    res.status(200).json({ message: "Acompanhante excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir acompanhante:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function updateAcompanhanteById(req, res) {
  const { id } = req.params;
  const novosDados = req.body;

  try {
    const result = await updateAcompanhante(id, novosDados);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Acompanhante não encontrado para atualização." });
    }
    res.status(200).json({ message: "Acompanhante atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar acompanhante:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

