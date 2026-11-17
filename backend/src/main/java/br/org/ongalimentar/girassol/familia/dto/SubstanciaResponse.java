package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.Substancia;

public record SubstanciaResponse(
        Long id,
        String descricao
) {
    public static SubstanciaResponse from(Substancia substancia) {
        return new SubstanciaResponse(
                substancia.getId(),
                substancia.getDescricao()
        );
    }
}