package br.org.ongalimentar.girassol.auth;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.common.error.FieldValidationException;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

@Service
public class RecuperacaoSenhaService {

	static final int SENHA_MIN = 8;
	private static final String CODIGO_INVALIDO_MSG = "Código inválido ou expirado.";

	private final UsuarioRepository usuarioRepository;
	private final SenhaResetTokenRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final SecureRandom random = new SecureRandom();

	@Value("${app.recuperacao-senha.expiracao-minutos:15}")
	private long expiracaoMinutos;

	public RecuperacaoSenhaService(UsuarioRepository usuarioRepository,
			SenhaResetTokenRepository tokenRepository, PasswordEncoder passwordEncoder,
			EmailService emailService) {
		this.usuarioRepository = usuarioRepository;
		this.tokenRepository = tokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
	}

	@Transactional
	public void solicitar(String email) {
		// Resposta é sempre genérica (ver controller): não dá pra saber aqui, de
		// fora, se o email existe ou não — evita enumeração de usuários.
		usuarioRepository.findByEmail(email).ifPresent(usuario -> {
			invalidarTokensAtivos(usuario);

			String codigo = gerarCodigo();
			SenhaResetToken token = new SenhaResetToken(usuario, passwordEncoder.encode(codigo),
					Instant.now().plus(expiracaoMinutos, ChronoUnit.MINUTES));
			tokenRepository.save(token);

			emailService.enviarCodigoRecuperacaoSenha(usuario.getEmail(), usuario.getNome(), codigo);
		});
	}

	@Transactional(readOnly = true)
	public void validar(String email, String codigo) {
		localizarTokenValido(email, codigo);
	}

	@Transactional
	public void redefinir(String email, String codigo, String novaSenha, String confirmarSenha) {
		if (!novaSenha.equals(confirmarSenha)) {
			throw new FieldValidationException("confirmarSenha", "As senhas não coincidem.");
		}
		if (novaSenha.trim().length() < SENHA_MIN) {
			throw new FieldValidationException("novaSenha",
					"A senha deve ter ao menos " + SENHA_MIN + " caracteres.");
		}

		SenhaResetToken token = localizarTokenValido(email, codigo);
		Usuario usuario = token.getUsuario();

		usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
		usuarioRepository.save(usuario);

		token.setUsado(true);
		tokenRepository.save(token);
		invalidarTokensAtivos(usuario);
	}

	private SenhaResetToken localizarTokenValido(String email, String codigo) {
		Instant agora = Instant.now();
		Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
		if (usuario.isEmpty()) {
			throw new FieldValidationException("codigo", CODIGO_INVALIDO_MSG);
		}
		return tokenRepository.findByUsuarioAndUsadoFalse(usuario.get()).stream()
				.filter(t -> t.valido(agora))
				.filter(t -> passwordEncoder.matches(codigo, t.getCodigoHash()))
				.findFirst()
				.orElseThrow(() -> new FieldValidationException("codigo", CODIGO_INVALIDO_MSG));
	}

	private void invalidarTokensAtivos(Usuario usuario) {
		List<SenhaResetToken> ativos = tokenRepository.findByUsuarioAndUsadoFalse(usuario);
		ativos.forEach(t -> t.setUsado(true));
		tokenRepository.saveAll(ativos);
	}

	private String gerarCodigo() {
		return String.format("%06d", random.nextInt(1_000_000));
	}
}
