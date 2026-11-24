package br.org.ongalimentar.girassol.auth;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

/**
 * Valida o fluxo de recuperação de senha de ponta a ponta (solicitar → validar
 * → redefinir), a não-reutilização/expiração do código e a resposta genérica
 * para email inexistente (sem enumeração de usuários). Usa Postgres real
 * (Testcontainers) e substitui o EmailService por um mock para capturar o
 * código gerado sem depender de SMTP.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class RecuperacaoSenhaIntegrationTest {

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
	void fluxoCompletoFuncionaPontaAPonta() throws Exception {
		String codigo = solicitarESolicitarCodigo();

		mvc.perform(post("/api/auth/recuperacao-senha/validar")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\",\"codigo\":\"%s\"}".formatted(EMAIL, codigo)))
				.andExpect(status().isNoContent());

		mvc.perform(post("/api/auth/recuperacao-senha/redefinir")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"%s","codigo":"%s","novaSenha":"senhaNova1","confirmarSenha":"senhaNova1"}
								""".formatted(EMAIL, codigo)))
				.andExpect(status().isNoContent());

		mvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\",\"senha\":\"senhaNova1\"}".formatted(EMAIL)))
				.andExpect(status().isOk());

		mvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\",\"senha\":\"senhaAntiga1\"}".formatted(EMAIL)))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void codigoNaoPodeSerReutilizadoAposRedefinir() throws Exception {
		String codigo = solicitarESolicitarCodigo();

		mvc.perform(post("/api/auth/recuperacao-senha/redefinir")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"%s","codigo":"%s","novaSenha":"senhaNova1","confirmarSenha":"senhaNova1"}
								""".formatted(EMAIL, codigo)))
				.andExpect(status().isNoContent());

		mvc.perform(post("/api/auth/recuperacao-senha/validar")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\",\"codigo\":\"%s\"}".formatted(EMAIL, codigo)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void codigoErradoRetornaBadRequest() throws Exception {
		solicitarESolicitarCodigo();

		mvc.perform(post("/api/auth/recuperacao-senha/validar")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\",\"codigo\":\"000000\"}".formatted(EMAIL)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void senhasQueNaoCoincidemRetornamBadRequest() throws Exception {
		String codigo = solicitarESolicitarCodigo();

		mvc.perform(post("/api/auth/recuperacao-senha/redefinir")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"%s","codigo":"%s","novaSenha":"senhaNova1","confirmarSenha":"outraSenha1"}
								""".formatted(EMAIL, codigo)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void solicitarComEmailInexistenteRespondeGenericoSemEnviarEmail() throws Exception {
		mvc.perform(post("/api/auth/recuperacao-senha/solicitar")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"inexistente@ong.org\"}"))
				.andExpect(status().isNoContent());

		verify(emailService, never()).enviarCodigoRecuperacaoSenha(eq("inexistente@ong.org"), anyString(), anyString());
	}

	private String solicitarESolicitarCodigo() throws Exception {
		mvc.perform(post("/api/auth/recuperacao-senha/solicitar")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\"}".formatted(EMAIL)))
				.andExpect(status().isNoContent());

		ArgumentCaptor<String> codigoCaptor = ArgumentCaptor.forClass(String.class);
		verify(emailService).enviarCodigoRecuperacaoSenha(eq(EMAIL), anyString(), codigoCaptor.capture());
		return codigoCaptor.getValue();
	}
}
