package br.org.ongalimentar.girassol.familia.dto;

import jakarta.validation.constraints.NotBlank;

public record SubstanciaRequest(
        Long id,

        @NotBlank(message = "A descrição da substância é obrigatória.")
        String descricao
) {
}