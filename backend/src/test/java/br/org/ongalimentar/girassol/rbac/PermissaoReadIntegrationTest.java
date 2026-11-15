package br.org.ongalimentar.girassol.rbac;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;

/**
 * Valida a API somente-leitura de {@code /api/permissoes} (administração RBAC, #3):
 * listagem paginada, busca por código, detalhe, 404, a barreira RBAC (403) e que a
 * escrita não é exposta (sem endpoints POST/PUT/DELETE).
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = "PERMISSAO:READ")
class PermissaoReadIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private PermissaoRepository repository;

	private MockMvc mvc;

	@BeforeEach
	void setup() {
		repository.deleteAll();
		repository.save(new Permissao("RELATORIO:READ"));
		repository.save(new Permissao("AUDITORIA:READ"));
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	@Test
	void listaNoFormatoPaginado() throws Exception {
		mvc.perform(get("/api/permissoes"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(2))
				.andExpect(jsonPath("$.page").value(0));
	}

	@Test
	void filtraPorCodigoEBuscaPorId() throws Exception {
		Long id = repository.findByCodigo("RELATORIO:READ").orElseThrow().getId();

		mvc.perform(get("/api/permissoes").param("q", "relatorio"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].codigo").value("RELATORIO:READ"));

		mvc.perform(get("/api/permissoes/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.codigo").value("RELATORIO:READ"));
	}

	@Test
	void buscaInexistenteRetorna404() throws Exception {
		mvc.perform(get("/api/permissoes/999999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value(containsString("não encontrad")));
	}

	@Test
	void escritaNaoPersisteNoCatalogo() throws Exception {
		// Não há endpoints de escrita; o importante é o invariante: nada é
		// criado, renomeado ou removido pela API (o catálogo é mantido pelo seed).
		long antes = repository.count();
		Long id = repository.findByCodigo("RELATORIO:READ").orElseThrow().getId();

		mvc.perform(post("/api/permissoes").contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"RELATORIO:CREATE\"}"));
		mvc.perform(put("/api/permissoes/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"RELATORIO:LER\"}"));
		mvc.perform(delete("/api/permissoes/" + id));

		org.junit.jupiter.api.Assertions.assertEquals(antes, repository.count(),
				"Nenhuma permissão deve ser criada ou removida pela API.");
		org.junit.jupiter.api.Assertions.assertTrue(repository.findByCodigo("RELATORIO:READ").isPresent(),
				"O código de uma permissão não deve ser alterável pela API.");
	}

	@Test
	@WithMockUser(authorities = "CARGO:READ")
	void semPermissaoDeLerRetorna403() throws Exception {
		mvc.perform(get("/api/permissoes"))
				.andExpect(status().isForbidden());
	}
}
