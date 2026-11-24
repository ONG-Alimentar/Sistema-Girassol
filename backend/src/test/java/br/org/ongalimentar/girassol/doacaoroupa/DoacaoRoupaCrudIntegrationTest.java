package br.org.ongalimentar.girassol.doacaoroupa;

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
 * Valida o CRUD de {@code /api/roupas}: ciclo completo com peças aninhadas
 * opcionais, resolução da família no response, filtro por família, formato
 * paginado, validação (400), não-encontrado (404) e a barreira RBAC (403).
 * Usa Postgres real (Testcontainers) e MockMvc autenticado via {@code @WithMockUser}.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = { "ROUPA:READ", "ROUPA:CREATE", "ROUPA:UPDATE", "ROUPA:DELETE" })
class DoacaoRoupaCrudIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private DoacaoRoupaRepository repository;
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

	private String umaRoupaComPecas() {
		return """
				{"familiaId":%d,"data":"2026-03-10","quantidade":3,"pecas":[
					{"descricao":"Camiseta","tamanho":"M","genero":"MASCULINO"},
					{"descricao":"Calça","tamanho":"40","genero":"FEMININO"}
				]}
				""".formatted(familiaId);
	}

	private String umaRoupaSemPecas() {
		return """
				{"familiaId":%d,"data":"2026-03-10","quantidade":5}
				""".formatted(familiaId);
	}

	@Test
	void criaEListaNoFormatoPaginadoComFamiliaResolvida() throws Exception {
		mvc.perform(post("/api/roupas").contentType(MediaType.APPLICATION_JSON).content(umaRoupaComPecas()))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.quantidade").value(3))
				.andExpect(jsonPath("$.familiaId").value(familiaId))
				.andExpect(jsonPath("$.familiaNome").value("Família Apoio"))
				.andExpect(jsonPath("$.pecas.length()").value(2));

		mvc.perform(get("/api/roupas"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].familiaNome").value("Família Apoio"))
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.page").value(0));
	}

	@Test
	void criaSemPecasPoisAListaEOpcional() throws Exception {
		mvc.perform(post("/api/roupas").contentType(MediaType.APPLICATION_JSON).content(umaRoupaSemPecas()))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.quantidade").value(5))
				.andExpect(jsonPath("$.pecas.length()").value(0));
	}

	@Test
	void buscaAtualizaEExclui() throws Exception {
		Long id = criarRetornandoId();

		mvc.perform(get("/api/roupas/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pecas.length()").value(2));

		// Atualiza substituindo as peças por uma só e mudando a quantidade.
		mvc.perform(put("/api/roupas/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"familiaId":%d,"data":"2026-03-11","quantidade":1,"pecas":[{"descricao":"Casaco","tamanho":"G","genero":"OUTRO"}]}
						""".formatted(familiaId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.quantidade").value(1))
				.andExpect(jsonPath("$.pecas.length()").value(1))
				.andExpect(jsonPath("$.pecas[0].descricao").value("Casaco"));

		mvc.perform(delete("/api/roupas/" + id)).andExpect(status().isNoContent());
		mvc.perform(get("/api/roupas/" + id)).andExpect(status().isNotFound());
	}

	@Test
	void filtraPorFamilia() throws Exception {
		criarRetornandoId();
		Familia outra = new Familia();
		outra.setNome("Outra Família");
		Long outraId = familiaRepository.save(outra).getId();

		mvc.perform(get("/api/roupas").param("familia", String.valueOf(outraId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0));

		mvc.perform(get("/api/roupas").param("familia", String.valueOf(familiaId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1));
	}

	@Test
	void validacaoRetorna400QuandoFaltaFamilia() throws Exception {
		mvc.perform(post("/api/roupas").contentType(MediaType.APPLICATION_JSON)
				.content("{\"quantidade\":1}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='familiaId')]").exists());
	}

	@Test
	void validacaoRetorna400QuandoQuantidadeNaoEPositiva() throws Exception {
		mvc.perform(post("/api/roupas").contentType(MediaType.APPLICATION_JSON)
				.content("{\"familiaId\":%d,\"quantidade\":0}".formatted(familiaId)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='quantidade')]").exists());
	}

	@Test
	void buscaInexistenteRetorna404NoFormatoApiError() throws Exception {
		mvc.perform(get("/api/roupas/999999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value(containsString("não encontrad")))
				.andExpect(jsonPath("$.path").value("/api/roupas/999999"));
	}

	@Test
	@WithMockUser(authorities = "ROUPA:READ")
	void semPermissaoDeCriarRetorna403() throws Exception {
		mvc.perform(post("/api/roupas").contentType(MediaType.APPLICATION_JSON).content(umaRoupaComPecas()))
				.andExpect(status().isForbidden());
	}

	@Test
	@WithMockUser(authorities = { "ROUPA:READ", "ROUPA:CREATE" })
	void semPermissaoDeAtualizarRetorna403() throws Exception {
		Long id = criarRetornandoId();

		mvc.perform(put("/api/roupas/" + id).contentType(MediaType.APPLICATION_JSON).content(umaRoupaSemPecas()))
				.andExpect(status().isForbidden());
	}

	private Long criarRetornandoId() throws Exception {
		mvc.perform(post("/api/roupas").contentType(MediaType.APPLICATION_JSON).content(umaRoupaComPecas()))
				.andExpect(status().isCreated());
		return repository.findAll().get(0).getId();
	}
}
