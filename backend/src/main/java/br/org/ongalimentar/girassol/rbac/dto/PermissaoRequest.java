package br.org.ongalimentar.girassol.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO de entrada (create/update) de uma {@link br.org.ongalimentar.girassol.rbac.Permissao}.
 * O código segue a convenção {@code MODULO:ACAO} (ver {@code docs/seguranca/rbac.md}).
 */
public record PermissaoRequest(
		@NotBlank(message = "O código é obrigatório.")
		@Pattern(regexp = "[A-Z_]+:[A-Z_]+", message = "O código deve seguir o formato MODULO:ACAO (maiúsculas).")
		String codigo) {
}
