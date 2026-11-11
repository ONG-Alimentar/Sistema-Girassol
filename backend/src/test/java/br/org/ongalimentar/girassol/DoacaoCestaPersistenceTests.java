package br.org.ongalimentar.girassol;

import br.org.ongalimentar.girassol.doacaocesta.DoacaoCesta;
import br.org.ongalimentar.girassol.doacaocesta.DoacaoCestaRepository;
import br.org.ongalimentar.girassol.doacaocesta.ItemCesta;
import br.org.ongalimentar.girassol.familia.Familia;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertSame;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class DoacaoCestaPersistenceTests {

	@Autowired
	private DoacaoCestaRepository repository;

	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void createsSchemaAndPersistsDoacaoCestaWithItems() {
		Familia familia = new Familia();
		familia.setNome("Família Beneficiada");
		entityManager.persist(familia);

		DoacaoCesta doacaoCesta = new DoacaoCesta();
		doacaoCesta.setFamilia(familia);
		doacaoCesta.setData(LocalDate.of(2026, 11, 8));
		doacaoCesta.addItem(new ItemCesta("Arroz", 1));
		doacaoCesta.addItem(new ItemCesta("Feijão", BigDecimal.valueOf(1.5)));
		doacaoCesta.addItem(new ItemCesta("Óleo", 1));

		repository.save(doacaoCesta);
		entityManager.flush();
		Long doacaoCestaId = doacaoCesta.getId();

		entityManager.clear();

		DoacaoCesta persistida = repository.findById(doacaoCestaId).orElseThrow();

		assertNotNull(persistida);
		assertEquals(LocalDate.of(2026, 11, 8), persistida.getData());
		assertEquals("Família Beneficiada", persistida.getFamilia().getNome());
		assertEquals(3, persistida.getItens().size());
		assertEquals("Arroz", persistida.getItens().getFirst().getDescricao());
		assertEquals(0, BigDecimal.ONE.compareTo(persistida.getItens().getFirst().getQuantidade()));
		assertEquals(0, BigDecimal.valueOf(1.5).compareTo(persistida.getItens().get(1).getQuantidade()));
		repository.delete(persistida);
		repository.flush();
		assertEquals(false, repository.existsById(doacaoCestaId));
	}

	@Test
	void setsBidirectionalRelationshipWhenAddingItemToDoacaoCesta() {
		DoacaoCesta doacaoCesta = new DoacaoCesta();
		ItemCesta item = new ItemCesta("Macarrão", 3);

		doacaoCesta.addItem(item);

		assertEquals(1, doacaoCesta.getItens().size());
		assertSame(doacaoCesta, item.getDoacaoCesta());
	}

	@Test
	void removesOrphanedItemWhenRemovedFromDoacaoCesta() {
		Familia familia = new Familia();
		familia.setNome("Família com doação");
		entityManager.persist(familia);

		ItemCesta itemRemovido = new ItemCesta("Farinha", BigDecimal.valueOf(1.5));

		DoacaoCesta doacaoCesta = new DoacaoCesta();
		doacaoCesta.setFamilia(familia);
		doacaoCesta.addItem(itemRemovido);
		doacaoCesta.addItem(new ItemCesta("Leite", 2));

		entityManager.persist(doacaoCesta);
		entityManager.flush();

		Long itemRemovidoId = itemRemovido.getId();

		doacaoCesta.removeItem(itemRemovido);
		entityManager.flush();
		entityManager.clear();

		assertNull(entityManager.find(ItemCesta.class, itemRemovidoId));

		DoacaoCesta persistida = entityManager.find(DoacaoCesta.class, doacaoCesta.getId());
		assertNotNull(persistida);
		assertEquals(1, persistida.getItens().size());
		assertEquals("Leite", persistida.getItens().getFirst().getDescricao());
	}

	@Test
	void definesCurrentDateWhenDoacaoCestaHasNoDate() {
		Familia familia = new Familia();
		familia.setNome("Família sem data informada");
		entityManager.persist(familia);

		DoacaoCesta doacaoCesta = new DoacaoCesta();
		doacaoCesta.setFamilia(familia);
		doacaoCesta.addItem(new ItemCesta("Açúcar", 1));

		entityManager.persist(doacaoCesta);
		entityManager.flush();

		assertNotNull(doacaoCesta.getData());
		assertEquals(LocalDate.now(), doacaoCesta.getData());
	}

	@Test
	void rejectsItemDoadoWithInvalidQuantity() {
		ItemCesta item = new ItemCesta();

		assertThrows(IllegalArgumentException.class, () -> item.setQuantidade(BigDecimal.ZERO));
		assertThrows(IllegalArgumentException.class, () -> item.setQuantidade(BigDecimal.valueOf(-1)));
	}
}
