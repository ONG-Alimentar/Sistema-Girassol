package br.org.ongalimentar.girassol.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configuração de segurança do RBAC permission-based (ver {@code docs/seguranca/rbac.md}).
 *
 * <p>Defesa em profundidade: barreira grosseira no {@link SecurityFilterChain} (HTTP)
 * + barreira fina por método ({@code @EnableMethodSecurity} + {@code @PreAuthorize}
 * nos services). A autenticação é <b>por sessão (cookie)</b>, casando com o
 * {@code credentials: 'include'} do front.
 *
 * <p><b>CSRF desabilitado</b>: decisão consciente para o protótipo — o cliente SPA
 * não envia token CSRF. Reavaliar antes de um uso em produção com dados reais.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http,
			CorsConfigurationSource corsConfigurationSource) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
						.requestMatchers("/actuator/health").permitAll()
						.anyRequest().authenticated())
				// Sem sessão → 401 (e não o 403 padrão), para o /me do front distinguir
				// "não autenticado" de "autenticado sem permissão".
				.exceptionHandling(ex -> ex
						.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
				.formLogin(form -> form.disable())
				.httpBasic(basic -> basic.disable())
				// Logout é tratado no AuthController (invalida a sessão).
				.logout(logout -> logout.disable());
		return http.build();
	}

	@Bean
	AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
			PasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
		provider.setPasswordEncoder(passwordEncoder);
		return new ProviderManager(provider);
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of(
				"http://localhost:5173",            // Vite (dev)
				"https://ong-alimentar.github.io")); // GitHub Pages (prod)
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}
