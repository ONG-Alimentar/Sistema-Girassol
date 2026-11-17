package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.Renda;
import br.org.ongalimentar.girassol.familia.SituacaoSocioeconomica;
import br.org.ongalimentar.girassol.familia.TipoMoradia;

public record SituacaoSocioeconomicaResponse(
        Long id,
        String profissao,
        String escolaridade,
        TipoMoradia tipoMoradia,
        Renda renda,
        String beneficio,
        Boolean acessoAlimentacao
) {
    public static SituacaoSocioeconomicaResponse from(
            SituacaoSocioeconomica situacao
    ) {
        if (situacao == null) {
            return null;
        }

        return new SituacaoSocioeconomicaResponse(
                situacao.getId(),
                situacao.getProfissao(),
                situacao.getEscolaridade(),
                situacao.getTipoMoradia(),
                situacao.getRenda(),
                situacao.getBeneficio(),
                situacao.getAcessoAlimentacao()
        );
    }
}