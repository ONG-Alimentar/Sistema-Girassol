package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.Medicamento;

public record MedicamentoResponse(
        Long id,
        String descricao,
        String dosagem
) {
    public static MedicamentoResponse from(Medicamento medicamento) {
        return new MedicamentoResponse(
                medicamento.getId(),
                medicamento.getDescricao(),
                medicamento.getDosagem()
        );
    }
}