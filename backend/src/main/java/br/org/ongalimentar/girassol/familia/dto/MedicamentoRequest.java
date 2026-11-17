package br.org.ongalimentar.girassol.familia.dto;

import jakarta.validation.constraints.NotBlank;

public record MedicamentoRequest(
        Long id,

        @NotBlank(message = "A descrição do medicamento é obrigatória.")
        String descricao,

        String dosagem
) {
}