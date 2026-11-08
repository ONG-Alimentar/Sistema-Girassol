package br.org.ongalimentar.girassol.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;
import br.org.ongalimentar.girassol.rbac.Cargo;
import br.org.ongalimentar.girassol.rbac.CargoRepository;
import br.org.ongalimentar.girassol.rbac.Permissao;
import br.org.ongalimentar.girassol.rbac.PermissaoRepository;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

/**
 * Valida o contrato de autenticação consumido pelo front: login (ok/falha) e o
 * {@code /me} (200 com sessão, 401 sem). Usa Postgres real (Testcontainers) e
 * semeia seu próprio usuário (o DataSeeder não roda no profile de teste).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AuthIntegrationTest {

	@Autowired
	private MockMvc mvc;
	@Autowired
	private UsuarioRepository usuarioRepository;
	@Autowired
	private CargoRepository cargoRepository;
	@Autowired
	private PermissaoRepository permissaoRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setup() {
		// Ordem respeita as FKs das tabelas de junção (usuario → cargo → permissao).
		usuarioRepository.deleteAll();
		cargoRepository.deleteAll();
		permissaoRepository.deleteAll();

		Permissao familiaRead = permissaoRepository.save(new Permissao("FAMILIA:READ"));
		Cargo cargo = new Cargo("ASSISTENTE_SOCIAL");
		cargo.adicionarPermissao(familiaRead);
		cargoRepository.save(cargo);

		Usuario usuario = new Usuario("Fulana", "fulana@ong.org", passwordEncoder.encode("senha123"));
		usuario.adicionarCargo(cargo);
		usuarioRepository.save(usuario);
	}

	@Test
	void loginValidoCriaSessaoEMeRetornaUsuario() throws Exception {
		MvcResult login = mvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"fulana@ong.org\",\"senha\":\"senha123\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("fulana@ong.org"))
				.andExpect(jsonPath("$.nome").value("Fulana"))
				.andExpect(jsonPath("$.permissions[0]").value("FAMILIA:READ"))
				.andReturn();

		MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);

		mvc.perform(get("/api/auth/me").session(session))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("fulana@ong.org"))
				.andExpect(jsonPath("$.permissions[0]").value("FAMILIA:READ"));
	}

	@Test
	void meSemSessaoRetorna401() throws Exception {
		mvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginSenhaErradaRetorna401() throws Exception {
		mvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"fulana@ong.org\",\"senha\":\"errada\"}"))
				.andExpect(status().isUnauthorized());
	}
}
