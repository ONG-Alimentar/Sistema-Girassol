package br.org.ongalimentar.girassol.familia.dto;

import java.time.LocalDate;

import br.org.ongalimentar.girassol.familia.Dependente;

public record DependenteResponse(
        Long id,
        String nome,
        LocalDate dataNascimento,
        String parentesco,
        String ocupacao
) {
    public static DependenteResponse from(Dependente dependente) {
        return new DependenteResponse(
                dependente.getId(),
                dependente.getNome(),
                dependente.getDataNascimento(),
                dependente.getParentesco(),
                dependente.getOcupacao()
        );
    }
}