import conexao from "../configuracao/banco.js";

export function read() {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT * FROM convidados", (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}


export function create(nome, telefone, email, limite_acompanhante, evento_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "INSERT INTO convidados (nome, telefone, email, limite_acompanhante, evento_id) VALUES (?, ?, ?, ?, ?)",
      [nome, telefone, email, limite_acompanhante, evento_id],
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
      "INSERT INTO acompanhante (nome, telefone, email, convidado_id, confirmado) VALUES (?, ?, ?, ?, ?)",
      [nome, telefone, email, convidado_id, 0], 
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

export function confirmarAcompanhantesModel(convidadoId, idsAcompanhantes) {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE acompanhante
      SET confirmado = 1 
      WHERE id IN (?)
      AND convidado_id = ?
    `;
    
    console.log('Executando query:', query, idsAcompanhantes, convidadoId);
    
    conexao.query(query, [idsAcompanhantes, convidadoId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}