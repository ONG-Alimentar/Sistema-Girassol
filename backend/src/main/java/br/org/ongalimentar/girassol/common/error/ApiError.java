package br.org.ongalimentar.girassol.common.error;

import java.time.Instant;
import java.util.List;

/**
 * Formato único de erro de toda a API (ver {@link GlobalExceptionHandler}).
 *
 * <p>Contrato consumido pelo front: o campo {@code message} é o texto exibível;
 * {@code fieldErrors} traz erros por campo em respostas de validação (null quando
 * não houver). Este é o contrato que a #26 (formulário) deve seguir no front.
 */
public record ApiError(
		Instant timestamp,
		int status,
		String error,
		String message,
		String path,
		List<FieldError> fieldErrors) {

	/** Erro associado a um campo específico (validação). */
	public record FieldError(String field, String message) {
	}
}
