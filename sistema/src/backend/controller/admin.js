import { gerarToken } from "../auth.js";
import { findByCpfAndSenha, createAdmin } from "../model/administrador.js";

export async function loginAdmin(req, res) {
  const { cpf, senha } = req.body;

  if (!cpf || !senha) {
    return res.status(400).json({ message: "CPF e senha são obrigatórios" });
  }

  try {
    const admin = await findByCpfAndSenha(cpf, senha);
    if (!admin) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    if (admin.ativo !== 1) {
      return res.status(403).json({ message: "Administrador não liberado ou desativado" });
    }

    // Gera um token JWT com o ID do administrador
    const token = gerarToken(admin.id);

    // Para evitar de enviar a senha do administrador na resposta
    const { senha: _, ...adminData } = admin;

    
    res.status(200).json({ 
      message: "Login realizado com sucesso", 
      admin: { ...adminData, id: admin.id }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor", error });
  }
}
export async function registerAdmin(req, res) {
  const { nome, cpf, senha, plano_id } = req.body;

  if (!nome || !cpf || !senha) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  try {
    const result = await createAdmin(nome, cpf, senha, plano_id || 1);
    res.status(201).json({
      message: "Administrador cadastrado com sucesso",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao cadastrar administrador", error });
  }
}

import { buscarAdministradorPorId } from "../model/administrador.js";

export async function buscarAdministradorLogado(req, res) {
  const adminId = req.adminId; // ID do administrador logado (obtido do middleware)

  try {
    const administrador = await buscarAdministradorPorId(adminId);
    if (administrador) {
      res.status(200).json(administrador);
    } else {
      res.status(404).json({ message: "Administrador não encontrado." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar administrador.", error });
  }
}