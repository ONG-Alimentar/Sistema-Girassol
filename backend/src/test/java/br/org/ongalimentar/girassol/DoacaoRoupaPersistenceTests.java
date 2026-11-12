package br.org.ongalimentar.girassol;

import br.org.ongalimentar.girassol.doacaoroupa.DoacaoRoupa;
import br.org.ongalimentar.girassol.doacaoroupa.DoacaoRoupaRepository;
import br.org.ongalimentar.girassol.doacaoroupa.PecaRoupa;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.Genero;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class DoacaoRoupaPersistenceTests {

	@Autowired
	private DoacaoRoupaRepository repository;

	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void createsSchemaAndPersistsDoacaoRoupaWithPecas() {
		Familia familia = new Familia();
		familia.setNome("Família Beneficiada");
		entityManager.persist(familia);

		DoacaoRoupa doacaoRoupa = new DoacaoRoupa();
		doacaoRoupa.setFamilia(familia);
		doacaoRoupa.setData(LocalDate.of(2026, 11, 8));
		doacaoRoupa.setQuantidade(3);

		PecaRoupa camiseta = new PecaRoupa("Camiseta");
		camiseta.setTamanho("M");
		camiseta.setGenero(Genero.MASCULINO);

		PecaRoupa calca = new PecaRoupa("Calça");
		calca.setTamanho("40");
		calca.setGenero(Genero.FEMININO);

		PecaRoupa casaco = new PecaRoupa("Casaco");
		casaco.setTamanho("G");
		casaco.setGenero(Genero.OUTRO);

		doacaoRoupa.addPecaRoupa(camiseta);
		doacaoRoupa.addPecaRoupa(calca);
		doacaoRoupa.addPecaRoupa(casaco);

		repository.save(doacaoRoupa);
		entityManager.flush();
		Long doacaoRoupaId = doacaoRoupa.getId();

		entityManager.clear();

		DoacaoRoupa persistida = repository.findById(doacaoRoupaId).orElseThrow();

		assertNotNull(persistida);
		assertEquals(LocalDate.of(2026, 11, 8), persistida.getData());
		assertEquals(3, persistida.getQuantidade());
		assertEquals("Família Beneficiada", persistida.getFamilia().getNome());
		assertEquals(3, persistida.getPecas().size());
		assertEquals("Camiseta", persistida.getPecas().getFirst().getDescricao());
		assertEquals("M", persistida.getPecas().getFirst().getTamanho());
		assertEquals(Genero.MASCULINO, persistida.getPecas().getFirst().getGenero());
		repository.delete(persistida);
		repository.flush();
		assertEquals(false, repository.existsById(doacaoRoupaId));
	}

	@Test
	void setsBidirectionalRelationshipWhenAddingPecaRoupaToDoacaoRoupa() {
		DoacaoRoupa doacaoRoupa = new DoacaoRoupa();
		PecaRoupa pecaRoupa = new PecaRoupa("Vestido");

		doacaoRoupa.addPecaRoupa(pecaRoupa);

		assertEquals(1, doacaoRoupa.getPecas().size());
		assertSame(doacaoRoupa, pecaRoupa.getDoacaoRoupa());
	}

	@Test
	void removesOrphanedPecaRoupaWhenRemovedFromDoacaoRoupa() {
		Familia familia = new Familia();
		familia.setNome("Família com doação de roupa");
		entityManager.persist(familia);

		PecaRoupa pecaRemovida = new PecaRoupa("Blusa");
		pecaRemovida.setTamanho("P");
		pecaRemovida.setGenero(Genero.FEMININO);

		PecaRoupa pecaMantida = new PecaRoupa("Bermuda");
		pecaMantida.setTamanho("M");
		pecaMantida.setGenero(Genero.MASCULINO);

		DoacaoRoupa doacaoRoupa = new DoacaoRoupa();
		doacaoRoupa.setFamilia(familia);
		doacaoRoupa.setQuantidade(2);
		doacaoRoupa.addPecaRoupa(pecaRemovida);
		doacaoRoupa.addPecaRoupa(pecaMantida);

		entityManager.persist(doacaoRoupa);
		entityManager.flush();

		Long pecaRemovidaId = pecaRemovida.getId();
		Long doacaoRoupaId = doacaoRoupa.getId();

		doacaoRoupa.removePecaRoupa(pecaRemovida);
		doacaoRoupa.setQuantidade(1);
		entityManager.flush();
		entityManager.clear();

		assertNull(entityManager.find(PecaRoupa.class, pecaRemovidaId));

		DoacaoRoupa persistida = entityManager.find(DoacaoRoupa.class, doacaoRoupaId);
		assertNotNull(persistida);
		assertEquals(1, persistida.getQuantidade());
		assertEquals(1, persistida.getPecas().size());
		assertEquals("Bermuda", persistida.getPecas().getFirst().getDescricao());
	}

	@Test
	void definesCurrentDateWhenDoacaoRoupaHasNoDate() {
		Familia familia = new Familia();
		familia.setNome("Família sem data informada");
		entityManager.persist(familia);

		DoacaoRoupa doacaoRoupa = new DoacaoRoupa();
		doacaoRoupa.setFamilia(familia);
		doacaoRoupa.setQuantidade(1);
		doacaoRoupa.addPecaRoupa(new PecaRoupa("Jaqueta"));

		entityManager.persist(doacaoRoupa);
		entityManager.flush();

		assertNotNull(doacaoRoupa.getData());
		assertEquals(LocalDate.now(), doacaoRoupa.getData());
	}

	@Test
	void setsBidirectionalRelationshipWhenAddingDoacaoRoupaToFamilia() {
		Familia familia = new Familia();
		familia.setNome("Família com vínculo de roupa");

		DoacaoRoupa doacaoRoupa = new DoacaoRoupa();
		doacaoRoupa.setQuantidade(1);

		familia.addDoacaoRoupa(doacaoRoupa);

		assertEquals(1, familia.getDoacoesRoupas().size());
		assertSame(familia, doacaoRoupa.getFamilia());
	}

	@Test
	void removesBidirectionalRelationshipWhenRemovingDoacaoRoupaFromFamilia() {
		Familia familia = new Familia();
		familia.setNome("Família com vínculo removido");

		DoacaoRoupa doacaoRoupa = new DoacaoRoupa();
		doacaoRoupa.setQuantidade(1);

		familia.addDoacaoRoupa(doacaoRoupa);
		familia.removeDoacaoRoupa(doacaoRoupa);

		assertEquals(0, familia.getDoacoesRoupas().size());
		assertNull(doacaoRoupa.getFamilia());
	}
}
