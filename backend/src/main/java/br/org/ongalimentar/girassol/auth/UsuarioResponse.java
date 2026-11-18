package br.org.ongalimentar.girassol.auth;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

public record UsuarioResponse(Long id, String email, String nome, List<String> permissions, List<String> cargos) {

	public static UsuarioResponse from(Authentication authentication) {
		AppUserDetails principal = (AppUserDetails) authentication.getPrincipal();

		List<String> permissions = principal.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.sorted()
				.toList();
		return new UsuarioResponse(
				principal.getId(),
				principal.getEmail(),
				principal.getNome(),
				permissions,
				principal.getCargos());
	}
}
