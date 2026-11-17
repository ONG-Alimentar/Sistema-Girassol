package br.org.ongalimentar.girassol.common.error;

import java.time.Instant;
import java.util.List;

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
