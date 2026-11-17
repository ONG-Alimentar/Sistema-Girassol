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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = { "USUARIO:READ", "USUARIO:CREATE", "USUARIO:UPDATE", "USUARIO:DELETE" })
class UsuarioCrudIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private UsuarioRepository usuarioRepository;
	@Autowired
	private CargoRepository cargoRepository;
	@Autowired
	private PermissaoRepository permissaoRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;

	private MockMvc mvc;
	private Long cargoId;

	@BeforeEach
	void setup() {
		// Ordem: usuario (dono de usuario_cargo) → cargo (dono de cargo_permissao) → permissao.
		usuarioRepository.deleteAll();
		cargoRepository.deleteAll();
		permissaoRepository.deleteAll();
		cargoId = cargoRepository.save(new Cargo("GERENTE")).getId();
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	/** Cria um usuário administrador ativo (cargo com USUARIO:UPDATE) e devolve seu id. */
	private Long criarAdministrador(String nome, String email) {
		Permissao admin = permissaoRepository.findByCodigo("USUARIO:UPDATE")
				.orElseGet(() -> permissaoRepository.save(new Permissao("USUARIO:UPDATE")));
		Cargo cargo = cargoRepository.findByNome("ADMINISTRADOR").orElseGet(() -> {
			Cargo novo = new Cargo("ADMINISTRADOR");
			novo.adicionarPermissao(admin);
			return cargoRepository.save(novo);
		});
		Usuario usuario = new Usuario(nome, email, passwordEncoder.encode("segredo123"));
		// Lado dono (usuario_cargo) basta e evita tocar a coleção lazy de um cargo destacado.
		usuario.getCargos().add(cargo);
		return usuarioRepository.save(usuario).getId();
	}

	@Test
	void criaComCargoListaAtualizaEExclui() throws Exception {
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@ong.org\",\"senha\":\"segredo123\",\"cargoIds\":["
						+ cargoId + "]}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.nome").value("Ana"))
				.andExpect(jsonPath("$.email").value("ana@ong.org"))
				.andExpect(jsonPath("$.ativo").value(true))
				.andExpect(jsonPath("$.cargos[0].nome").value("GERENTE"))
				.andExpect(jsonPath("$.senha").doesNotExist())
				.andExpect(jsonPath("$.senhaHash").doesNotExist());

		Long id = usuarioRepository.findAll().get(0).getId();
		String hashOriginal = usuarioRepository.findById(id).orElseThrow().getSenhaHash();

		mvc.perform(get("/api/usuarios/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("ana@ong.org"));

		// Update sem senha mantém o hash atual; muda nome e desativa.
		mvc.perform(put("/api/usuarios/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana Maria\",\"email\":\"ana@ong.org\",\"ativo\":false,\"cargoIds\":[]}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Ana Maria"))
				.andExpect(jsonPath("$.ativo").value(false))
				.andExpect(jsonPath("$.cargos.length()").value(0));

		org.junit.jupiter.api.Assertions.assertEquals(hashOriginal,
				usuarioRepository.findById(id).orElseThrow().getSenhaHash(),
				"A senha não deveria mudar quando omitida no update.");

		mvc.perform(delete("/api/usuarios/" + id)).andExpect(status().isNoContent());
		mvc.perform(get("/api/usuarios/" + id)).andExpect(status().isNotFound());
	}

	@Test
	void senhaTrocadaEhHasheadaERetornaEncodeDiferente() throws Exception {
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@ong.org\",\"senha\":\"segredo123\"}"))
				.andExpect(status().isCreated());
		Long id = usuarioRepository.findAll().get(0).getId();

		mvc.perform(put("/api/usuarios/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@ong.org\",\"senha\":\"nova-senha-456\"}"))
				.andExpect(status().isOk());

		String hash = usuarioRepository.findById(id).orElseThrow().getSenhaHash();
		org.junit.jupiter.api.Assertions.assertNotEquals("nova-senha-456", hash, "A senha deve ser hasheada.");
		org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches("nova-senha-456", hash));
	}

	@Test
	void criarSemSenhaRetorna400ComErroNoCampoSenha() throws Exception {
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@ong.org\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='senha')]").exists());
	}

	@Test
	void senhaCurtaRetorna400ComErroNoCampoSenha() throws Exception {
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@ong.org\",\"senha\":\"123\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='senha')]").exists());
	}

	@Test
	void naoPermiteExcluirOUltimoAdministrador() throws Exception {
		Long id = criarAdministrador("Admin", "admin@ong.org");

		mvc.perform(delete("/api/usuarios/" + id)).andExpect(status().isConflict());
		org.junit.jupiter.api.Assertions.assertTrue(usuarioRepository.existsById(id),
				"O último administrador não deve ser excluído.");
	}

	@Test
	void naoPermiteDesativarOUltimoAdministrador() throws Exception {
		Long id = criarAdministrador("Admin", "admin@ong.org");
		Long adminCargo = cargoRepository.findByNome("ADMINISTRADOR").orElseThrow().getId();

		mvc.perform(put("/api/usuarios/" + id).contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Admin\",\"email\":\"admin@ong.org\",\"ativo\":false,\"cargoIds\":["
						+ adminCargo + "]}"))
				.andExpect(status().isConflict());
		org.junit.jupiter.api.Assertions.assertTrue(usuarioRepository.findById(id).orElseThrow().isAtivo(),
				"O último administrador não deve ser desativado.");
	}

	@Test
	void permiteExcluirUmAdministradorQuandoHaOutro() throws Exception {
		criarAdministrador("Admin 1", "admin1@ong.org");
		Long id2 = criarAdministrador("Admin 2", "admin2@ong.org");

		mvc.perform(delete("/api/usuarios/" + id2)).andExpect(status().isNoContent());
		org.junit.jupiter.api.Assertions.assertEquals(1, usuarioRepository.count());
	}

	@Test
	void emailInvalidoRetorna400ComErroPorCampo() throws Exception {
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"nao-e-email\",\"senha\":\"segredo123\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors[?(@.field=='email')]").exists());
	}

	@Test
	void filtraPorNomeOuEmail() throws Exception {
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@ong.org\",\"senha\":\"segredo123\"}"))
				.andExpect(status().isCreated());
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Bruno\",\"email\":\"bruno@ong.org\",\"senha\":\"segredo123\"}"))
				.andExpect(status().isCreated());

		mvc.perform(get("/api/usuarios").param("q", "bruno@ong"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].nome").value("Bruno"));
	}

	@Test
	@WithMockUser(authorities = "USUARIO:READ")
	void semPermissaoDeCriarRetorna403() throws Exception {
		mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"Ana\",\"email\":\"ana@ong.org\",\"senha\":\"segredo123\"}"))
				.andExpect(status().isForbidden());
	}
}
