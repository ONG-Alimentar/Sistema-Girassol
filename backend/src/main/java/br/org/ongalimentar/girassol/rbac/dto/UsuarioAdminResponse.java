package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Comparator;
import java.util.List;

import br.org.ongalimentar.girassol.rbac.Usuario;

public record UsuarioAdminResponse(Long id, String nome, String email, boolean ativo, List<CargoResumo> cargos) {

	public record CargoResumo(Long id, String nome) {
	}

	public static UsuarioAdminResponse from(Usuario u) {
		List<CargoResumo> cargos = u.getCargos().stream()
				.sorted(Comparator.comparing(c -> c.getNome()))
				.map(c -> new CargoResumo(c.getId(), c.getNome()))
				.toList();
		return new UsuarioAdminResponse(u.getId(), u.getNome(), u.getEmail(), u.isAtivo(), cargos);
	}
}
