package br.org.ongalimentar.girassol.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Disponibiliza um {@link PasswordEncoder} (BCrypt) para hashing de senha.
 *
 * <p>Deixa o hashing pronto (escopo da #18) para a #46 (backend de autenticação)
 * consumir, usando apenas {@code spring-security-crypto} — <b>sem</b> ligar o
 * {@code SecurityFilterChain} nem trancar endpoints, o que é responsabilidade da #46/#3.
 */
@Configuration
public class PasswordEncoderConfig {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
