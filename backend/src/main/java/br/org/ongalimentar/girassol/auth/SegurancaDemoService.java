package br.org.ongalimentar.girassol.auth;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

/**
 * Âncora da autorização por método (defesa em profundidade) enquanto os módulos
 * reais de atendimento jurídico/psicológico não existem (issues de CRUD futuras).
 *
 * <p>Demonstra e cobre com testes o requisito não-funcional mais sensível do
 * projeto (LGPD): o <b>isolamento jurídico/psicológico</b> — só quem tem a
 * autoridade {@code JURIDICO:READ} / {@code PSICOLOGICO:READ} acessa. A assistente
 * social, por não possuí-las, é barrada aqui pela mesma regra que protegerá os
 * endpoints reais. Ver {@code docs/seguranca/rbac.md}.
 */
@Service
public class SegurancaDemoService {

	@PreAuthorize("hasAuthority('JURIDICO:READ')")
	public String lerAtendimentoJuridico() {
		return "conteudo-juridico-sigiloso";
	}

	@PreAuthorize("hasAuthority('PSICOLOGICO:READ')")
	public String lerAtendimentoPsicologico() {
		return "conteudo-psicologico-sigiloso";
	}
}
