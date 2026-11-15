package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Comparator;
import java.util.List;

import br.org.ongalimentar.girassol.rbac.Cargo;

/**
 * DTO de saída de um {@link Cargo}, com suas permissões (ordenadas por código) e
 * a contagem de usuários vinculados. As coleções devem estar inicializadas pelo
 * service antes da conversão ({@code open-in-view=false}).
 */
public record CargoResponse(Long id, String nome, List<PermissaoResponse> permissoes, int totalUsuarios) {

	public static CargoResponse from(Cargo c) {
		List<PermissaoResponse> permissoes = c.getPermissoes().stream()
				.sorted(Comparator.comparing(p -> p.getCodigo()))
				.map(PermissaoResponse::from)
				.toList();
		return new CargoResponse(c.getId(), c.getNome(), permissoes, c.getUsuarios().size());
	}
}
