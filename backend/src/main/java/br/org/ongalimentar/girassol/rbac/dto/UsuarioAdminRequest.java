package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioAdminRequest(
		@NotBlank(message = "O nome é obrigatório.") String nome,
		@NotBlank(message = "O e-mail é obrigatório.") @Email(message = "E-mail inválido.") String email,
		String senha,
		Set<Long> cargoIds,
		Boolean ativo) {
}
