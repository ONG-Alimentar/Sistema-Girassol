package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.Servico;

public record ServicoResponse(
        Long id,
        String nome
) {
    public static ServicoResponse from(Servico servico) {
        return new ServicoResponse(
                servico.getId(),
                servico.getNome()
        );
    }
}