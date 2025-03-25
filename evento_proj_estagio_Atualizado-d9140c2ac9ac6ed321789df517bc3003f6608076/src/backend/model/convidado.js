import conexao from "../configuracao/banco.js";

export function read() {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT * FROM convidados", (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}


export function create(nome, telefone, email, evento_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "INSERT INTO convidados (nome, telefone, email, evento_id) VALUES (?, ?, ?, ?)",
      [nome, telefone, email, evento_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function createAcompanhante(nome, telefone, email, convidado_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "INSERT INTO acompanhante (nome, telefone, email, convidado_id) VALUES (?, ?, ?, ?)",
      [nome, telefone, email, convidado_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function update(id, novosDados) {
  return new Promise((resolve, reject) => {
    conexao.query("UPDATE convidados SET ? WHERE id = ?", [novosDados, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function deleteConvidado(id) {
  return new Promise((resolve, reject) => {
    conexao.query("DELETE FROM convidados WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function getAcompanhantesByConvidadoId(convidado_id) {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT * FROM acompanhante WHERE convidado_id = ?", [convidado_id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function deleteAcompanhante(id) {
  return new Promise((resolve, reject) => {
    conexao.query("DELETE FROM acompanhante WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function updateAcompanhante(id, novosDados) {
  return new Promise((resolve, reject) => {
    conexao.query("UPDATE acompanhante SET ? WHERE id = ?", [novosDados, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}


