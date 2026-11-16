package br.org.ongalimentar.girassol.doacaocesta.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Item de uma doação de cesta (descrição + quantidade). */
public record ItemCestaRequest(
		@NotBlank(message = "A descrição do item é obrigatória.") String descricao,
		@NotNull(message = "A quantidade é obrigatória.")
		@DecimalMin(value = "0.0", inclusive = false, message = "A quantidade deve ser maior que zero.")
		BigDecimal quantidade) {
}
