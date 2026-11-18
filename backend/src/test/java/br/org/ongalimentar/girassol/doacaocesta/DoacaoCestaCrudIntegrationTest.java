package br.org.ongalimentar.girassol.doacaocesta;

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
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.FamiliaRepository;

/**
 * Valida o CRUD de {@code /api/cestas}: ciclo completo com itens aninhados,
 * resolução da família no response, filtro por família, formato paginado,
 * validação (400), não-encontrado (404) e a barreira RBAC (403). Usa Postgres
 * real (Testcontainers) e MockMvc autenticado via {@code @WithMockUser}.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = { "CESTA:READ", "CESTA:CREATE", "CESTA:UPDATE", "CESTA:DELETE" })
class DoacaoCestaCrudIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private DoacaoCestaRepository repository;
	@Autowired
	private FamiliaRepository familiaRepository;

	private MockMvc mvc;
	private Long familiaId;

	@BeforeEach
	void setup() {
		repository.deleteAll();
		familiaRepository.deleteAll();
		Familia familia = new Familia();
		familia.setNome("Família Apoio");
		familiaId = familiaRepository.save(familia).getId();
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	private String umaCesta() {
		return """
				{"familiaId":%d,"data":"2026-03-10","itens":[
					{"descricao":"Arroz","quantidade":2},
					{"descricao":"Feijão","quantidade":1.5}
				]}
				""".formatted(familiaId);
	}

	@Test
	void criaEListaNoFormatoPaginadoComFamiliaResolvida() throws Exception {
		mvc.perform(post("/api/cestas").contentType(MediaType.APPLICATION_JSON).content(umaCesta()))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.familiaId").value(familiaId))
				.andExpect(jsonPath("$.familiaNome").value("Família Apoio"))
				.andExpect(jsonPath("$.itens.length()").value(2));

		mvc.perform(get("/api/cestas"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].familiaNome").value("Família Apoio"))
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.page").value(0));
	}

	@Test
	void buscaAtualizaItensEExclui() throws Exception {
		Long id = criarRetornandoId();

		mvc.perform(get("/api/cestas/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.itens.length()").value(2));

		// Atualiza substituindo os itens por um só.
		mvc.perform(put("/api/cestas/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"familiaId":%d,"data":"2026-03-11","itens":[{"descricao":"Óleo","quantidade":1}]}
						""".formatted(familiaId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.itens.length()").value(1))
				.andExpect(jsonPath("$.itens[0].descricao").value("Óleo"));

		mvc.perform(delete("/api/cestas/" + id)).andExpect(status().isNoContent());
		mvc.perform(get("/api/cestas/" + id)).andExpect(status().isNotFound());
	}

	@Test
	void filtraPorFamilia() throws Exception {
		criarRetornandoId();
		Familia outra = new Familia();
		outra.setNome("Outra Família");
		Long outraId = familiaRepository.save(outra).getId();

		mvc.perform(get("/api/cestas").param("familia", String.valueOf(outraId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));

		mvc.perform(get("/api/cestas").param("familia", String.valueOf(familiaId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1));
	}

	@Test
	void validacaoRetorna400QuandoSemItens() throws Exception {
		mvc.perform(post("/api/cestas").contentType(MediaType.APPLICATION_JSON)
				.content("{\"familiaId\":%d,\"itens\":[]}".formatted(familiaId)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='itens')]").exists());
	}

	@Test
	void buscaInexistenteRetorna404NoFormatoApiError() throws Exception {
		mvc.perform(get("/api/cestas/999999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value(containsString("não encontrad")))
				.andExpect(jsonPath("$.path").value("/api/cestas/999999"));
	}

	@Test
	@WithMockUser(authorities = "CESTA:READ")
	void semPermissaoDeCriarRetorna403() throws Exception {
		mvc.perform(post("/api/cestas").contentType(MediaType.APPLICATION_JSON).content(umaCesta()))
				.andExpect(status().isForbidden());
	}

	private Long criarRetornandoId() throws Exception {
		mvc.perform(post("/api/cestas").contentType(MediaType.APPLICATION_JSON).content(umaCesta()))
				.andExpect(status().isCreated());
		return repository.findAll().get(0).getId();
	}
}
