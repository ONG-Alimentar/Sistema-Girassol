package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada (create/update) de {@link br.org.ongalimentar.girassol.rbac.Usuario}
 * pelas telas de administração (#3).
 *
 * <p>{@code senha} é obrigatória na <b>criação</b> e opcional na <b>edição</b>
 * (quando ausente/vazia, a senha atual é mantida) — por isso não leva
 * {@code @NotBlank}; a obrigatoriedade na criação é verificada no controller.
 * {@code cargoIds} define os cargos; {@code null} é tratado como conjunto vazio.
 * {@code ativo} ausente assume {@code true} na criação.
 */
public record UsuarioAdminRequest(
		@NotBlank(message = "O nome é obrigatório.") String nome,
		@NotBlank(message = "O e-mail é obrigatório.") @Email(message = "E-mail inválido.") String email,
		String senha,
		Set<Long> cargoIds,
		Boolean ativo) {
}
