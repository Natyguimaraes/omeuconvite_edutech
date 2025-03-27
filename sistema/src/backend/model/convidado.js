import conexao from "../configuracao/banco.js";

export async function getConvidadosModel() {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT id, nome, telefone, email, limite_acompanhante, evento_id, confirmado FROM convidados", 
    async (err, convidados) => {
      if (err) return reject(err);
      
      try {
        const convidadosComAcompanhantes = await Promise.all(
          convidados.map(async c => ({
            ...c,
            acompanhantes: await getAcompanhantesByConvidadoIdModel(c.id),
            // Garanta que evento_id está presente
            evento_id: c.evento_id || null
          }))
        );
        resolve(convidadosComAcompanhantes);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function getConvidadoByIdModel(id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT id, nome, telefone, email, limite_acompanhante, evento_id, confirmado FROM convidados WHERE id = ?", 
      [id],
      async (err, results) => {
        if (err) return reject(err);
        
        if (results.length === 0) {
          return resolve(null);
        }

        try {
          const convidado = results[0];
          const acompanhantes = await getAcompanhantesByConvidadoIdModel(id);
          
          resolve({
            ...convidado,
            acompanhantes,
            evento_id: convidado.evento_id || null
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}
export function createConvidadoModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, limite_acompanhante, evento_id } = dados;
    conexao.query(
      "INSERT INTO convidados SET ?", 
      { nome, telefone, email, limite_acompanhante, evento_id },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function createAcompanhanteModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, convidado_id } = dados;
    conexao.query(
      "INSERT INTO acompanhante SET ?",
      { nome, telefone, email, convidado_id, confirmado: 0 },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function updateConvidadoModel(id, novosDados) {
  return new Promise((resolve, reject) => {
    const camposPermitidos = ['nome', 'telefone', 'email', 'limite_acompanhante', 'confirmado'];
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

export function getAcompanhantesByConvidadoIdModel(convidado_id) {
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



// Model para exclusão
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