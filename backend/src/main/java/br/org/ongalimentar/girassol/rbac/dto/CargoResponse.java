package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Comparator;
import java.util.List;

import br.org.ongalimentar.girassol.rbac.Cargo;

public record CargoResponse(Long id, String nome, List<PermissaoResponse> permissoes, int totalUsuarios) {

	public static CargoResponse from(Cargo c) {
		List<PermissaoResponse> permissoes = c.getPermissoes().stream()
				.sorted(Comparator.comparing(p -> p.getCodigo()))
				.map(PermissaoResponse::from)
				.toList();
		return new CargoResponse(c.getId(), c.getNome(), permissoes, c.getUsuarios().size());
	}
}
