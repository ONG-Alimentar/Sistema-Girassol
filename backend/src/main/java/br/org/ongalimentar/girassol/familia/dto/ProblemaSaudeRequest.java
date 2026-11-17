package br.org.ongalimentar.girassol.familia.dto;

import jakarta.validation.constraints.NotBlank;

public record ProblemaSaudeRequest(
        Long id,

        @NotBlank(message = "A descrição do problema de saúde é obrigatória.")
        String descricao,

        String gravidade
) {
}