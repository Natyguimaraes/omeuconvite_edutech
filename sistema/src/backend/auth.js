import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET_KEY = "secret"; // Substitua por uma chave segura

// Função para gerar um token JWT
export function gerarToken(adminId) {
  return jwt.sign({ id: adminId }, SECRET_KEY, { expiresIn: "1h" }); // Token expira em 1 hora
}

// Função para verificar um token JWT
export function verificarToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return null; // Token inválido ou expirado
  }
}

// Função para criptografar a senha
export async function criptografarSenha(senha) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(senha, salt);
}

// Função para comparar a senha com o hash
export async function compararSenha(senha, hash) {
  return await bcrypt.compare(senha, hash);
}