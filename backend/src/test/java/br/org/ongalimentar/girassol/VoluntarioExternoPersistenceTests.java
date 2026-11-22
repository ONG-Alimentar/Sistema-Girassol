package br.org.ongalimentar.girassol;

import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.voluntarioexterno.VoluntarioExterno;
import br.org.ongalimentar.girassol.voluntarioexterno.VoluntarioExternoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class VoluntarioExternoPersistenceTests {

	@Autowired
	private VoluntarioExternoRepository repository;

	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void createsSchemaAndPersistsVoluntarioExternoWithAllFields() {
		Usuario usuario = new Usuario(
				"Usuário Responsável",
				"responsavel-voluntario@girassol.org.br",
				"senha-hash"
		);
		entityManager.persist(usuario);

		VoluntarioExterno voluntario = new VoluntarioExterno(
				"12345678901",
				"João Voluntário"
		);
		voluntario.setCadastradoPor(usuario);
		voluntario.setContato("(11) 99999-9999");
		voluntario.setAtividades("Distribuição de cestas e apoio em eventos.");
		voluntario.setFrequencia("Semanal");
		voluntario.setAtivo(true);

		repository.save(voluntario);
		entityManager.flush();

		Long voluntarioId = voluntario.getId();

		entityManager.clear();

		VoluntarioExterno persistido = repository.findById(voluntarioId).orElseThrow();

		assertNotNull(persistido);
		assertNotNull(persistido.getId());
		assertEquals("12345678901", persistido.getCpf());
		assertEquals("João Voluntário", persistido.getNome());
		assertEquals("(11) 99999-9999", persistido.getContato());
		assertEquals("Distribuição de cestas e apoio em eventos.", persistido.getAtividades());
		assertEquals("Semanal", persistido.getFrequencia());
		assertEquals(true, persistido.getAtivo());
		assertNotNull(persistido.getCadastradoPor());
		assertEquals("Usuário Responsável", persistido.getCadastradoPor().getNome());
		assertEquals("responsavel-voluntario@girassol.org.br", persistido.getCadastradoPor().getEmail());
	}

	@Test
	void persistsVoluntarioExternoWithOptionalFieldsNull() {
		VoluntarioExterno voluntario = new VoluntarioExterno(
				"12345678902",
				"Maria Voluntária"
		);

		repository.save(voluntario);
		entityManager.flush();

		Long voluntarioId = voluntario.getId();

		entityManager.clear();

		VoluntarioExterno persistido = repository.findById(voluntarioId).orElseThrow();

		assertNotNull(persistido);
		assertEquals("12345678902", persistido.getCpf());
		assertEquals("Maria Voluntária", persistido.getNome());
		assertNull(persistido.getCadastradoPor());
		assertNull(persistido.getContato());
		assertNull(persistido.getAtividades());
		assertNull(persistido.getFrequencia());
		assertNull(persistido.getAtivo());
	}

	@Test
	void allowsUpdatingVoluntarioExternoMutableFields() {
		Usuario usuarioOriginal = new Usuario(
				"Usuário Original",
				"voluntario-original@girassol.org.br",
				"senha-hash"
		);
		entityManager.persist(usuarioOriginal);

		Usuario usuarioAtualizado = new Usuario(
				"Usuário Atualizado",
				"voluntario-atualizado@girassol.org.br",
				"senha-hash"
		);
		entityManager.persist(usuarioAtualizado);

		VoluntarioExterno voluntario = new VoluntarioExterno(
				"12345678903",
				"Carlos Voluntário"
		);
		voluntario.setCadastradoPor(usuarioOriginal);
		voluntario.setContato("(21) 98888-8888");
		voluntario.setAtividades("Apoio na triagem.");
		voluntario.setFrequencia("Mensal");
		voluntario.setAtivo(false);

		repository.save(voluntario);
		entityManager.flush();

		Long voluntarioId = voluntario.getId();

		voluntario.setCadastradoPor(usuarioAtualizado);
		voluntario.setContato("(21) 97777-7777");
		voluntario.setAtividades("Apoio na triagem e entrega de doações.");
		voluntario.setFrequencia("Quinzenal");
		voluntario.setAtivo(true);

		entityManager.flush();
		entityManager.clear();

		VoluntarioExterno persistido = repository.findById(voluntarioId).orElseThrow();

		assertNotNull(persistido);
		assertEquals("12345678903", persistido.getCpf());
		assertEquals("Carlos Voluntário", persistido.getNome());
		assertEquals("Usuário Atualizado", persistido.getCadastradoPor().getNome());
		assertEquals("voluntario-atualizado@girassol.org.br", persistido.getCadastradoPor().getEmail());
		assertEquals("(21) 97777-7777", persistido.getContato());
		assertEquals("Apoio na triagem e entrega de doações.", persistido.getAtividades());
		assertEquals("Quinzenal", persistido.getFrequencia());
		assertEquals(true, persistido.getAtivo());
	}

	@Test
	void gettersAndSettersWorkForAllAccessibleFields() {
		Usuario usuario = new Usuario(
				"Usuário Getter Setter",
				"getter-setter-voluntario@girassol.org.br",
				"senha-hash"
		);

		VoluntarioExterno voluntario = new VoluntarioExterno(
				"12345678904",
				"Ana Voluntária"
		);
		voluntario.setCadastradoPor(usuario);
		voluntario.setContato("(31) 96666-6666");
		voluntario.setAtividades("Organização do bazar.");
		voluntario.setFrequencia("Diária");
		voluntario.setAtivo(true);

		assertNull(voluntario.getId());
		assertEquals("12345678904", voluntario.getCpf());
		assertEquals("Ana Voluntária", voluntario.getNome());
		assertEquals(usuario, voluntario.getCadastradoPor());
		assertEquals("(31) 96666-6666", voluntario.getContato());
		assertEquals("Organização do bazar.", voluntario.getAtividades());
		assertEquals("Diária", voluntario.getFrequencia());
		assertEquals(true, voluntario.getAtivo());
	}

	@Test
	void allowsRemovingUsuarioFromVoluntarioExterno() {
		Usuario usuario = new Usuario(
				"Usuário Removível",
				"usuario-removivel-voluntario@girassol.org.br",
				"senha-hash"
		);
		entityManager.persist(usuario);

		VoluntarioExterno voluntario = new VoluntarioExterno(
				"12345678905",
				"Voluntário sem Usuário"
		);
		voluntario.setCadastradoPor(usuario);

		repository.save(voluntario);
		entityManager.flush();

		Long voluntarioId = voluntario.getId();

		voluntario.setCadastradoPor(null);

		entityManager.flush();
		entityManager.clear();

		VoluntarioExterno persistido = repository.findById(voluntarioId).orElseThrow();

		assertNotNull(persistido);
		assertNull(persistido.getCadastradoPor());
		assertEquals("12345678905", persistido.getCpf());
		assertEquals("Voluntário sem Usuário", persistido.getNome());
	}

	@Test
	void removesPersistedVoluntarioExterno() {
		VoluntarioExterno voluntario = new VoluntarioExterno(
				"12345678906",
				"Voluntário Removido"
		);

		repository.save(voluntario);
		entityManager.flush();

		Long voluntarioId = voluntario.getId();

		repository.delete(voluntario);
		repository.flush();

		assertFalse(repository.existsById(voluntarioId));
	}
}
