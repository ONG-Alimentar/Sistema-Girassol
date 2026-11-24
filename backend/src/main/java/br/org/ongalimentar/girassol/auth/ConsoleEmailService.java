package br.org.ongalimentar.girassol.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Evita depender de um provedor SMTP real fora de produção: loga o código no
 * console para o desenvolvedor copiar e seguir o fluxo manualmente. Também é a
 * implementação ativa nos testes (sem profile), que substituem este bean por
 * um mock quando precisam capturar o código gerado.
 */
@Service
@Profile("!prod")
public class ConsoleEmailService implements EmailService {

	private static final Logger log = LoggerFactory.getLogger(ConsoleEmailService.class);

	@Override
	public void enviarCodigoRecuperacaoSenha(String destinatario, String nome, String codigo) {
		log.warn("[email de recuperação de senha - DEV] Para: {} <{}> | Código: {}", nome, destinatario, codigo);
	}
}
