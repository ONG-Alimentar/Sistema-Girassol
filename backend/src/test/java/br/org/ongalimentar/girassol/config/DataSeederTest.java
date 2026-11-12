package br.org.ongalimentar.girassol.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;
import br.org.ongalimentar.girassol.rbac.CargoRepository;
import br.org.ongalimentar.girassol.rbac.PermissaoRepository;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

/**
 * Smoke test do seed RBAC: com o profile {@code dev} ativo, o {@link DataSeeder}
 * roda no startup e popula o catálogo de permissões, os cargos e o admin de dev
 * sem erro. (No profile padrão dos demais testes o seeder não roda.)
 */
@SpringBootTest
@ActiveProfiles("dev")
@Import(TestcontainersConfiguration.class)
class DataSeederTest {

	@Autowired
	private PermissaoRepository permissaoRepository;
	@Autowired
	private CargoRepository cargoRepository;
	@Autowired
	private UsuarioRepository usuarioRepository;

	@Test
	void seedPopulaCatalogoCargosEAdmin() {
		// Catálogo completo (espelha frontend/src/auth/permissions.ts).
		assertEquals(38, permissaoRepository.count());

		assertTrue(cargoRepository.findByNome("ADMINISTRADOR").isPresent());
		assertTrue(cargoRepository.findByNome("ASSISTENTE_SOCIAL").isPresent());
		assertTrue(cargoRepository.findByNome("VOLUNTARIO_INTERNO").isPresent());
		assertTrue(cargoRepository.findByNome("ADVOGADA").isPresent());
		assertTrue(cargoRepository.findByNome("PSICOLOGO").isPresent());

		// Admin de dev criado (app.seed.admin=true no profile dev).
		assertTrue(usuarioRepository.existsByEmail("admin@ong.org"));
	}
}
