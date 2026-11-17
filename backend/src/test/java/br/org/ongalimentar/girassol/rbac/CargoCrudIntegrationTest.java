package br.org.ongalimentar.girassol.rbac;

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

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = { "CARGO:READ", "CARGO:CREATE", "CARGO:UPDATE", "CARGO:DELETE" })
class CargoCrudIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private CargoRepository cargoRepository;
	@Autowired
	private PermissaoRepository permissaoRepository;

	private MockMvc mvc;
	private Long permissaoA;
	private Long permissaoB;

	@BeforeEach
	void setup() {
		cargoRepository.deleteAll();
		permissaoRepository.deleteAll();
		permissaoA = permissaoRepository.save(new Permissao("RELATORIO:READ")).getId();
		permissaoB = permissaoRepository.save(new Permissao("AUDITORIA:READ")).getId();
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	@Test
	void criaComPermissoesListaAtualizaEExclui() throws Exception {
		mvc.perform(post("/api/cargos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"GERENTE\",\"permissaoIds\":[" + permissaoA + "]}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.nome").value("GERENTE"))
				.andExpect(jsonPath("$.permissoes[0].codigo").value("RELATORIO:READ"))
				.andExpect(jsonPath("$.totalUsuarios").value(0));

		Long id = cargoRepository.findByNome("GERENTE").orElseThrow().getId();

		mvc.perform(get("/api/cargos/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.permissoes.length()").value(1));

		// Troca o conjunto de permissões (sincronização do lado dono).
		mvc.perform(put("/api/cargos/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"GERENTE\",\"permissaoIds\":[" + permissaoB + "]}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.permissoes.length()").value(1))
				.andExpect(jsonPath("$.permissoes[0].codigo").value("AUDITORIA:READ"));

		mvc.perform(delete("/api/cargos/" + id)).andExpect(status().isNoContent());
		mvc.perform(get("/api/cargos/" + id)).andExpect(status().isNotFound());
		// Excluir o cargo não apaga as permissões do catálogo.
		mvc.perform(get("/api/cargos")).andExpect(jsonPath("$.totalElements").value(0));
	}

	@Test
	void filtraPorNome() throws Exception {
		mvc.perform(post("/api/cargos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"GERENTE\"}")).andExpect(status().isCreated());
		mvc.perform(post("/api/cargos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"AUDITOR\"}")).andExpect(status().isCreated());

		mvc.perform(get("/api/cargos").param("q", "geren"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].nome").value("GERENTE"));
	}

	@Test
	void permissaoInexistenteRetorna400() throws Exception {
		mvc.perform(post("/api/cargos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"GERENTE\",\"permissaoIds\":[999999]}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	@WithMockUser(authorities = "CARGO:READ")
	void semPermissaoDeCriarRetorna403() throws Exception {
		mvc.perform(post("/api/cargos").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"GERENTE\"}"))
				.andExpect(status().isForbidden());
	}
}
