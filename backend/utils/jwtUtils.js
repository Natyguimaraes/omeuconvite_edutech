import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET //|| 'segredo_super_secreto_123';
const JWT_EXPIRES_IN = '30d'; // Tokens expiram em 30 dias

export function gerarTokenCredencial(dados) {
  return jwt.sign(
    {
      ...dados,
      tipo: 'credencial_evento'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verificarToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return null;
  }
}