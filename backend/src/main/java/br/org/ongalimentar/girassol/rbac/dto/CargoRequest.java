package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de entrada (create/update) de um {@link br.org.ongalimentar.girassol.rbac.Cargo}.
 * {@code permissaoIds} define o conjunto de permissões do cargo; {@code null} é
 * tratado como conjunto vazio (cargo sem permissões).
 */
public record CargoRequest(
		@NotBlank(message = "O nome é obrigatório.") String nome,
		Set<Long> permissaoIds) {
}
