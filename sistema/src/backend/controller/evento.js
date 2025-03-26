import {
  createEvento,
  readEventos,
  updateEvento,
  deleteEvento,
} from "../model/evento.js";

export async function getAllEventos(req, res) {
  try {
    const eventos = await readEventos();
    res.status(200).json(eventos);
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).json({ error: "Erro interno ao buscar eventos." });
  }
}

export async function createEventoController(req, res) {
  const { nome, descricao, data_evento, local, administrador_id } = req.body;
  const imagem_evento = req.file ? req.file.path : null; // Caminho da imagem salva

  if (!imagem_evento ||!nome || !descricao || !data_evento || !local ) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const result = await createEvento(imagem_evento, nome, descricao, data_evento, local, administrador_id);
    res.status(201).json({ message: "Evento cadastrado com sucesso!", data: result });
  } catch (err) {
    console.error("Erro ao cadastrar evento:", err);
    res.status(500).json({ error: "Erro ao cadastrar evento." });
  }
}

export async function updateEventoController(req, res) {
  const { id } = req.params;
  const novosDados = req.body;

  try {
    const result = await updateEvento(id, novosDados);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum evento encontrado para atualizar." });
    }
    res.status(200).json({ message: "Evento atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    res.status(500).json({ error: "Erro interno ao atualizar evento." });
  }
}

export async function deleteEventoController(req, res) {
  const { id } = req.params;

  try {
    const result = await deleteEvento(id);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Evento não encontrado para exclusão." });
    }
    res.status(200).json({ message: "Evento excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir evento:", err);
    res.status(500).json({ error: "Erro interno ao excluir evento." });
  }
}


