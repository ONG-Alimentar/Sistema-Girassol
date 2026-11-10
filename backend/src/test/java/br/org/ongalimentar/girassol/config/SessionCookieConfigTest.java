package br.org.ongalimentar.girassol.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.junit.jupiter.api.Test;

/**
 * Guarda de regressão para o cookie de sessão em ambiente cross-site.
 *
 * <p>Em produção o front (GitHub Pages) e o backend (Render) estão em origens
 * diferentes, então o cookie de sessão só é aceito/enviado pelo browser com
 * {@code SameSite=None} + {@code Secure}. Já houve regressão em que o valor
 * {@code Lax} derrubava a autenticação em prod (o browser descartava o cookie
 * do login cross-site) — este teste existe para impedir que isso volte.
 *
 * <p>É um teste de arquivo (lê o classpath), de propósito: valida os valores
 * exatos dos properties sem subir o contexto Spring nem o banco, mantendo-o
 * rápido no {@code ./mvnw verify} do CI. O profile base ({@code application.properties})
 * é o que vale em prod (não há {@code application-prod.properties}); o profile
 * {@code dev} sobrescreve para o cenário same-site/HTTP local.
 */
class SessionCookieConfigTest {

	private static final String SAME_SITE = "server.servlet.session.cookie.same-site";
	private static final String SECURE = "server.servlet.session.cookie.secure";
	private static final String HTTP_ONLY = "server.servlet.session.cookie.http-only";

	private static Properties load(String resource) {
		Properties props = new Properties();
		try (InputStream in = SessionCookieConfigTest.class.getClassLoader().getResourceAsStream(resource)) {
			assertThat(in).as("recurso %s no classpath", resource).isNotNull();
			props.load(in);
		} catch (IOException e) {
			throw new IllegalStateException("Falha ao ler " + resource, e);
		}
		return props;
	}

	@Test
	void prodUsaCookieCrossSite() {
		// application.properties (base) é o que vale em prod: cross-site exige
		// SameSite=None + Secure, senão o browser descarta o cookie de sessão.
		Properties prod = load("application.properties");

		assertThat(prod.getProperty(SAME_SITE))
				.as("cookie de sessão em prod precisa de SameSite=None (cross-site Pages↔Render)")
				.isEqualTo("none");
		assertThat(prod.getProperty(SECURE))
				.as("SameSite=None exige Secure para o browser aceitar o cookie")
				.isEqualTo("true");
		assertThat(prod.getProperty(HTTP_ONLY))
				.as("cookie de sessão deve permanecer HttpOnly")
				.isEqualTo("true");
	}

	@Test
	void devMantemSameSiteLaxSemSecure() {
		// Dev é same-site (localhost) e sem HTTPS: Secure impediria o cookie.
		Properties dev = load("application-dev.properties");

		assertThat(dev.getProperty(SAME_SITE))
				.as("dev é same-site/HTTP: SameSite=Lax")
				.isEqualTo("lax");
		assertThat(dev.getProperty(SECURE))
				.as("dev é HTTP: Secure=false para o cookie não ser descartado")
				.isEqualTo("false");
	}
}
