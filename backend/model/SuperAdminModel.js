import banco from "../configuracao/banco.js"; // Configuração do banco de dados

// Cadastrar um novo plano
export function cadastrarPlano(nome, maxConvidados) {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO planos (nome, max_convidados) VALUES (?, ?)";
    banco.query(query, [nome, maxConvidados], (err, results) => {
      if (err) {
        console.error("Erro ao cadastrar plano:", err);
        return reject(err);
      }
      resolve(results.insertId);
    });
  });
}

// Listar todos os planos
export function listarPlanos() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM planos";
    banco.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}


export function liberarAdministrador(cpf, planoId) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE administradores SET plano_id = ?, ativo = 1 WHERE cpf = ?";
    banco.query(query, [planoId, cpf], (err, results) => {
      if (err) return reject(err);
      resolve(results.affectedRows > 0);
    });
  });
}

// Listar todos os administradores
export function listarAdministradores() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM administradores";
    banco.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Desativar um administrador
export function desativarAdministrador(id) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE administradores SET ativo = 0 WHERE id = ?";
    banco.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results.affectedRows > 0);
    });
  });
}

// Listar eventos criados por um administrador
export function listarEventosPorAdministrador(administradorId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM eventos WHERE administrador_id = ?";
    banco.query(query, [administradorId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
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
    banco.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

export function buscarAdministradorPorCpf(cpf) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM administradores WHERE cpf = ?";
    banco.query(query, [cpf], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}