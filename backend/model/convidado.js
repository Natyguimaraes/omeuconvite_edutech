import conexao from "../configuracao/banco.js"; // Certifique-se de que o caminho está correto

// --- Funções Auxiliares ---

export async function getPessoaById(pessoa_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "SELECT id, nome, telefone, email FROM pessoa WHERE id = ?",
      [pessoa_id],
      (err, result) => {
        if (err) {
          console.error("Erro em getPessoaById:", err);
          return reject(err);
        }
        resolve(result.length > 0 ? result[0] : null);
      }
    );
  });
}

export async function getEventosByConvidadoId(convidado_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT e.id, e.nome, e.data_evento, e.local, ce.limite_acompanhante, ce.confirmado, ce.token, ce.token_usado
       FROM eventos e
       JOIN convidado_evento ce ON e.id = ce.evento_id
       WHERE ce.convidado_id = ?`,
      [convidado_id],
      (err, result) => {
        if (err) {
          console.error("Erro em getEventosByConvidadoId:", err);
          return reject(err);
        }
        resolve(result);
      }
    );
  });
}

export async function getAcompanhantesByConvidadoEvento(convidado_id, evento_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT a.id, p.nome, p.telefone, p.email, a.confirmado, a.token, a.token_usado, a.ativo_acompanhante,
              a.convidado_evento_convidado_id, a.convidado_evento_evento_id, a.pessoa_id
       FROM acompanhante a
       JOIN pessoa p ON a.pessoa_id = p.id
       WHERE a.convidado_evento_convidado_id = ?
       AND a.convidado_evento_evento_id = ?
       AND a.ativo_acompanhante = 1`,
      [convidado_id, evento_id],
      (err, result) => {
        if (err) {
          console.error("Erro em getAcompanhantesByConvidadoEvento:", err);
          return reject(err);
        }
        resolve(result);
      }
    );
  });
}

export async function getAcompanhanteById(acompanhante_id) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT a.id, p.nome, p.telefone, p.email, a.confirmado, a.token, a.token_usado, a.ativo_acompanhante,
              a.convidado_evento_convidado_id, a.convidado_evento_evento_id, a.pessoa_id
       FROM acompanhante a
       JOIN pessoa p ON a.pessoa_id = p.id
       WHERE a.id = ?`,
      [acompanhante_id],
      (err, result) => {
        if (err) {
          console.error("Erro em getAcompanhanteById:", err);
          return reject(err);
        }
        resolve(result.length > 0 ? result[0] : null);
      }
    );
  });
}

// --- Modelos Principais ---

export async function getConvidadosModel() {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT c.id AS convidado_id, p.nome, p.telefone, p.email, c.limite_acompanhante, c.ativo_convidado, c.administrador_id,
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
                   'convidado_evento_evento_id', a.convidado_evento_evento_id
                 )
               ) FROM acompanhante a JOIN pessoa p_a ON a.pessoa_id = p_a.id
               WHERE a.convidado_evento_convidado_id = c.id AND a.ativo_acompanhante = 1) AS acompanhantes_json,
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
          const convidadosCompleto = convidadosRaw.map(c => {
            let eventosParsed = [];
            let acompanhantesParsed = [];

            if (typeof c.eventos_json === 'string') {
              eventosParsed = JSON.parse(c.eventos_json);
            } else if (c.eventos_json !== null && typeof c.eventos_json === 'object') {
              eventosParsed = c.eventos_json;
            }

            if (typeof c.acompanhantes_json === 'string') {
              acompanhantesParsed = JSON.parse(c.acompanhantes_json);
            } else if (c.acompanhantes_json !== null && typeof c.acompanhantes_json === 'object') {
              acompanhantesParsed = c.acompanhantes_json;
            }

            return {
              id: c.convidado_id,
              nome: c.nome,
              telefone: c.telefone,
              email: c.email,
              limite_acompanhante: c.limite_acompanhante,
              ativo_convidado: c.ativo_convidado,
              administrador_id: c.administrador_id,
              eventos: eventosParsed || [],
              acompanhantes: acompanhantesParsed || [],
            };
          });
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
        if (err) {
          console.error("Erro em getConvidadoByIdModel:", err);
          return reject(err);
        }
        if (results.length === 0) return resolve(null);

        try {
          const convidado = results[0];
          const eventos = await getEventosByConvidadoId(convidado.convidado_id);

          const acompanhantesGlobais = await new Promise((res, rej) => {
            conexao.query(
              `SELECT a.id, p.nome, p.telefone, p.email, a.confirmado, a.token, a.token_usado, a.ativo_acompanhante,
                      a.convidado_evento_convidado_id, a.convidado_evento_evento_id, a.pessoa_id
               FROM acompanhante a
               JOIN pessoa p ON a.pessoa_id = p.id
               WHERE a.convidado_evento_convidado_id = ?
               AND a.ativo_acompanhante = 1`,
              [convidado.convidado_id],
              (e, r) => (e ? rej(e) : res(r))
            );
          });

          resolve({
            id: convidado.convidado_id,
            nome: convidado.nome,
            telefone: convidado.telefone,
            email: convidado.email,
            limite_acompanhante: convidado.limite_acompanhante,
            ativo_convidado: convidado.ativo_convidado,
            administrador_id: convidado.administrador_id,
            eventos: eventos,
            acompanhantes: acompanhantesGlobais,
          });
        } catch (error) {
          console.error("Erro ao montar convidado em getConvidadoByIdModel:", error);
          reject(error);
        }
      }
    );
  });
}

export async function createConvidadoModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, limite_acompanhante = 0, administrador_id, evento_id } = dados;

    conexao.beginTransaction(async (err) => {
      if (err) return reject(err);

      try {
        const resultPessoa = await new Promise((res, rej) => {
          conexao.query(
            "INSERT INTO pessoa (nome, telefone, email) VALUES (?, ?, ?)",
            [nome, telefone, email],
            (e, r) => (e ? rej(e) : res(r))
          );
        });
        const pessoa_id = resultPessoa.insertId;

        const resultConvidado = await new Promise((res, rej) => {
          conexao.query(
            "INSERT INTO convidados (pessoa_id, limite_acompanhante, administrador_id) VALUES (?, ?, ?)",
            [pessoa_id, limite_acompanhante, administrador_id],
            (e, r) => (e ? rej(e) : res(r))
          );
        });
        const convidado_id = resultConvidado.insertId;

        if (evento_id) {
          await new Promise((res, rej) => {
            conexao.query(
              "INSERT INTO convidado_evento (convidado_id, evento_id, limite_acompanhante, confirmado) VALUES (?, ?, ?, ?)",
              [convidado_id, evento_id, limite_acompanhante, 0],
              (e, r) => (e ? rej(e) : res(r))
            );
          });
        }

        conexao.commit((commitErr) => {
          if (commitErr) {
            return conexao.rollback(() => reject(commitErr));
          }
          resolve({ id: convidado_id, nome, telefone, email, limite_acompanhante });
        });
      } catch (opErr) {
        conexao.rollback(() => reject(opErr));
      }
    });
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
        if (err) {
          console.error("Erro em addConvidadoToEventoModel:", err);
          return reject(err);
        }
        resolve(result);
      }
    );
  });
}

export function updateConvidadoModel(id, novosDados) {
  return new Promise(async (resolve, reject) => {
    conexao.beginTransaction(async (err) => {
      if (err) return reject(err);

      try {
        const convidadoResult = await new Promise((res, rej) => {
          conexao.query("SELECT pessoa_id FROM convidados WHERE id = ?", [id], (e, r) =>
            e ? rej(e) : res(r)
          );
        });

        if (convidadoResult.length === 0) {
          throw new Error("Convidado não encontrado.");
        }
        const pessoa_id = convidadoResult[0].pessoa_id;

        const promises = [];

        // 1. Atualizar dados da pessoa (nome, telefone, email)
        const pessoaDadosAtualizacao = {};
        const camposPessoa = ["nome", "telefone", "email"];
        camposPessoa.forEach((campo) => {
          if (novosDados[campo] !== undefined) {
            pessoaDadosAtualizacao[campo] = novosDados[campo];
          }
        });
        if (Object.keys(pessoaDadosAtualizacao).length > 0) {
          promises.push(
            new Promise((res, rej) => {
              conexao.query(
                "UPDATE pessoa SET ? WHERE id = ?",
                [pessoaDadosAtualizacao, pessoa_id],
                (e, r) => (e ? rej(e) : res(r))
              );
            })
          );
        }

        // 2. Atualizar limite_acompanhante na tabela convidados
        const convidadoDadosAtualizacao = {};
        if (novosDados.limite_acompanhante !== undefined) {
          convidadoDadosAtualizacao.limite_acompanhante =
            novosDados.limite_acompanhante;
        }
        if (Object.keys(convidadoDadosAtualizacao).length > 0) {
          promises.push(
            new Promise((res, rej) => {
              conexao.query(
                "UPDATE convidados SET ? WHERE id = ?",
                [convidadoDadosAtualizacao, id],
                (e, r) => (e ? rej(e) : res(r))
              );
            })
          );
        }

        // 3. Gerenciar acompanhantes (criação e atualização)
        if (novosDados.acompanhantes) {
          for (const acomp of novosDados.acompanhantes) {
            if (acomp.id) {
              // Acompanhante existente (update)
              const existingAcomp = await getAcompanhanteById(acomp.id);
              if (existingAcomp) {
                // Atualiza a pessoa associada ao acompanhante
                const acompPessoaUpdate = {
                  nome: acomp.nome,
                  telefone: acomp.telefone,
                  email: acomp.email,
                };
                promises.push(
                  new Promise((res, rej) => {
                    conexao.query(
                      "UPDATE pessoa SET ? WHERE id = ?",
                      [acompPessoaUpdate, existingAcomp.pessoa_id],
                      (e, r) => (e ? rej(e) : res(r))
                    );
                  })
                );
                // ATUALIZAÇÃO CRÍTICA: Chamar updateAcompanhanteModel para atualizar campos do acompanhante
                // como `confirmado` e `ativo_acompanhante` se vierem no payload.
                // updateAcompanhanteModel já lida com a parte da `pessoa` também, se necessário.
                promises.push(updateAcompanhanteModel(acomp.id, {
                    confirmado: acomp.confirmado,
                    // Outros campos específicos do acompanhante que podem ser atualizados
                    // ativo_acompanhante: acomp.ativo_acompanhante // se você quiser controlar isso aqui
                }));
              }
            } else {
              // Novo acompanhante (create)
              if (acomp.nome && acomp.convidado_evento_convidado_id && acomp.convidado_evento_evento_id) {
                 promises.push(createAcompanhanteModel({
                   nome: acomp.nome,
                   telefone: acomp.telefone || null,
                   email: acomp.email || null,
                   convidado_id: acomp.convidado_evento_convidado_id,
                   evento_id: acomp.convidado_evento_evento_id, // CORRIGIDO: era `aomp`
                   confirmado: acomp.confirmado
                 }));
              }
            }
          }
        }

        // 4. Inativar acompanhantes marcados para deleção
        if (novosDados.acompanhantes_to_delete && novosDados.acompanhantes_to_delete.length > 0) {
            for (const acompId of novosDados.acompanhantes_to_delete) {
                promises.push(deleteAcompanhanteModel(acompId));
            }
        }

        await Promise.all(promises);

        conexao.commit((commitErr) => {
          if (commitErr) {
            return conexao.rollback(() => reject(commitErr));
          }
          resolve({ message: "Convidado e acompanhantes atualizados com sucesso." });
        });
      } catch (opErr) {
        conexao.rollback(() => reject(opErr));
      }
    });
  });
}

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
        if (err) {
          console.error("Erro em updateConvidadoEventoModel:", err);
          return reject(err);
        }
        resolve(result);
      }
    );
  });
}

export function deleteConvidadoModel(id) {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT pessoa_id FROM convidados WHERE id = ?", [id], (err, convidadoResult) => {
      if (err) {
        console.error("Erro ao buscar pessoa_id para inativação do convidado:", err);
        return reject(err);
      }
      if (convidadoResult.length === 0) return reject(new Error("Convidado não encontrado."));

      conexao.query(
        "UPDATE convidados SET ativo_convidado = 0 WHERE id = ?",
        [id],
        (errConvidado) => {
          if (errConvidado) {
            console.error("Erro ao inativar convidado:", errConvidado);
            return reject(errConvidado);
          }
          resolve({ message: "Convidado inativado com sucesso." });
        }
      );
    });
  });
}


// Em backend/model/convidado.js

//remove o convidado e se tiver acompanhantes da tabela de convidado_evento
export function removeConvidadoFromEventoModel(convidado_id, evento_id) {
  return new Promise(async (resolve, reject) => {
    conexao.beginTransaction(async (err) => { // Inicia uma transação para garantir que tudo ocorra junto
      if (err) return reject(err);

      try {
        // 1. Encontrar os pessoa_id dos acompanhantes que serão deletados
        //    Isso é útil se você tiver uma tabela 'pessoa' separada e quiser limpar 'pessoas' órfãs.
        //    Por enquanto, vamos apenas deletar os acompanhantes diretamente.

        // 2. **DELETAR FISICAMENTE** os acompanhantes relacionados a esta entrada de convidado_evento.
        //    Esta operação remove as linhas da tabela 'acompanhante', satisfazendo a FK.
        const deleteAcompanhantesResult = await new Promise((res, rej) => {
          conexao.query(
            `DELETE FROM acompanhante
             WHERE convidado_evento_convidado_id = ?
             AND convidado_evento_evento_id = ?`,
            [convidado_id, evento_id],
            (e, r) => (e ? rej(e) : res(r))
          );
        });
        console.log(`Deletados ${deleteAcompanhantesResult.affectedRows} acompanhantes para o convidado ${convidado_id} no evento ${evento_id}.`);

        // 3. Agora que os acompanhantes foram removidos, pode deletar a relação convidado_evento.
        const deleteConvidadoEventoResult = await new Promise((res, rej) => {
          conexao.query(
            "DELETE FROM convidado_evento WHERE convidado_id = ? AND evento_id = ?",
            [convidado_id, evento_id],
            (e, r) => (e ? rej(e) : res(r))
          );
        });

        conexao.commit((commitErr) => { // Confirma todas as operações da transação
          if (commitErr) {
            return conexao.rollback(() => reject(commitErr)); // Se der erro, desfaz tudo
          }
          resolve(deleteConvidadoEventoResult); // Retorna o resultado da operação principal
        });
      } catch (opErr) {
        console.error("Erro durante a transação de remoção de convidado do evento:", opErr);
        conexao.rollback(() => reject(opErr)); // Em caso de erro, desfaz tudo
      }
    });
  });
}

// --- Funções para Acompanhantes ---

//criar acompanhantes novos

export function createAcompanhanteModel(dados) {
  return new Promise((resolve, reject) => {
    const { nome, telefone, email, convidado_id, evento_id, confirmado = 0 } = dados;

    conexao.beginTransaction(async (err) => {
      if (err) return reject(err);

      try {
        const resultPessoa = await new Promise((res, rej) => {
          conexao.query(
            "INSERT INTO pessoa (nome, telefone, email) VALUES (?, ?, ?)",
            [nome, telefone, email],
            (e, r) => (e ? rej(e) : res(r))
          );
        });
        const pessoa_id = resultPessoa.insertId;

        const resultAcompanhante = await new Promise((res, rej) => {
          conexao.query(
            `INSERT INTO acompanhante (pessoa_id, confirmado, convidado_evento_convidado_id, convidado_evento_evento_id)
             VALUES (?, ?, ?, ?)`,
            [pessoa_id, confirmado, convidado_id, evento_id],
            (e, r) => (e ? rej(e) : res(r))
          );
        });

        conexao.commit((commitErr) => {
          if (commitErr) {
            return conexao.rollback(() => reject(commitErr));
          }
          resolve(resultAcompanhante);
        });
      } catch (opErr) {
        conexao.rollback(() => reject(opErr));
      }
    });
  });
}

//para inativar acompanhante
export function deleteAcompanhanteModel(id) {
  return new Promise((resolve, reject) => {
    conexao.query("SELECT pessoa_id FROM acompanhante WHERE id = ?", [id], (err, acompResult) => {
        if (err) {
            console.error("Erro ao buscar pessoa_id para inativação do acompanhante:", err);
            return reject(err);
        }
        if (acompResult.length === 0) return reject(new Error("Acompanhante não encontrado para inativação."));

        conexao.beginTransaction(async (errTx) => {
            if (errTx) return reject(errTx);

            try {
                await new Promise((res, rej) => {
                    conexao.query(
                        "UPDATE acompanhante SET ativo_acompanhante = 0 WHERE id = ?",
                        [id],
                        (e, r) => (e ? rej(e) : res(r))
                    );
                });

                conexao.commit((commitErr) => {
                    if (commitErr) {
                        return conexao.rollback(() => reject(commitErr));
                    }
                    resolve({ message: "Acompanhante inativado com sucesso." });
                });
            } catch (opErr) {
                conexao.rollback(() => reject(opErr));
            }
        });
    });
});
}


export function updateAcompanhanteModel(id, novosDados) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT pessoa_id FROM acompanhante WHERE id = ?`,
      [id],
      (err, acompanhanteResult) => {
        if (err) {
          console.error("Erro ao buscar pessoa_id do acompanhante para update:", err);
          return reject(err);
        }
        if (acompanhanteResult.length === 0) return reject(new Error("Acompanhante não encontrado."));

        const pessoa_id = acompanhanteResult[0].pessoa_id;
        const promises = [];

        const pessoaDadosAtualizacao = {};
        const camposPessoa = ["nome", "telefone", "email"];
        camposPessoa.forEach((campo) => {
          if (novosDados[campo] !== undefined) {
            pessoaDadosAtualizacao[campo] = novosDados[campo];
          }
        });
        if (Object.keys(pessoaDadosAtualizacao).length > 0) {
          promises.push(
            new Promise((res, rej) => {
              conexao.query(
                "UPDATE pessoa SET ? WHERE id = ?",
                [pessoaDadosAtualizacao, pessoa_id],
                (e, r) => (e ? rej(e) : res(r))
              );
            })
          );
        }

        const acompanhanteDadosAtualizacao = {};
        const camposAcompanhante = ["confirmado", "token", "token_usado", "ativo_acompanhante"];
        camposAcompanhante.forEach((campo) => {
            if (novosDados[campo] !== undefined) {
                acompanhanteDadosAtualizacao[campo] = novosDados[campo];
            }
        });
        if (Object.keys(acompanhanteDadosAtualizacao).length > 0) {
            promises.push(new Promise((res, rej) => {
                conexao.query("UPDATE acompanhante SET ? WHERE id = ?",
                    [acompanhanteDadosAtualizacao, id],
                    (e, r) => e ? rej(e) : res(r)
                );
            }));
        }

        Promise.all(promises)
          .then((results) => resolve(results))
          .catch((error) => {
            console.error("Erro ao atualizar acompanhante (promessas):", error);
            reject(error);
          });
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
        if (err) {
          console.error("Erro em confirmarAcompanhantesModel:", err);
          return reject(err);
        }
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
        if (err) {
          console.error("Erro em removeConvidadoFromAllEventosModel:", err);
          return reject(err);
        }
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
        if (err) {
          console.error("Erro em inativaAcompanhanteModel:", err);
          return reject(err);
        }
        resolve(result);
      }
    );
  });
}

export async function getConvidadoByTokenModel(token) {
  return new Promise((resolve, reject) => {
    conexao.query(
      `SELECT ce.convidado_id, ce.evento_id, c.pessoa_id, p.nome, p.telefone, p.email, ce.limite_acompanhante, ce.confirmado AS evento_confirmado, ce.token_usado AS evento_token_usado
       FROM convidado_evento ce
       JOIN convidados c ON ce.convidado_id = c.id
       JOIN pessoa p ON c.pessoa_id = p.id
       WHERE ce.token = ?`,
      [token],
      async (err, results) => {
        if (err) {
          console.error("Erro em getConvidadoByTokenModel (convidado_evento):", err);
          return reject(err);
        }

        if (results.length > 0) {
          const convidadoEvento = results[0];
          const convidadoId = convidadoEvento.convidado_id;
          const eventoId = convidadoEvento.evento_id;

          try {
            const acompanhantesDoEvento = await getAcompanhantesByConvidadoEvento(convidadoId, eventoId);

            resolve({
              id: convidadoId,
              nome: convidadoEvento.nome,
              telefone: convidadoEvento.telefone,
              email: convidadoEvento.email,
              limite_acompanhante: convidadoEvento.limite_acompanhante,
              confirmado: Number(convidadoEvento.evento_confirmado) === 1,
              token_usado: Number(convidadoEvento.evento_token_usado) === 1,
              eventos: [{
                id: eventoId,
                limite_acompanhante: convidadoEvento.limite_acompanhante,
                confirmado: Number(convidadoEvento.evento_confirmado) === 1,
                token_usado: Number(convidadoEvento.evento_token_usado) === 1,
                acompanhantes: acompanhantesDoEvento.map(a => ({
                    ...a,
                    confirmado: Number(a.confirmado) === 1,
                    token_usado: Number(a.token_usado) === 1
                }))
              }],
            });
          } catch (error) {
            console.error("Erro ao buscar acompanhantes para token (convidado):", error);
            reject(error);
          }
        } else {
          conexao.query(
            `SELECT a.id AS acompanhante_id, a.pessoa_id, p.nome, p.telefone, p.email, a.confirmado AS acomp_confirmado, a.token_usado AS acomp_token_usado,
                    a.convidado_evento_convidado_id, a.convidado_evento_evento_id,
                    ce.limite_acompanhante, ce.confirmado AS convidado_confirmado, ce.token_usado AS convidado_token_usado
             FROM acompanhante a
             JOIN pessoa p ON a.pessoa_id = p.id
             JOIN convidado_evento ce ON a.convidado_evento_convidado_id = ce.convidado_id AND a.convidado_evento_evento_id = ce.evento_id
             WHERE a.token = ?`,
            [token],
            async (err2, acompResults) => {
              if (err2) {
                console.error("Erro em getConvidadoByTokenModel (acompanhante):", err2);
                return reject(err2);
              }

              if (acompResults.length > 0) {
                const acompData = acompResults[0];
                const convidadoId = acompData.convidado_evento_convidado_id;
                const eventoId = acompData.convidado_evento_evento_id;

                try {
                  const acompanhantesDoEvento = await getAcompanhantesByConvidadoEvento(convidadoId, eventoId);

                  resolve({
                    id: convidadoId,
                    nome: acompData.nome,
                    telefone: acompData.telefone,
                    email: acompData.email,
                    limite_acompanhante: acompData.limite_acompanhante,
                    confirmado: Number(acompData.acomp_confirmado) === 1,
                    token_usado: Number(acompData.acomp_token_usado) === 1,
                    eventos: [{
                      id: eventoId,
                      limite_acompanhante: acompData.limite_acompanhante,
                      confirmado: Number(acompData.convidado_confirmado) === 1,
                      token_usado: Number(acompData.convidado_token_usado) === 1,
                      acompanhantes: acompanhantesDoEvento.map(a => ({
                          ...a,
                          confirmado: Number(a.confirmado) === 1,
                          token_usado: Number(a.token_usado) === 1
                      }))
                    }],
                  });
                } catch (error) {
                    console.error("Erro ao buscar acompanhantes para token (acompanhante):", error);
                    reject(error);
                }
              } else {
                resolve(null);
              }
            }
          );
        }
      }
    );
  });
}

export function confirmarPresencaPorTokenModel(token) {
  return new Promise((resolve, reject) => {
    conexao.beginTransaction(async (err) => {
      if (err) return reject(err);

      try {
        let result = null;

        const convidadoResult = await new Promise((res, rej) => {
          conexao.query(
            `SELECT ce.convidado_id, ce.evento_id, p.nome
             FROM convidado_evento ce
             JOIN convidados c ON ce.convidado_id = c.id
             JOIN pessoa p ON c.pessoa_id = p.id
             WHERE ce.token = ?`, // Removido `AND ce.token_usado = 0` para permitir verificar se já foi usado
            [token],
            (e, r) => (e ? rej(e) : res(r))
          );
        });

        if (convidadoResult.length > 0) {
          const isUsed = convidadoResult[0].token_usado === 1; // Verifica antes de atualizar

          if (!isUsed) {
            await new Promise((res, rej) => {
              conexao.query(
                "UPDATE convidado_evento SET token_usado = 1, confirmado = 1 WHERE token = ?",
                [token],
                (e, r) => (e ? rej(e) : res(r))
              );
            });
          }
          result = { tipo: "convidado", nome: convidadoResult[0].nome, token_usado: isUsed ? 1 : 0 }; // Retorna o status de uso
        } else {
          const acompanhanteResult = await new Promise((res, rej) => {
            conexao.query(
              `SELECT a.id, p.nome, a.token_usado
               FROM acompanhante a
               JOIN pessoa p ON a.pessoa_id = p.id
               WHERE a.token = ?`, // Removido `AND a.token_usado = 0`
              [token],
              (e, r) => (e ? rej(e) : res(r))
            );
          });

          if (acompanhanteResult.length > 0) {
            const isUsed = acompanhanteResult[0].token_usado === 1; // Verifica antes de atualizar

            if (!isUsed) {
              await new Promise((res, rej) => {
                conexao.query(
                  "UPDATE acompanhante SET token_usado = 1, confirmado = 1 WHERE token = ?",
                  [token],
                  (e, r) => (e ? rej(e) : res(r))
                );
              });
            }
            result = { tipo: "acompanhante", nome: acompanhanteResult[0].nome, token_usado: isUsed ? 1 : 0 };
          } else {
            result = null;
          }
        }

        conexao.commit((commitErr) => {
          if (commitErr) {
            return conexao.rollback(() => reject(commitErr));
          }
          resolve(result);
        });
      } catch (opErr) {
        conexao.rollback(() => reject(opErr));
      }
    });
  });
}


export function salvarTokenConvidado(convidadoId, eventoId, token) {
  return new Promise((resolve, reject) => {
    conexao.query(
      "UPDATE convidado_evento SET token = ? WHERE convidado_id = ? AND evento_id = ?",
      [token, convidadoId, eventoId],
      (err, result) => {
        if (err) {
          console.error("Erro em salvarTokenConvidado:", err);
          return reject(err);
        }
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
        if (err) {
          console.error("Erro em salvarTokenAcompanhante:", err);
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
}