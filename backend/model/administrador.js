import bcrypt from "bcrypt";
import conexao from "../configuracao/banco.js";

export function findByCpfAndSenha(nome, senha) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT * FROM administradores WHERE nome = ? AND ativo = 1", 
      [nome],
      async (err, results) => {
        if (err) return reject(err);
        
        if (results.length === 0) {
          return resolve(null); 
        }

        const administrador = results[0];
        console.log("Administrador encontrado:", administrador); // Log para depuração

        const isMatch = await bcrypt.compare(senha, administrador.senha);
        if (!isMatch) {
          return resolve(null); 
        }

        resolve(administrador); 
      }
    );
  });
}

export function createAdmin(nome, cpf, senha) {
  return new Promise((resolve, reject) => {
    // Criptografando a senha
    bcrypt.hash(senha, 10, (err, hashedPassword) => {
      if (err) return reject(err);

      conexao.query(
        "INSERT INTO administradores (nome, cpf, senha) VALUES (?, ?, ?)",
        [nome, cpf, hashedPassword],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  });
}


export function liberarAcesso(nome, planoId) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "UPDATE administradores SET liberado = TRUE, plano_id = ? WHERE nome = ?",
      [planoId, nome],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function buscarAdministradorPorId(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT administradores.*, planos.nome as plano_nome 
      FROM administradores 
      LEFT JOIN planos ON administradores.plano_id = planos.id 
      WHERE administradores.id = ?
    `;
    conexao.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}
