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
 * Valida o CRUD de {@code /api/permissoes} (administração RBAC, #3): ciclo
 * completo, filtro por código, validação do formato {@code MODULO:ACAO} (400) e a
 * barreira RBAC (403). Postgres real (Testcontainers) + MockMvc autenticado.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = { "PERMISSAO:READ", "PERMISSAO:CREATE", "PERMISSAO:UPDATE", "PERMISSAO:DELETE" })
class PermissaoCrudIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private PermissaoRepository repository;

	private MockMvc mvc;

	@BeforeEach
	void setup() {
		repository.deleteAll();
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	@Test
	void criaBuscaListaAtualizaEExclui() throws Exception {
		mvc.perform(post("/api/permissoes").contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"RELATORIO:READ\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.codigo").value("RELATORIO:READ"));

		Long id = repository.findByCodigo("RELATORIO:READ").orElseThrow().getId();

		mvc.perform(get("/api/permissoes/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.codigo").value("RELATORIO:READ"));

		mvc.perform(get("/api/permissoes"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].codigo").value("RELATORIO:READ"))
				.andExpect(jsonPath("$.totalElements").value(1));

		mvc.perform(put("/api/permissoes/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"RELATORIO:CREATE\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.codigo").value("RELATORIO:CREATE"));

		mvc.perform(delete("/api/permissoes/" + id)).andExpect(status().isNoContent());
		mvc.perform(get("/api/permissoes/" + id)).andExpect(status().isNotFound());
	}

	@Test
	void filtraPorCodigo() throws Exception {
		mvc.perform(post("/api/permissoes").contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"RELATORIO:READ\"}")).andExpect(status().isCreated());
		mvc.perform(post("/api/permissoes").contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"AUDITORIA:READ\"}")).andExpect(status().isCreated());

		mvc.perform(get("/api/permissoes").param("q", "relatorio"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].codigo").value("RELATORIO:READ"));
	}

	@Test
	void codigoEmFormatoInvalidoRetorna400() throws Exception {
		mvc.perform(post("/api/permissoes").contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"formato errado\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='codigo')]").exists());
	}

	@Test
	void buscaInexistenteRetorna404() throws Exception {
		mvc.perform(get("/api/permissoes/999999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value(containsString("não encontrad")));
	}

	@Test
	@WithMockUser(authorities = "PERMISSAO:READ")
	void semPermissaoDeCriarRetorna403() throws Exception {
		mvc.perform(post("/api/permissoes").contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigo\":\"RELATORIO:READ\"}"))
				.andExpect(status().isForbidden());
	}
}
