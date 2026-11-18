package br.org.ongalimentar.girassol.doacaocesta.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de entrada (create/update) de uma {@link br.org.ongalimentar.girassol.doacaocesta.DoacaoCesta}.
 * A {@code data} é opcional (quando ausente, o backend usa a data atual).
 */
public record CestaRequest(
		@NotNull(message = "A família é obrigatória.") Long familiaId,
		LocalDate data,
		@NotEmpty(message = "Informe ao menos um item.")
		@Valid List<ItemCestaRequest> itens) {
}
