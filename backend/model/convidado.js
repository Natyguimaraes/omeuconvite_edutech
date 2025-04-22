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
      "SELECT * FROM acompanhante WHERE convidado_id = ? AND ativo_acompanhante = 1",
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
// DISTINCT CONCAT(
//   '{',
//   '"id": ', acompanhante.id,
//   ', "convidado_id": ', acompanhante.convidado_id,
//   ', "nome": "', IFNULL(acompanhante.nome, ''), '"',
//   ', "telefone": "', IFNULL(acompanhante.telefone, ''), '"',
//   ', "email": "', IFNULL(acompanhante.email, ''), '"',
//   ', "confirmado": ', IFNULL(acompanhante.confirmado, ''),
//   ', "eventoId": "', IFNULL(acompanhante.evento_id, ''), '"',
//
//   '}'
// )
export async function getConvidadosModelOtimized() {
  return new Promise((resolve, reject) => {
    conexao.query(`
      SELECT id, nome, telefone, email,
        (
          SELECT
            CONCAT('[',
              GROUP_CONCAT(
                JSON_OBJECT('id', acompanhante.id, 'convidado_id', acompanhante.convidado_id, 'nome', IFNULL(acompanhante.nome, ''), 'telefone', IFNULL(acompanhante.telefone, ''), 'email', IFNULL(acompanhante.email, ''), 'confirmado', IFNULL(acompanhante.confirmado, ''), 'eventoId', IFNULL(acompanhante.evento_id, ''))
                    
                SEPARATOR ", ")
            ,"]")
          FROM acompanhante WHERE convidado_id = convidados.id AND ativo_acompanhante = 1
        ) AS acompanhantes,

        (
            SELECT
                CONCAT('[',
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '{',
                                '"id": ', e.id,
                                ', "administrador_id": "', IFNULL(e.administrador_id, ''), '"',
                                ', "ativo": "', IFNULL(e.ativo, ''), '"',
                                ', "limite_acompanhante": ', IFNULL(ce.limite_acompanhante, ''),
                                ', "confirmado": ', IFNULL(ce.confirmado, ''),
                            '}'
                        )
                    )
                ,']')
            FROM eventos e
            JOIN convidado_evento ce ON e.id = ce.evento_id
            WHERE ce.convidado_id = convidados.id
        ) AS eventos

        FROM convidados;
      `,
      async (err, convidados) => {
        if (err) return reject(err);
        console.log(convidados);

        try {
          const convidadosCompleto = await Promise.all(
            convidados.map(async c => {
              return {
                ...c,
                acompanhantes: JSON.parse(c.acompanhantes || "[]"),
                eventos: JSON.parse(c.eventos || "[]"),
              }
            })
          );
          resolve(convidadosCompleto);
        } catch (error) {
          console.error(error);
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
    const { nome, telefone, email, convidado_id, evento_id } = dados;
    conexao.query(
      "INSERT INTO acompanhante SET ?",
      { nome, telefone, email, convidado_id, confirmado: 1, evento_id },
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
      "UPDATE acompanhante SET ativo_acompanhante = 0 WHERE id = ?",
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
    const camposPermitidos = ['nome', 'telefone', 'email', 'confirmado', 'evento_id'];
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

export function inativaAcompanhanteModel(id) {
  return new Promise((resolve, reject) => {

    conexao.query(
      "UPDATE acompanhante SET ? WHERE convidado_id = ?",
      [{confirmado: 2}, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export async function getConvidadoByTokenModel(token) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT * FROM convidados WHERE token = ?",
      [token],
      async (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);

        const convidado = results[0];
        try {
          const [acompanhantes, eventos] = await Promise.all([
            getAcompanhantesByConvidadoIdModel(convidado.id),
            getEventosByConvidadoId(convidado.id)
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

//presença
export function confirmarPresencaPorTokenModel(token) {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT * FROM convidado_evento WHERE token = ?", [token], (err, convidado) => {
      if (err) return reject(err);

      if (convidado.length > 0) {
        conexao.query("UPDATE convidados SET presenca = 1 WHERE token = ?", [token], (errUpdate) => {
          if (errUpdate) return reject(errUpdate);
          return resolve({ tipo: 'convidado', nome: convidado[0].nome });
        });
      } else {
        conexao.query("SELECT * FROM acompanhante WHERE token = ?", [token], (err2, acompanhante) => {
          if (err2) return reject(err2);

          if (acompanhante.length > 0) {
            conexao.query("UPDATE acompanhante SET presenca = 1 WHERE token = ?", [token], (errUpdate2) => {
              if (errUpdate2) return reject(errUpdate2);
              return resolve({ tipo: 'acompanhante', nome: acompanhante[0].nome });
            });
          } else {
            return resolve(null);
          }
        });
      }
    });
  });
}

export function salvarTokenConvidado(convidadoId, token) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "UPDATE convidado_evento SET token = ? WHERE convidado_id = ?",
      [token, convidadoId],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
}


export function salvarTokenAcompanhante(acompanhanteId, token) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "UPDATE acompanhante SET token = ? WHERE id = ?",
      [token, acompanhanteId],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
}