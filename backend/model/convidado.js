import conexao from "../configuracao/banco.js";

// --- Funções Auxiliares ---

export async function getPessoaById(pessoa_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT id, nome, telefone, email FROM pessoa WHERE id = ?",
      [pessoa_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.length > 0 ? result[0] : null);
      }
    );
  });
}

export async function getEventosByConvidadoId(convidado_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT e.*, ce.limite_acompanhante, ce.confirmado, ce.token, ce.token_usado 
       FROM eventos e 
       JOIN convidado_evento ce ON e.id = ce.evento_id 
       WHERE ce.convidado_id = ?`,
      [convidado_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export async function getAcompanhantesByConvidadoEvento(convidado_id, evento_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT a.id, p.nome, p.telefone, p.email, a.confirmado, a.token, a.token_usado, a.ativo_acompanhante,
               a.convidado_evento_convidado_id, a.convidado_evento_evento_id  -- <<< GARANTA QUE ESTÁ SELECIONANDO ISSO
       FROM acompanhante a
       JOIN pessoa p ON a.pessoa_id = p.id
       WHERE a.convidado_evento_convidado_id = ?
       AND a.convidado_evento_evento_id = ?
       AND a.ativo_acompanhante = 1`,
      [convidado_id, evento_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

// --- Modelos Principais ---

export async function getConvidadosModel() {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT c.id AS convidado_id, p.nome, p.telefone, p.email, c.limite_acompanhante, c.ativo_convidado, c.administrador_id,
             -- Subconsulta para acompanhantes, selecionando as FKs
             (SELECT JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', a.id,
                 'nome', p_a.nome,
                 'telefone', p_a.telefone,
                 'email', p_a.email,
                 'confirmado', a.confirmado,
                 'token_usado', a.token_usado,
                 'ativo_acompanhante', a.ativo_acompanhante,
                 'convidado_evento_convidado_id', a.convidado_evento_convidado_id,
                 'convidado_evento_evento_id', a.convidado_evento_evento_id -- <<< GARANTA QUE ESTÁ SENDO INCLUÍDO
               )
             ) FROM acompanhante a JOIN pessoa p_a ON a.pessoa_id = p_a.id
             WHERE a.convidado_evento_convidado_id = c.id AND a.ativo_acompanhante = 1) AS acompanhantes_json,
             -- Subconsulta para eventos
             (SELECT JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', e.id,
                 'nome', e.nome,
                 'data_evento', e.data_evento,
                 'local', e.local,
                 'limite_acompanhante', ce.limite_acompanhante,
                 'confirmado', ce.confirmado,
                 'token_usado', ce.token_usado
               )
             ) FROM convidado_evento ce JOIN eventos e ON ce.evento_id = e.id
             WHERE ce.convidado_id = c.id) AS eventos_json
       FROM convidados c
       JOIN pessoa p ON c.pessoa_id = p.id
       WHERE c.ativo_convidado = 1`,
      async (err, convidadosRaw) => {
        if (err) {
          console.error('Erro na query getConvidadosModel:', err);
          return reject(err);
        }

        try {
          const convidadosCompleto = convidadosRaw.map(c => ({
            id: c.convidado_id,
            nome: c.nome,
            telefone: c.telefone,
            email: c.email,
            limite_acompanhante: c.limite_acompanhante,
            ativo_convidado: c.ativo_convidado,
            administrador_id: c.administrador_id,       
        eventos: c.eventos_json || [], 
        acompanhantes: c.acompanhantes_json || [], 
          }));
          resolve(convidadosCompleto);
        } catch (parseError) {
          console.error('Erro ao parsear JSON em getConvidadosModel:', parseError);
          reject(parseError);
        }
      }
    );
  });
}

export async function getConvidadoByIdModel(id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT c.id AS convidado_id, p.nome, p.telefone, p.email, c.limite_acompanhante, c.ativo_convidado, c.administrador_id
       FROM convidados c
       JOIN pessoa p ON c.pessoa_id = p.id
       WHERE c.id = ? AND c.ativo_convidado = 1`,
      [id],
      async (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);

        try {
          const convidado = results[0];
          const eventos = await getEventosByConvidadoId(convidado.convidado_id);

          const eventosComAcompanhantes = await Promise.all(
            eventos.map(async (evento) => {
              const acompanhantesDoEvento = await getAcompanhantesByConvidadoEvento(
                convidado.convidado_id,
                evento.id
              );
              return { ...evento, acompanhantes: acompanhantesDoEvento };
            })
          );

          resolve({
            id: convidado.convidado_id,
            nome: convidado.nome,
            telefone: convidado.telefone,
            email: convidado.email,
            limite_acompanhante: convidado.limite_acompanhante,
            ativo_convidado: convidado.ativo_convidado,
            administrador_id: convidado.administrador_id,
            eventos: eventosComAcompanhantes,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

export async function createConvidadoModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, limite_acompanhante = 0, administrador_id } = dados;

    // Primeiro, insere na tabela pessoa
    conexao.query(
      "INSERT INTO pessoa (nome, telefone, email) VALUES (?, ?, ?)",
      [nome, telefone, email],
      (err, resultPessoa) => {
        if (err) return reject(err);

        const pessoa_id = resultPessoa.insertId;

        // Depois, insere na tabela convidados, referenciando o ID da pessoa
        conexao.query(
          "INSERT INTO convidados (pessoa_id, limite_acompanhante, administrador_id) VALUES (?, ?, ?)",
          [pessoa_id, limite_acompanhante, administrador_id],
          (err, resultConvidado) => {
            if (err) return reject(err);
            resolve(resultConvidado);
          }
        );
      }
    );
  });
}

export async function addConvidadoToEventoModel(
  convidado_id,
  evento_id,
  limite_acompanhante = 0,
  confirmado = 0
) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "INSERT INTO convidado_evento (convidado_id, evento_id, limite_acompanhante, confirmado) VALUES (?, ?, ?, ?)",
      [convidado_id, evento_id, limite_acompanhante, confirmado],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function updateConvidadoModel(id, novosDados) {
  return new Promise((resolve, reject) => {
    // Primeiro, busca o pessoa_id do convidado
    conexao.query("SELECT pessoa_id FROM convidados WHERE id = ?", [id], (err, convidadoResult) => {
      if (err) return reject(err);
      if (convidadoResult.length === 0) return reject(new Error("Convidado não encontrado."));

      const pessoa_id = convidadoResult[0].pessoa_id;

      const pessoaDadosAtualizacao = {};
      const convidadoDadosAtualizacao = {};

      const camposPessoa = ["nome", "telefone", "email"];
      const camposConvidado = ["limite_acompanhante", "ativo_convidado", "administrador_id"];

      camposPessoa.forEach((campo) => {
        if (novosDados[campo] !== undefined) {
          pessoaDadosAtualizacao[campo] = novosDados[campo];
        }
      });

      camposConvidado.forEach((campo) => {
        if (novosDados[campo] !== undefined) {
          convidadoDadosAtualizacao[campo] = novosDados[campo];
        }
      });

      const promises = [];

      if (Object.keys(pessoaDadosAtualizacao).length > 0) {
        promises.push(
          new Promise((res, rej) => {
            conexao.query(
              "UPDATE pessoa SET ? WHERE id = ?",
              [pessoaDadosAtualizacao, pessoa_id],
              (errUpdate) => {
                if (errUpdate) return rej(errUpdate);
                res();
              }
            );
          })
        );
      }

      if (Object.keys(convidadoDadosAtualizacao).length > 0) {
        promises.push(
          new Promise((res, rej) => {
            conexao.query(
              "UPDATE convidados SET ? WHERE id = ?",
              [convidadoDadosAtualizacao, id],
              (errUpdate) => {
                if (errUpdate) return rej(errUpdate);
                res();
              }
            );
          })
        );
      }

      Promise.all(promises)
        .then((results) => resolve(results))
        .catch((error) => reject(error));
    });
  });
}

/**
 * @function updateConvidadoEventoModel
 * @description Atualiza o status de um convidado em um evento específico.
 * @param {number} convidado_id - O ID do convidado.
 * @param {number} evento_id - O ID do evento.
 * @param {Object} novosDados - Objeto com os dados a serem atualizados (limite_acompanhante, confirmado, token, token_usado).
 * @returns {Promise<Object>} Uma Promise que resolve com o resultado da atualização.
 */
export function updateConvidadoEventoModel(convidado_id, evento_id, novosDados) {
  return new Promise((resolve, reject) => {
    const camposPermitidos = ["limite_acompanhante", "confirmado", "token", "token_usado"];
    const dadosAtualizacao = {};

    camposPermitidos.forEach((campo) => {
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
    // Primeiro, busca o pessoa_id do convidado
    conexao.query("SELECT pessoa_id FROM convidados WHERE id = ?", [id], (err, convidadoResult) => {
      if (err) return reject(err);
      if (convidadoResult.length === 0) return reject(new Error("Convidado não encontrado."));

      const pessoa_id = convidadoResult[0].pessoa_id;

      // Inativa na tabela convidados
      conexao.query(
        "UPDATE convidados SET ativo_convidado = 0 WHERE id = ?",
        [id],
        (errConvidado) => {
          if (errConvidado) return reject(errConvidado);

          // Opcional: Inativar na tabela pessoa se não houver outras referências ativas (mais complexo)
          // Por enquanto, vamos apenas inativar o registro do convidado.
          resolve({ message: "Convidado inativado com sucesso." });
        }
      );
    });
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

// --- Funções para Acompanhantes ---

export function createAcompanhanteModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, convidado_id, evento_id } = dados;

    // Primeiro, insere na tabela pessoa
    conexao.query(
      "INSERT INTO pessoa (nome, telefone, email) VALUES (?, ?, ?)",
      [nome, telefone, email],
      (err, resultPessoa) => {
        if (err) return reject(err);

        const pessoa_id = resultPessoa.insertId;

        // Depois, insere na tabela acompanhante, referenciando o ID da pessoa e as chaves de convidado_evento
        conexao.query(
          `INSERT INTO acompanhante (pessoa_id, confirmado, convidado_evento_convidado_id, convidado_evento_evento_id) 
           VALUES (?, ?, ?, ?)`,
          [pessoa_id, 0, convidado_id, evento_id], // `confirmado: 1` por padrão na criação
          (err, resultAcompanhante) => {
            if (err) return reject(err);
            resolve(resultAcompanhante);
          }
        );
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
    // Busca o pessoa_id e as chaves de convidado_evento do acompanhante
    conexao.query(
      `SELECT pessoa_id, convidado_evento_convidado_id, convidado_evento_evento_id 
       FROM acompanhante WHERE id = ?`,
      [id],
      (err, acompanhanteResult) => {
        if (err) return reject(err);
        if (acompanhanteResult.length === 0) return reject(new Error("Acompanhante não encontrado."));

        const { pessoa_id, convidado_evento_convidado_id, convidado_evento_evento_id } = acompanhanteResult[0];

        const pessoaDadosAtualizacao = {};
        const acompanhanteDadosAtualizacao = {};

        const camposPessoa = ["nome", "telefone", "email"];
        const camposAcompanhante = ["confirmado", "token", "token_usado", "ativo_acompanhante"];
        // Adicionar campos de FK se for permitido alterar a qual convidado_evento ele pertence
        // Fora do escopo atual, pois seria uma alteração mais complexa
        // "convidado_evento_convidado_id", "convidado_evento_evento_id"

        camposPessoa.forEach((campo) => {
          if (novosDados[campo] !== undefined) {
            pessoaDadosAtualizacao[campo] = novosDados[campo];
          }
        });

        camposAcompanhante.forEach((campo) => {
          if (novosDados[campo] !== undefined) {
            acompanhanteDadosAtualizacao[campo] = novosDados[campo];
          }
        });

        const promises = [];

        if (Object.keys(pessoaDadosAtualizacao).length > 0) {
          promises.push(
            new Promise((res, rej) => {
              conexao.query(
                "UPDATE pessoa SET ? WHERE id = ?",
                [pessoaDadosAtualizacao, pessoa_id],
                (errUpdate) => {
                  if (errUpdate) return rej(errUpdate);
                  res();
                }
              );
            })
          );
        }

        if (Object.keys(acompanhanteDadosAtualizacao).length > 0) {
          promises.push(
            new Promise((res, rej) => {
              conexao.query(
                "UPDATE acompanhante SET ? WHERE id = ?",
                [acompanhanteDadosAtualizacao, id],
                (errUpdate) => {
                  if (errUpdate) return rej(errUpdate);
                  res();
                }
              );
            })
          );
        }

        Promise.all(promises)
          .then((results) => resolve(results))
          .catch((error) => reject(error));
      }
    );
  });
}

export function confirmarAcompanhantesModel(convidadoId, eventoId, idsAcompanhantes) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(idsAcompanhantes) || idsAcompanhantes.length === 0) {
      return resolve({ affectedRows: 0, message: "Nenhum acompanhante para confirmar." });
    }

    conexao.query(
      `UPDATE acompanhante 
       SET confirmado = 1 
       WHERE id IN (?) 
       AND convidado_evento_convidado_id = ? 
       AND convidado_evento_evento_id = ?`,
      [idsAcompanhantes, convidadoId, eventoId],
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

export function inativaAcompanhanteModel(convidadoId, eventoId) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `UPDATE acompanhante 
       SET confirmado = 2 
       WHERE convidado_evento_convidado_id = ? 
       AND convidado_evento_evento_id = ?`,
      [convidadoId, eventoId],
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
      `SELECT ce.convidado_id, ce.evento_id, c.pessoa_id, p.nome, p.telefone, p.email, c.limite_acompanhante, c.ativo_convidado, c.administrador_id
       FROM convidado_evento ce
       JOIN convidados c ON ce.convidado_id = c.id
       JOIN pessoa p ON c.pessoa_id = p.id
       WHERE ce.token = ?`,
      [token],
      async (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);

        const convidadoEvento = results[0];
        const convidadoId = convidadoEvento.convidado_id;
        const eventoId = convidadoEvento.evento_id;

        try {
          const eventos = await getEventosByConvidadoId(convidadoId);
          const acompanhantesDoEvento = await getAcompanhantesByConvidadoEvento(convidadoId, eventoId);

          // Filtra o evento específico ao qual o token pertence
          const eventoAssociado = eventos.find(e => e.id === eventoId);
          if (eventoAssociado) {
              eventoAssociado.acompanhantes = acompanhantesDoEvento;
          }
          
          resolve({
            id: convidadoId,
            nome: convidadoEvento.nome,
            telefone: convidadoEvento.telefone,
            email: convidadoEvento.email,
            limite_acompanhante: convidadoEvento.limite_acompanhante,
            ativo_convidado: convidadoEvento.ativo_convidado,
            administrador_id: convidadoEvento.administrador_id,
            // Retorna apenas o evento associado ao token, com seus acompanhantes
            eventos: eventoAssociado ? [eventoAssociado] : [], 
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

export function confirmarPresencaPorTokenModel(token) {
  return new Promise((resolve, reject) => {
    // Tenta encontrar o token em convidado_evento
    conexao.query(
      `SELECT ce.convidado_id, ce.evento_id, c.pessoa_id, p.nome 
       FROM convidado_evento ce
       JOIN convidados c ON ce.convidado_id = c.id
       JOIN pessoa p ON c.pessoa_id = p.id
       WHERE ce.token = ? AND ce.token_usado = 0`, // Verifica se o token ainda não foi usado
      [token],
      (err, convidadoResult) => {
        if (err) return reject(err);

        if (convidadoResult.length > 0) {
          // É um convidado, atualiza token_usado em convidado_evento
          conexao.query(
            "UPDATE convidado_evento SET token_usado = 1 WHERE token = ?",
            [token],
            (errUpdate) => {
              if (errUpdate) return reject(errUpdate);
              return resolve({ tipo: "convidado", nome: convidadoResult[0].nome });
            }
          );
        } else {
          // Não é um convidado, tenta encontrar o token em acompanhante
          conexao.query(
            `SELECT a.id, p.nome 
             FROM acompanhante a
             JOIN pessoa p ON a.pessoa_id = p.id
             WHERE a.token = ? AND a.token_usado = 0`, // Verifica se o token ainda não foi usado
            [token],
            (err2, acompanhanteResult) => {
              if (err2) return reject(err2);

              if (acompanhanteResult.length > 0) {
                // É um acompanhante, atualiza token_usado em acompanhante
                conexao.query(
                  "UPDATE acompanhante SET token_usado = 1 WHERE token = ?",
                  [token],
                  (errUpdate2) => {
                    if (errUpdate2) return reject(errUpdate2);
                    return resolve({ tipo: "acompanhante", nome: acompanhanteResult[0].nome });
                  }
                );
              } else {
                return resolve(null); // Token inválido ou já usado
              }
            }
          );
        }
      }
    );
  });
}

export function salvarTokenConvidado(convidadoId, eventoId, token) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "UPDATE convidado_evento SET token = ? WHERE convidado_id = ? AND evento_id = ?",
      [token, convidadoId, eventoId],
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