package br.org.ongalimentar.girassol.auth;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

/**
 * Representação do usuário autenticado devolvida por {@code /login} e {@code /me}.
 * O campo {@code permissions} traz as autoridades {@code MODULO:ACAO} que o front
 * usa nos guards — ver frontend/src/api/auth.ts.
 */
public record UsuarioResponse(Long id, String email, String nome, List<String> permissions) {

	public static UsuarioResponse from(Authentication authentication) {
		AppUserDetails principal = (AppUserDetails) authentication.getPrincipal();
		// Lê do principal, não do Authentication: este último pode conter
		// autoridades sintéticas do Spring Security (ex.: FACTOR_PASSWORD) que não
		// são permissões do RBAC.
		List<String> permissions = principal.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.sorted()
				.toList();
		return new UsuarioResponse(
				principal.getId(),
				principal.getEmail(),
				principal.getNome(),
				permissions);
	}
}
