package br.org.ongalimentar.girassol.rbac.dto;

import br.org.ongalimentar.girassol.rbac.Permissao;

/** DTO de saída de uma {@link Permissao}. */
public record PermissaoResponse(Long id, String codigo) {

	public static PermissaoResponse from(Permissao p) {
		return new PermissaoResponse(p.getId(), p.getCodigo());
	}
}
