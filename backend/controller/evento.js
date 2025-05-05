import cloudinary from '../config/cloudinary.js';
import {
  createEvento,
  readEventos,
  updateEvento,
  deleteEvento,
  getEventoByIdModel,
} from "../model/evento.js";

import { Buffer } from 'buffer';

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

  console.log('Dados recebidos no body:', req.body);
  console.log('Arquivo recebido:', req.file);
  
  const { nome, descricao, data_evento, data_gerar_qrcode, local, mensagem_whatsapp, tipo, administrador_id } = req.body;

  if (!nome || !descricao || !data_evento ||!data_gerar_qrcode || !local ||!mensagem_whatsapp || !tipo ) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    let imagem_evento = null;

    if (req.file) {
      // Validação adicional do tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Tipo de arquivo não suportado." });
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      // Usar parte do nome do evento no public_id (removendo caracteres especiais)
      const cleanName = nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const publicId = `evento_${cleanName}_${Date.now()}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "eventos",
        public_id: publicId,
        resource_type: "auto",
      });
      
      imagem_evento = {
        url: result.secure_url,
        public_id: result.public_id // Armazenar o public_id para possível exclusão futura
      };
    }

    const result = await createEvento(
      imagem_evento ? imagem_evento.url : null, // Armazena apenas a URL no banco
      nome, 
      descricao, 
      data_evento, 
      data_gerar_qrcode,
      local, 
      mensagem_whatsapp,
      tipo, 
      administrador_id
    );
    
    res.status(201).json({ 
      message: "Evento cadastrado com sucesso!", 
      data: result 
    });
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
    // Verifica se o evento existe
    const evento = await getEventoByIdModel(id);
    
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado para inativação." });
    }

    // Inativa o evento (ativo = 0) ao invés de deletar
    const result = await deleteEvento(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Evento não encontrado para inativação." });
    }
    
    res.status(200).json({ message: "Evento inativado com sucesso" });
  } catch (err) {
    console.error("Erro ao inativar evento:", err);
    res.status(500).json({ error: "Erro interno ao inativar evento." });
  }
}


export async function getEventoById(req, res) {
  try {
    const { id } = req.params;
    const evento = await getEventoByIdModel(id); // Use a nova função específica
    
    if (!evento) {
      return res.status(404).json({ 
        success: false,
        error: "Evento não encontrado" 
      });
    }
    
    res.json({ 
      success: true,
      data: evento 
    });
  } catch (err) {
    console.error("Erro ao buscar evento:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro ao buscar evento" 
    });
  }
}