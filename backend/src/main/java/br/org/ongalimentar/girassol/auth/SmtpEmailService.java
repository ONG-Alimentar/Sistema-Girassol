package br.org.ongalimentar.girassol.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Profile("prod")
public class SmtpEmailService implements EmailService {

	private final JavaMailSender mailSender;

	@Value("${app.email.remetente:no-reply@ongalimentar.org}")
	private String remetente;

	public SmtpEmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}

	@Override
	public void enviarCodigoRecuperacaoSenha(String destinatario, String nome, String codigo) {
		SimpleMailMessage mensagem = new SimpleMailMessage();
		mensagem.setFrom(remetente);
		mensagem.setTo(destinatario);
		mensagem.setSubject("Sistema Girassol — Código de recuperação de senha");
		mensagem.setText("""
				Olá, %s!

				Use o código abaixo para redefinir sua senha no Sistema Girassol:

				%s

				Este código expira em alguns minutos e só pode ser usado uma vez.
				Se você não solicitou essa alteração, ignore este email.
				""".formatted(nome, codigo));
		mailSender.send(mensagem);
	}
}
