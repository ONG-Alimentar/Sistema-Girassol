package br.org.ongalimentar.girassol.rbac.dto;

import java.util.Comparator;
import java.util.List;

import br.org.ongalimentar.girassol.rbac.Usuario;

/**
 * DTO de saída de {@link Usuario} para a administração (#3). Nunca expõe o hash
 * da senha. Os cargos devem estar inicializados pelo service antes da conversão
 * ({@code open-in-view=false}).
 */
public record UsuarioAdminResponse(Long id, String nome, String email, boolean ativo, List<CargoResumo> cargos) {

	/** Resumo do cargo para listar/exibir no usuário (sem as permissões). */
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
