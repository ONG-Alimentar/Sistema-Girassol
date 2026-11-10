package br.org.ongalimentar.girassol.rbac;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Valida o mapeamento das entidades RBAC contra um Postgres real (Testcontainers):
 * o grafo Usuario ↔ Cargo ↔ Permissao persiste e é recarregado pelas tabelas de
 * junção, e o {@link PasswordEncoder} hasheia a senha (critério da #18).
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class RbacEntidadesTest {

	@PersistenceContext
	private EntityManager em;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void persisteGrafoUsuarioCargoPermissao() {
		Permissao permissao = new Permissao("FAMILIA:CREATE");
		Cargo cargo = new Cargo("ADMINISTRADOR");
		cargo.adicionarPermissao(permissao);
		Usuario usuario = new Usuario("Admin", "admin@ong.org", "hash");
		usuario.adicionarCargo(cargo);

		em.persist(permissao);
		em.persist(cargo);
		em.persist(usuario);
		em.flush();
		em.clear();

		Usuario recarregado = em.find(Usuario.class, usuario.getId());
		assertEquals(1, recarregado.getCargos().size());

		Cargo cargoRecarregado = recarregado.getCargos().iterator().next();
		assertEquals("ADMINISTRADOR", cargoRecarregado.getNome());
		assertEquals(1, cargoRecarregado.getPermissoes().size());
		assertEquals("FAMILIA:CREATE",
				cargoRecarregado.getPermissoes().iterator().next().getCodigo());
	}

	@Test
	void hasheiaSenhaComBCrypt() {
		String hash = passwordEncoder.encode("senha-secreta");

		assertTrue(hash.startsWith("$2"), "deve ser um hash BCrypt");
		assertTrue(passwordEncoder.matches("senha-secreta", hash));
	}
}
