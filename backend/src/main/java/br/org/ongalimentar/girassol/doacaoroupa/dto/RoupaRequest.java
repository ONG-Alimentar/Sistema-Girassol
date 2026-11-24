package br.org.ongalimentar.girassol.doacaoroupa.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de entrada (create/update) de uma {@link br.org.ongalimentar.girassol.doacaoroupa.DoacaoRoupa}.
 * A {@code data} é opcional (quando ausente, o backend usa a data atual) e {@code pecas}
 * também é opcional — a quantidade total é informada separadamente em {@code quantidade}.
 */
public record RoupaRequest(
		@NotNull(message = "A família é obrigatória.") Long familiaId,
		LocalDate data,
		@Min(value = 1, message = "A quantidade deve ser maior que zero.") int quantidade,
		@Valid List<PecaRoupaRequest> pecas) {
}
