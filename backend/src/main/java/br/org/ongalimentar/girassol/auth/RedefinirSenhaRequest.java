package br.org.ongalimentar.girassol.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RedefinirSenhaRequest(
		@NotBlank @Email String email,
		@NotBlank @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos.") String codigo,
		@NotBlank String novaSenha,
		@NotBlank String confirmarSenha) {
}
