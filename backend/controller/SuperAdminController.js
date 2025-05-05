import {
    cadastrarPlano,
    listarPlanos,
    liberarAdministrador,
    listarAdministradores,
    desativarAdministrador,
    listarEventosPorAdministrador,
    buscarAdministradorPorId
  } from "../model/SuperAdminModel.js";
  

  export async function cadastrarPlanoController(req, res) {
    const { nome, maxConvidados } = req.body;
  
    if (!nome || !maxConvidados) {
      return res.status(400).json({ message: "Nome e maxAcompanhantes são obrigatórios." });
    }
  
    try {
      const planoId = await cadastrarPlano(nome, maxConvidados);
      res.status(201).json({ id: planoId, message: "Plano cadastrado com sucesso!" });
    } catch (error) {
      console.error("Erro ao cadastrar plano:", error);
      res.status(500).json({ message: "Erro ao cadastrar plano." });
    }
  }
  

  export async function listarPlanosController(req, res) {
    try {
      const planos = await listarPlanos();
      res.status(200).json(planos);
    } catch (error) {
      console.error("Erro ao listar planos:", error);
      res.status(500).json({ message: "Erro ao listar planos." });
    }
  }
  

  export async function liberarAdministradorController(req, res) {
    const { nome, planoId } = req.body;
    try {
      const sucesso = await liberarAdministrador(nome, planoId);
      if (sucesso) {
        res.status(200).json({ message: "Administrador liberado com sucesso!" });
      } else {
        res.status(404).json({ message: "Administrador não encontrado." });
      }
    } catch (error) {
      console.error("Erro ao liberar administrador:", error);
      res.status(500).json({ message: "Erro ao liberar administrador." });
    }
  }
  
 
  export async function listarAdministradoresController(req, res) {
    try {
      const administradores = await listarAdministradores();
      res.status(200).json(administradores);
    } catch (error) {
      console.error("Erro ao listar administradores:", error);
      res.status(500).json({ message: "Erro ao listar administradores." });
    }
  }
  

  export async function desativarAdministradorController(req, res) {
    const { id } = req.params;
    try {
      const sucesso = await desativarAdministrador(id);
      if (sucesso) {
        res.status(200).json({ message: "Administrador desativado com sucesso!" });
      } else {
        res.status(404).json({ message: "Administrador não encontrado." });
      }
    } catch (error) {
      console.error("Erro ao desativar administrador:", error);
      res.status(500).json({ message: "Erro ao desativar administrador." });
    }
  }
  

  export async function listarEventosPorAdministradorController(req, res) {
    const { id } = req.params;
    try {
      const eventos = await listarEventosPorAdministrador(id);
      res.status(200).json(eventos);
    } catch (error) {
      console.error("Erro ao listar eventos:", error);
      res.status(500).json({ message: "Erro ao listar eventos." });
    }
  }

export async function buscarAdministradorPorIdController(req, res) {
  const { id } = req.params;

  try {
    const administrador = await buscarAdministradorPorId(id);
    if (administrador) {
      res.status(200).json(administrador);
    } else {
      res.status(404).json({ message: "Administrador não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao buscar administrador:", error);
    res.status(500).json({ message: "Erro ao buscar administrador." });
  }
}