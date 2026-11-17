package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.ProblemaSaude;

public record ProblemaSaudeResponse(
        Long id,
        String descricao,
        String gravidade
) {
    public static ProblemaSaudeResponse from(ProblemaSaude problema) {
        return new ProblemaSaudeResponse(
                problema.getId(),
                problema.getDescricao(),
                problema.getGravidade()
        );
    }
}