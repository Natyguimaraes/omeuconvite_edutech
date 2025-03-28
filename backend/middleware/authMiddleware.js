import { verificarToken } from "../auth.js";

export function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Extrai o token do header

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const decoded = verificarToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }

  req.adminId = decoded.id; // Adiciona o ID do administrador à requisição
  next();
}