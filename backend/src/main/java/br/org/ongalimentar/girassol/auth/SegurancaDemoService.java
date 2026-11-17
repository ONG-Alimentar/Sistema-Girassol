package br.org.ongalimentar.girassol.auth;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

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
