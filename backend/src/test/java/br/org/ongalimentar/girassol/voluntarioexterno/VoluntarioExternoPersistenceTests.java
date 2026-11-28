package br.org.ongalimentar.girassol.voluntarioexterno;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class VoluntarioExternoPersistenceTests {
	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void createsSchemaAndPersistsExternalVolunteer() {
		VoluntarioExterno voluntario = new VoluntarioExterno();
		voluntario.setNomeCompleto("Maria da Silva");
		voluntario.setContato("maria@example.org");
		voluntario.setFrequencia("Semanal");
		voluntario.setAtivo(true);
		voluntario.setAtividadesDesenvolvidas("Organização de doações");
		voluntario.setAreaAtuacao("Logística");

		entityManager.persist(voluntario);
		entityManager.flush();
		Long voluntarioId = voluntario.getId();

		entityManager.clear();

		VoluntarioExterno persistido = entityManager.find(VoluntarioExterno.class, voluntarioId);
		assertNotNull(persistido);
		assertEquals("Maria da Silva", persistido.getNomeCompleto());
		assertEquals("maria@example.org", persistido.getContato());
		assertEquals("Semanal", persistido.getFrequencia());
		assertTrue(persistido.isAtivo());
		assertEquals("Organização de doações", persistido.getAtividadesDesenvolvidas());
		assertEquals("Logística", persistido.getAreaAtuacao());
	}
}
