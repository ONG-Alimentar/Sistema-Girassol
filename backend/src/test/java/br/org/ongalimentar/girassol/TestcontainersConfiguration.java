package br.org.ongalimentar.girassol;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Sobe um Postgres real (Docker) para os testes. {@code @ServiceConnection} liga
 * o datasource da aplicação a este container automaticamente — as migrations do
 * Flyway rodam contra ele no startup do contexto.
 *
 * Importe nos testes que precisam de banco: {@code @Import(TestcontainersConfiguration.class)}.
 */
@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfiguration {

	@Bean
	@ServiceConnection
	PostgreSQLContainer<?> postgresContainer() {
		return new PostgreSQLContainer<>(DockerImageName.parse("postgres:18"));
	}
}
