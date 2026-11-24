package br.org.ongalimentar.girassol.auth;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

/**
 * Expiração isolada num contexto próprio (expiracao-minutos=0): o código já
 * nasce expirado, então a validação deve falhar mesmo estando correto.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@TestPropertySource(properties = "app.recuperacao-senha.expiracao-minutos=0")
class RecuperacaoSenhaExpiracaoTest {

	private static final String EMAIL = "fulana@ong.org";

	@Autowired
	private MockMvc mvc;
	@Autowired
	private UsuarioRepository usuarioRepository;
	@Autowired
	private SenhaResetTokenRepository tokenRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@MockitoBean
	private EmailService emailService;

	@BeforeEach
	void setup() {
		tokenRepository.deleteAll();
		usuarioRepository.deleteAll();
		usuarioRepository.save(new Usuario("Fulana", EMAIL, passwordEncoder.encode("senhaAntiga1")));
	}

	@Test
	void codigoExpiradoNaoValida() throws Exception {
		mvc.perform(post("/api/auth/recuperacao-senha/solicitar")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\"}".formatted(EMAIL)))
				.andExpect(status().isNoContent());

		ArgumentCaptor<String> codigoCaptor = ArgumentCaptor.forClass(String.class);
		verify(emailService).enviarCodigoRecuperacaoSenha(eq(EMAIL), anyString(), codigoCaptor.capture());
		String codigo = codigoCaptor.getValue();

		mvc.perform(post("/api/auth/recuperacao-senha/validar")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\",\"codigo\":\"%s\"}".formatted(EMAIL, codigo)))
				.andExpect(status().isBadRequest());
	}
}
