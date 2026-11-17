package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.Renda;
import br.org.ongalimentar.girassol.familia.TipoMoradia;

public record SituacaoSocioeconomicaRequest(
        String profissao,
        String escolaridade,
        TipoMoradia tipoMoradia,
        Renda renda,
        String beneficio,
        Boolean acessoAlimentacao
) {
}