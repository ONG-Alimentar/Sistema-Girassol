package br.org.ongalimentar.girassol.familia;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

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
 * Valida o CRUD genérico (#29) através do exemplo {@code /api/familias}: ciclo
 * completo, formato paginado da listagem, formato de erro de validação (400) e
 * de não-encontrado (404), e a barreira RBAC (403). Usa Postgres real
 * (Testcontainers) e MockMvc autenticado via {@code @WithMockUser}.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = { "FAMILIA:READ", "FAMILIA:CREATE", "FAMILIA:UPDATE", "FAMILIA:DELETE" })
class FamiliaCrudIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private FamiliaRepository repository;

	private MockMvc mvc;

	private static final String UMA_FAMILIA = """
			{"nome":"Maria da Silva","cpf":"12345678900","email":"maria@exemplo.org","genero":"FEMININO"}
			""";

	@BeforeEach
	void setup() {
		repository.deleteAll();
		// Aplica o configurer de segurança para que @WithMockUser chegue ao filtro.
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	@Test
	void criaEListaNoFormatoPaginado() throws Exception {
		mvc.perform(post("/api/familias").contentType(MediaType.APPLICATION_JSON).content(UMA_FAMILIA))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.nome").value("Maria da Silva"));

		mvc.perform(get("/api/familias"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].nome").value("Maria da Silva"))
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.page").value(0))
				.andExpect(jsonPath("$.totalPages").value(1));
	}

	@Test
	void buscaAtualizaEExclui() throws Exception {
		Long id = criarRetornandoId();

		mvc.perform(get("/api/familias/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Maria da Silva"));

		mvc.perform(put("/api/familias/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Maria de Souza\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Maria de Souza"));

		mvc.perform(delete("/api/familias/" + id)).andExpect(status().isNoContent());
		mvc.perform(get("/api/familias/" + id)).andExpect(status().isNotFound());
	}

	@Test
	void filtraPorNomeOuCpf() throws Exception {
		criarRetornandoId();
		mvc.perform(post("/api/familias").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"João Pereira\",\"cpf\":\"99999999999\"}")).andExpect(status().isCreated());

		mvc.perform(get("/api/familias").param("q", "joão"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].nome").value("João Pereira"));
	}

	@Test
	void validacaoRetorna400ComErrosPorCampo() throws Exception {
		mvc.perform(post("/api/familias").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"\",\"email\":\"nao-e-email\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.fieldErrors").isArray())
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='nome')]").exists());
	}

	@Test
	void buscaInexistenteRetorna404NoFormatoApiError() throws Exception {
		mvc.perform(get("/api/familias/999999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value(containsString("não encontrad")))
				.andExpect(jsonPath("$.path").value("/api/familias/999999"));
	}

	@Test
	@WithMockUser(authorities = "FAMILIA:READ")
	void semPermissaoDeCriarRetorna403() throws Exception {
		mvc.perform(post("/api/familias").contentType(MediaType.APPLICATION_JSON).content(UMA_FAMILIA))
				.andExpect(status().isForbidden());
	}

	/** Cria "Maria da Silva" e devolve o id persistido (único, pois cada teste limpa o repo). */
	private Long criarRetornandoId() throws Exception {
		mvc.perform(post("/api/familias").contentType(MediaType.APPLICATION_JSON).content(UMA_FAMILIA))
				.andExpect(status().isCreated());
		return repository.findAll().get(0).getId();
	}
}
