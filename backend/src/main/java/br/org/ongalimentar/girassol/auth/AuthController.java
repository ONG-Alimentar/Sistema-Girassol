package br.org.ongalimentar.girassol.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Endpoints de autenticação consumidos pelo front (frontend/src/api/auth.ts):
 * {@code POST /api/auth/login}, {@code POST /api/auth/logout} e
 * {@code GET /api/auth/me}. Autenticação por sessão (cookie).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final SecurityContextHolderStrategy securityContextHolderStrategy =
			SecurityContextHolder.getContextHolderStrategy();
	private final SecurityContextRepository securityContextRepository =
			new HttpSessionSecurityContextRepository();

	public AuthController(AuthenticationManager authenticationManager) {
		this.authenticationManager = authenticationManager;
	}

	@PostMapping("/login")
	public UsuarioResponse login(@RequestBody LoginRequest credenciais,
			HttpServletRequest request, HttpServletResponse response) {
		try {
			Authentication authentication = authenticationManager.authenticate(
					UsernamePasswordAuthenticationToken.unauthenticated(
							credenciais.email(), credenciais.senha()));

			// Persiste o contexto na sessão → o cookie autentica as próximas chamadas.
			SecurityContext context = securityContextHolderStrategy.createEmptyContext();
			context.setAuthentication(authentication);
			securityContextHolderStrategy.setContext(context);
			securityContextRepository.saveContext(context, request, response);

			return UsuarioResponse.from(authentication);
		} catch (AuthenticationException ex) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
		}
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		securityContextHolderStrategy.clearContext();
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public UsuarioResponse me(Authentication authentication) {
		// Sem sessão, o SecurityFilterChain já respondeu 401 antes de chegar aqui.
		return UsuarioResponse.from(authentication);
	}
}
