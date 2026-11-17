package br.org.ongalimentar.girassol.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.junit.jupiter.api.Test;

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
