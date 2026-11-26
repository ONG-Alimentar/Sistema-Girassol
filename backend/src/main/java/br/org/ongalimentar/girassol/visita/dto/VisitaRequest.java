package br.org.ongalimentar.girassol.visita.dto;

import java.time.LocalDate;

import br.org.ongalimentar.girassol.visita.Situacao;
import br.org.ongalimentar.girassol.visita.Turno;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VisitaRequest(
		@NotNull(message = "A data é obrigatória.") LocalDate data,
		Turno turno,
		@NotBlank(message = "O nome é obrigatório.")
		@Size(max = 255, message = "O nome deve ter até 255 caracteres.") String nome,
		@Min(value = 0, message = "A idade não pode ser negativa.") Integer idade,
		@Size(max = 255, message = "O contato deve ter até 255 caracteres.") String contato,
		Situacao situacao,
		@Size(max = 1000, message = "O motivo deve ter até 1000 caracteres.") String motivoDaProcura,
		Boolean pedidoAtendido,
		@Size(max = 2000, message = "As observações devem ter até 2000 caracteres.") String observacoes) {
}
