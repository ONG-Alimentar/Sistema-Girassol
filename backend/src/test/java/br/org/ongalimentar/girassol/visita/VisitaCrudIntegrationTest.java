package br.org.ongalimentar.girassol.visita;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;
import br.org.ongalimentar.girassol.auth.AppUserDetails;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class VisitaCrudIntegrationTest {

	private static final String API = "/api/visitas";
	private static final String CADASTRO = """
			{"data":"2026-11-25","turno":"MANHA","nome":"Maria Silva","idade":30,
			"contato":"555-0100","situacao":"OUTRO","motivoDaProcura":"Orientação",
			"pedidoAtendido":false,"observacoes":"Registro de teste"}
			""";

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private VisitaRepository repository;
	@Autowired
	private UsuarioRepository usuarioRepository;

	private MockMvc mvc;
	private Usuario usuario;

	@BeforeEach
	void setup() {
		repository.deleteAll();
		usuario = usuarioRepository.save(new Usuario("Responsável de teste",
				"visita-" + UUID.randomUUID() + "@girassol.org.br", "senha-hash"));
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	private RequestPostProcessor como(String... permissoes) {
		var authorities = Arrays.stream(permissoes).map(SimpleGrantedAuthority::new).toList();
		var principal = new AppUserDetails(usuario.getId(), usuario.getEmail(), usuario.getNome(),
				"senha-hash", true, authorities, List.of());
		return authentication(new UsernamePasswordAuthenticationToken(principal, null, authorities));
	}

	private Long registrar(String nome, LocalDate data) {
		Visita visita = new Visita(usuario, data);
		visita.setNome(nome);
		return repository.saveAndFlush(visita).getId();
	}

	@Test
	void cadastraConsultaEExcluiVisita() throws Exception {
		mvc.perform(post(API).with(como("VISITA:CREATE")).contentType(MediaType.APPLICATION_JSON).content(CADASTRO))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.nome").value("Maria Silva"))
				.andExpect(jsonPath("$.pedidoAtendido").value(false));
		Visita salva = repository.findAll().get(0);
		assertEquals(usuario.getId(), salva.getCriadoPor().getId());
		String detalhe = API + "/" + salva.getId();
		mvc.perform(get(detalhe).with(como("VISITA:READ")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.motivoDaProcura").value("Orientação"))
				.andExpect(jsonPath("$.idade").value(30));
		mvc.perform(delete(detalhe).with(como("VISITA:DELETE")))
				.andExpect(status().isNoContent());
		mvc.perform(get(detalhe).with(como("VISITA:READ")))
				.andExpect(status().isNotFound());
	}

	@Test
	void listaComBuscaPaginacaoEOrdenacao() throws Exception {
		registrar("Maria Antiga", LocalDate.of(2026, 11, 20));
		registrar("Maria Recente", LocalDate.of(2026, 11, 25));
		registrar("João", LocalDate.of(2026, 11, 24));
		mvc.perform(get(API).with(como("VISITA:READ")).param("q", "MARIA")
				.param("page", "0").param("size", "1").param("sort", "data,desc"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].nome").value("Maria Recente"))
				.andExpect(jsonPath("$.totalElements").value(2))
				.andExpect(jsonPath("$.totalPages").value(2));
		mvc.perform(get(API).with(como("VISITA:READ")).param("q", "maria")
				.param("page", "1").param("size", "1").param("sort", "data,desc"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].nome").value("Maria Antiga"));
		mvc.perform(get(API).with(como("VISITA:READ")).param("q", "maria").param("sort", "data,asc"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].nome").value("Maria Antiga"));
		mvc.perform(get(API).with(como("VISITA:READ")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].nome").value("Maria Recente"));
	}

	@Test
	void aceitaCamposOpcionaisAusentes() throws Exception {
		mvc.perform(post(API).with(como("VISITA:CREATE")).contentType(MediaType.APPLICATION_JSON)
				.content("{\"data\":\"2026-11-25\",\"nome\":\"Visitante\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.nome").value("Visitante"));
	}

	@Test
	void rejeitaDadosInvalidos() throws Exception {
		mvc.perform(post(API).with(como("VISITA:CREATE")).contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\" \",\"idade\":-1}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='nome')]").exists())
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='data')]").exists())
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='idade')]").exists());
	}

	@Test
	void bloqueiaEdicaoMesmoComAutoridadeDeAtualizacao() throws Exception {
		Long id = registrar("Original", LocalDate.of(2026, 11, 25));
		mvc.perform(put(API + "/" + id)
				.with(como("VISITA:READ", "VISITA:CREATE", "VISITA:DELETE", "VISITA:UPDATE"))
				.contentType(MediaType.APPLICATION_JSON).content(CADASTRO))
				.andExpect(status().isForbidden());
		assertEquals("Original", repository.findById(id).orElseThrow().getNome());
	}

	@Test
	void respeitaPermissoesPorOperacao() throws Exception {
		Long id = registrar("Visitante", LocalDate.of(2026, 11, 25));
		mvc.perform(get(API).with(como("VISITA:CREATE"))).andExpect(status().isForbidden());
		mvc.perform(get(API + "/" + id).with(como("VISITA:CREATE"))).andExpect(status().isForbidden());
		mvc.perform(post(API).with(como("VISITA:READ")).contentType(MediaType.APPLICATION_JSON).content(CADASTRO))
				.andExpect(status().isForbidden());
		mvc.perform(delete(API + "/" + id).with(como("VISITA:READ"))).andExpect(status().isForbidden());
	}

	@Test
	void exigeAutenticacao() throws Exception {
		mvc.perform(get(API)).andExpect(status().isUnauthorized());
	}

	@Test
	void rejeitaOrdenacaoInvalida() throws Exception {
		mvc.perform(get(API).with(como("VISITA:READ")).param("sort", "criadoPor.senhaHash,asc"))
				.andExpect(status().isBadRequest());
	}
}
