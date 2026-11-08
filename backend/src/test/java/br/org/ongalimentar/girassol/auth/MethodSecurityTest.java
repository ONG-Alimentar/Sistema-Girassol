package br.org.ongalimentar.girassol.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;

/**
 * Autorização por método (defesa em profundidade), com foco no isolamento
 * jurídico/psicológico (LGPD): quem tem a autoridade acessa; a assistente social,
 * que não a possui, é barrada.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class MethodSecurityTest {

	@Autowired
	private SegurancaDemoService service;

	@Test
	@WithMockUser(authorities = "JURIDICO:READ")
	void advogadaLeAtendimentoJuridico() {
		assertEquals("conteudo-juridico-sigiloso", service.lerAtendimentoJuridico());
	}

	@Test
	@WithMockUser(authorities = "PSICOLOGICO:READ")
	void psicologoLeAtendimentoPsicologico() {
		assertEquals("conteudo-psicologico-sigiloso", service.lerAtendimentoPsicologico());
	}

	@Test
	@WithMockUser(authorities = { "FAMILIA:READ", "CESTA:READ", "VISITA:READ" })
	void assistenteSocialNaoAcessaDadosSigilosos() {
		assertThrows(AccessDeniedException.class, service::lerAtendimentoJuridico);
		assertThrows(AccessDeniedException.class, service::lerAtendimentoPsicologico);
	}

	@Test
	@WithMockUser(authorities = "JURIDICO:READ")
	void advogadaNaoAcessaPsicologico() {
		assertThrows(AccessDeniedException.class, service::lerAtendimentoPsicologico);
	}
}
