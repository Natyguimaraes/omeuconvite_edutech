import conexao from "../configuracao/banco.js";

// Funções auxiliares
export async function getEventosByConvidadoId(convidado_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT e.*, ce.limite_acompanhante, ce.confirmado FROM eventos e " +
      "JOIN convidado_evento ce ON e.id = ce.evento_id " +
      "WHERE ce.convidado_id = ?",
      [convidado_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export async function getAcompanhantesByConvidadoIdModel(convidado_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT * FROM acompanhante WHERE convidado_id = ?",
      [convidado_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

// Modelos principais
export async function getConvidadosModel() {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT id, nome, telefone, email FROM convidados", 
    async (err, convidados) => {
      if (err) return reject(err);
      
      try {
        const convidadosCompleto = await Promise.all(
          convidados.map(async c => ({
            ...c,
            acompanhantes: await getAcompanhantesByConvidadoIdModel(c.id),
            eventos: await getEventosByConvidadoId(c.id)
          }))
        );
        resolve(convidadosCompleto);
      } catch (error) {
        reject(error);
      }
    });
  });
}
// Modelo atualizado para getConvidadoById
export async function getConvidadoByIdModel(id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT id, nome, telefone, email FROM convidados WHERE id = ?", 
      [id],
      async (err, results) => {
        if (err) return reject(err);
        
        if (results.length === 0) return resolve(null);

        try {
          const convidado = results[0];
          const [acompanhantes, eventos] = await Promise.all([
            getAcompanhantesByConvidadoIdModel(id),
            getEventosByConvidadoId(id)
          ]);
          
          resolve({
            ...convidado,
            acompanhantes,
            eventos
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}
// createConvidadoModel - SEM limite
export async function createConvidadoModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, limite_acompanhante = 0 } = dados;
    
    conexao.query(
      "INSERT INTO convidados SET ?", 
      { nome, telefone, email, limite_acompanhante },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

// addConvidadoToEventoModel - COM limite
// Model correto
export async function addConvidadoToEventoModel(convidado_id, evento_id, limite_acompanhante = 0, confirmado = 0) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "INSERT INTO convidado_evento SET ?",
      { convidado_id, evento_id, limite_acompanhante, confirmado },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function updateConvidadoModel(id, novosDados) {
  return new Promise((resolve, reject) => {
    const camposPermitidos = ['nome', 'telefone', 'email'];
    const dadosAtualizacao = {};
    
    camposPermitidos.forEach(campo => {
      if (novosDados[campo] !== undefined) {
        dadosAtualizacao[campo] = novosDados[campo];
      }
    });

    conexao.query(
      "UPDATE convidados SET ? WHERE id = ?",
      [dadosAtualizacao, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function updateConvidadoEventoModel(convidado_id, evento_id, novosDados) {
  return new Promise((resolve, reject) => {
    const camposPermitidos = ['limite_acompanhante', 'confirmado'];
    const dadosAtualizacao = {};
    
    camposPermitidos.forEach(campo => {
      if (novosDados[campo] !== undefined) {
        dadosAtualizacao[campo] = novosDados[campo];
      }
    });

    conexao.query(
      "UPDATE convidado_evento SET ? WHERE convidado_id = ? AND evento_id = ?",
      [dadosAtualizacao, convidado_id, evento_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function deleteConvidadoModel(id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "DELETE FROM convidados WHERE id = ?",
      [id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function removeConvidadoFromEventoModel(convidado_id, evento_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "DELETE FROM convidado_evento WHERE convidado_id = ? AND evento_id = ?",
      [convidado_id, evento_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

// Funções para acompanhantes (permanecem as mesmas)
export function createAcompanhanteModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, convidado_id } = dados;
    conexao.query(
      "INSERT INTO acompanhante SET ?",
      { nome, telefone, email, convidado_id, confirmado: 1 },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function deleteAcompanhanteModel(id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "DELETE FROM acompanhante WHERE id = ?",
      [id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function updateAcompanhanteModel(id, novosDados) {
  return new Promise((resolve, reject) => {
    const camposPermitidos = ['nome', 'telefone', 'email', 'confirmado'];
    const dadosAtualizacao = {};
    
    camposPermitidos.forEach(campo => {
      if (novosDados[campo] !== undefined) {
        dadosAtualizacao[campo] = novosDados[campo];
      }
    });

    conexao.query(
      "UPDATE acompanhante SET ? WHERE id = ?",
      [dadosAtualizacao, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function confirmarAcompanhantesModel(convidadoId, idsAcompanhantes) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "UPDATE acompanhante SET confirmado = 1 WHERE id IN (?) AND convidado_id = ?",
      [idsAcompanhantes, convidadoId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function removeConvidadoFromAllEventosModel(convidadoId) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "DELETE FROM convidado_evento WHERE convidado_id = ?",
      [convidadoId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

