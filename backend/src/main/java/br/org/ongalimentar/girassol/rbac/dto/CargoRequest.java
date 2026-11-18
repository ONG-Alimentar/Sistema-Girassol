package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;

public record CargoRequest(
		@NotBlank(message = "O nome é obrigatório.") String nome,
		Set<Long> permissaoIds) {
}
