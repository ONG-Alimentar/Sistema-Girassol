package br.org.ongalimentar.girassol.familia.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record DependenteRequest(
        Long id,

        @NotBlank(message = "O nome do dependente é obrigatório.")
        String nome,

        LocalDate dataNascimento,
        String parentesco,
        String ocupacao
) {
}