package br.org.ongalimentar.girassol.familia.dto;

import jakarta.validation.constraints.NotBlank;

public record TelefoneRequest(
        Long id,

        @NotBlank(message = "O número do telefone é obrigatório.")
        String numero
) {
}