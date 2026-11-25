package br.org.ongalimentar.girassol;

import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.visita.Situacao;
import br.org.ongalimentar.girassol.visita.Turno;
import br.org.ongalimentar.girassol.visita.Visita;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class VisitaPersistenceTests {

	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void createsSchemaAndPersistsVisitaWithAllFields() {
		Usuario usuario = new Usuario(
			"Usuário Responsável",
			"responsavel-visita@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuario);

		Visita visita = new Visita(usuario, LocalDate.of(2026, 11, 21));
		visita.setTurno(Turno.MANHA);
		visita.setSituacao(Situacao.VULNERABILIDADE_SOCIAL);
		visita.setNome("João da Silva");
		visita.setIdade(35);
		visita.setContato("(11) 99999-9999");
		visita.setMotivoDaProcura("Solicitação de cesta básica");
		visita.setPedidoAtendido(true);
		visita.setObservacoes("Atendimento realizado com sucesso.");

		entityManager.persist(visita);
		entityManager.flush();

		Long visitaId = visita.getId();

		entityManager.clear();

		Visita persistida = entityManager.find(Visita.class, visitaId);

		assertNotNull(persistida);
		assertNotNull(persistida.getId());
		assertNotNull(persistida.getCriadoPor());
		assertEquals("Usuário Responsável", persistida.getCriadoPor().getNome());
		assertEquals("responsavel-visita@girassol.org.br", persistida.getCriadoPor().getEmail());
		assertEquals(Turno.MANHA, persistida.getTurno());
		assertEquals(Situacao.VULNERABILIDADE_SOCIAL, persistida.getSituacao());
		assertEquals(LocalDate.of(2026, 11, 21), persistida.getData());
		assertEquals("João da Silva", persistida.getNome());
		assertEquals(35, persistida.getIdade());
		assertEquals("(11) 99999-9999", persistida.getContato());
		assertEquals("Solicitação de cesta básica", persistida.getMotivoDaProcura());
		assertEquals(true, persistida.getPedidoAtendido());
		assertEquals("Atendimento realizado com sucesso.", persistida.getObservacoes());
	}

	@Test
	void persistsVisitaWithOptionalFieldsNull() {
		Usuario usuario = new Usuario(
			"Usuário Visita Opcional",
			"visita-opcional@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuario);

		Visita visita = new Visita(usuario, LocalDate.of(2026, 11, 22));

		entityManager.persist(visita);
		entityManager.flush();

		Long visitaId = visita.getId();

		entityManager.clear();

		Visita persistida = entityManager.find(Visita.class, visitaId);

		assertNotNull(persistida);
		assertNotNull(persistida.getCriadoPor());
		assertEquals(LocalDate.of(2026, 11, 22), persistida.getData());
		assertNull(persistida.getTurno());
		assertNull(persistida.getSituacao());
		assertNull(persistida.getNome());
		assertNull(persistida.getIdade());
		assertNull(persistida.getContato());
		assertNull(persistida.getMotivoDaProcura());
		assertNull(persistida.getPedidoAtendido());
		assertNull(persistida.getObservacoes());
	}

	@Test
	void allowsUpdatingAllVisitaFields() {
		Usuario usuarioOriginal = new Usuario(
			"Usuário Original",
			"visita-original@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuarioOriginal);

		Usuario usuarioAtualizado = new Usuario(
			"Usuário Atualizado",
			"visita-atualizado@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuarioAtualizado);

		Visita visita = new Visita(usuarioOriginal, LocalDate.of(2026, 11, 23));
		visita.setTurno(Turno.TARDE);
		visita.setSituacao(Situacao.MORADOR_DE_RUA);
		visita.setNome("Maria Souza");
		visita.setIdade(42);
		visita.setContato("(21) 98888-8888");
		visita.setMotivoDaProcura("Pedido inicial");
		visita.setPedidoAtendido(false);
		visita.setObservacoes("Aguardando retorno.");

		entityManager.persist(visita);
		entityManager.flush();

		Long visitaId = visita.getId();

		visita.setCriadoPor(usuarioAtualizado);
		visita.setTurno(Turno.NOITE);
		visita.setSituacao(Situacao.OUTRO);
		visita.setData(LocalDate.of(2026, 11, 24));
		visita.setNome("Maria Souza Atualizada");
		visita.setIdade(43);
		visita.setContato("(21) 97777-7777");
		visita.setMotivoDaProcura("Pedido atualizado");
		visita.setPedidoAtendido(true);
		visita.setObservacoes("Pedido atendido.");

		entityManager.flush();
		entityManager.clear();

		Visita persistida = entityManager.find(Visita.class, visitaId);

		assertNotNull(persistida);
		assertEquals("Usuário Atualizado", persistida.getCriadoPor().getNome());
		assertEquals("visita-atualizado@girassol.org.br", persistida.getCriadoPor().getEmail());
		assertEquals(Turno.NOITE, persistida.getTurno());
		assertEquals(Situacao.OUTRO, persistida.getSituacao());
		assertEquals(LocalDate.of(2026, 11, 24), persistida.getData());
		assertEquals("Maria Souza Atualizada", persistida.getNome());
		assertEquals(43, persistida.getIdade());
		assertEquals("(21) 97777-7777", persistida.getContato());
		assertEquals("Pedido atualizado", persistida.getMotivoDaProcura());
		assertEquals(true, persistida.getPedidoAtendido());
		assertEquals("Pedido atendido.", persistida.getObservacoes());
	}

	@Test
	void gettersAndSettersWorkForAllFields() {
		Usuario usuario = new Usuario(
			"Usuário Getter Setter",
			"getter-setter-visita@girassol.org.br",
			"senha-hash"
		);

		Visita visita = new Visita(usuario, LocalDate.of(2026, 11, 25));
		visita.setTurno(Turno.TARDE);
		visita.setSituacao(Situacao.OUTRO);
		visita.setNome("Carlos Oliveira");
		visita.setIdade(50);
		visita.setContato("(31) 96666-6666");
		visita.setMotivoDaProcura("Orientação social");
		visita.setPedidoAtendido(false);
		visita.setObservacoes("Encaminhado para avaliação.");

		assertNull(visita.getId());
		assertEquals(usuario, visita.getCriadoPor());
		assertEquals(Turno.TARDE, visita.getTurno());
		assertEquals(Situacao.OUTRO, visita.getSituacao());
		assertEquals(LocalDate.of(2026, 11, 25), visita.getData());
		assertEquals("Carlos Oliveira", visita.getNome());
		assertEquals(50, visita.getIdade());
		assertEquals("(31) 96666-6666", visita.getContato());
		assertEquals("Orientação social", visita.getMotivoDaProcura());
		assertEquals(false, visita.getPedidoAtendido());
		assertEquals("Encaminhado para avaliação.", visita.getObservacoes());
	}

	@Test
	void persistsAllTurnoEnumValues() {
		Usuario usuario = new Usuario(
			"Usuário Turnos",
			"turnos-visita@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuario);

		Visita visitaManha = criarVisitaComCamposObrigatorios(usuario, LocalDate.of(2026, 11, 26));
		visitaManha.setTurno(Turno.MANHA);

		Visita visitaTarde = criarVisitaComCamposObrigatorios(usuario, LocalDate.of(2026, 11, 27));
		visitaTarde.setTurno(Turno.TARDE);

		Visita visitaNoite = criarVisitaComCamposObrigatorios(usuario, LocalDate.of(2026, 11, 28));
		visitaNoite.setTurno(Turno.NOITE);

		entityManager.persist(visitaManha);
		entityManager.persist(visitaTarde);
		entityManager.persist(visitaNoite);
		entityManager.flush();

		Long visitaManhaId = visitaManha.getId();
		Long visitaTardeId = visitaTarde.getId();
		Long visitaNoiteId = visitaNoite.getId();

		entityManager.clear();

		assertEquals(Turno.MANHA, entityManager.find(Visita.class, visitaManhaId).getTurno());
		assertEquals(Turno.TARDE, entityManager.find(Visita.class, visitaTardeId).getTurno());
		assertEquals(Turno.NOITE, entityManager.find(Visita.class, visitaNoiteId).getTurno());
	}

	@Test
	void persistsAllSituacaoEnumValues() {
		Usuario usuario = new Usuario(
			"Usuário Situações",
			"situacoes-visita@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuario);

		Visita visitaMoradorRua = criarVisitaComCamposObrigatorios(usuario, LocalDate.of(2026, 11, 29));
		visitaMoradorRua.setSituacao(Situacao.MORADOR_DE_RUA);

		Visita visitaVulnerabilidade = criarVisitaComCamposObrigatorios(usuario, LocalDate.of(2026, 11, 30));
		visitaVulnerabilidade.setSituacao(Situacao.VULNERABILIDADE_SOCIAL);

		Visita visitaOutro = criarVisitaComCamposObrigatorios(usuario, LocalDate.of(2026, 12, 1));
		visitaOutro.setSituacao(Situacao.OUTRO);

		entityManager.persist(visitaMoradorRua);
		entityManager.persist(visitaVulnerabilidade);
		entityManager.persist(visitaOutro);
		entityManager.flush();

		Long visitaMoradorRuaId = visitaMoradorRua.getId();
		Long visitaVulnerabilidadeId = visitaVulnerabilidade.getId();
		Long visitaOutroId = visitaOutro.getId();

		entityManager.clear();

		assertEquals(Situacao.MORADOR_DE_RUA, entityManager.find(Visita.class, visitaMoradorRuaId).getSituacao());
		assertEquals(Situacao.VULNERABILIDADE_SOCIAL, entityManager.find(Visita.class, visitaVulnerabilidadeId).getSituacao());
		assertEquals(Situacao.OUTRO, entityManager.find(Visita.class, visitaOutroId).getSituacao());
	}

	@Test
	void removesPersistedVisita() {
		Usuario usuario = new Usuario(
			"Usuário Remoção",
			"visita-remocao@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuario);

		Visita visita = criarVisitaComCamposObrigatorios(usuario, LocalDate.of(2026, 12, 2));

		entityManager.persist(visita);
		entityManager.flush();

		Long visitaId = visita.getId();

		entityManager.remove(visita);
		entityManager.flush();
		entityManager.clear();

		assertNull(entityManager.find(Visita.class, visitaId));
	}

	private Visita criarVisitaComCamposObrigatorios(Usuario usuario, LocalDate data) {
		return new Visita(usuario, data);
	}
}
