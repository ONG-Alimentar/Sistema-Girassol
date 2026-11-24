package br.org.ongalimentar.girassol.auth;

public interface EmailService {

	void enviarCodigoRecuperacaoSenha(String destinatario, String nome, String codigo);
}
