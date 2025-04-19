import { salvarTokenConvidado, salvarTokenAcompanhante } from '../model/convidado.js';
import {gerarTokenCredencial} from "../utils/jwtUtils.js"

export async function gerarCredencial(req, res) {
  try {
    const { convidadoId, eventoId, acompanhantes } = req.body;
    
    const tokenConvidado = gerarTokenCredencial({
      convidadoId,
      eventoId,
      tipo: 'convidado_principal'
    });

    
    const result = await salvarTokenConvidado(convidadoId, tokenConvidado).catch((error) => {console.log(error)});
    
    console.log(result, tokenConvidado)
    const tokensAcompanhantes = [];

    if (Array.isArray(acompanhantes)) {
      for (const acomp of acompanhantes) {
        const tokenAcompanhante = gerarTokenCredencial({
          acompanhanteId: acomp.id,
          eventoId,
          tipo: 'acompanhante',
          convidadoPrincipalId: convidadoId
        });

        await salvarTokenAcompanhante(acomp.id, tokenAcompanhante);

        tokensAcompanhantes.push({
          id: acomp.id,
          nome: acomp.nome,
          token: tokenAcompanhante
        });
      }
    }

    res.json({
      tokenConvidado,
      tokensAcompanhantes,
      expiraEm: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) //30 dias
    });

  } catch (error) {
    console.error('Erro ao gerar credencial:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
