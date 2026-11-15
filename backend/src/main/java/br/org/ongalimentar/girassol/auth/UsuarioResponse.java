package br.org.ongalimentar.girassol.auth;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

/**
 * Representação do usuário autenticado devolvida por {@code /login} e {@code /me}.
 * O campo {@code permissions} traz as autoridades {@code MODULO:ACAO} que o front
 * usa nos guards; {@code cargos} traz os nomes dos cargos (ex.: {@code ADMINISTRADOR})
 * usados na saudação por cargo — ver frontend/src/api/auth.ts e auth/cargo.ts.
 */
public record UsuarioResponse(Long id, String email, String nome, List<String> permissions, List<String> cargos) {

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
				permissions,
				principal.getCargos());
	}
}
