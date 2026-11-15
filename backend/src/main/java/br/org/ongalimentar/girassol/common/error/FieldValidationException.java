package br.org.ongalimentar.girassol.common.error;

/**
 * Erro de validação ligado a um campo específico, descoberto fora do Bean
 * Validation (ex.: regra condicional que o {@code @Valid} não cobre). É traduzido
 * pelo {@link GlobalExceptionHandler} para o mesmo formato {@link ApiError} com
 * {@code fieldErrors} de uma falha de {@code @Valid} — mantendo o contrato que a
 * #26 (formulário) consome no front.
 */
public class FieldValidationException extends RuntimeException {

	private final transient String field;

	public FieldValidationException(String field, String message) {
		super(message);
		this.field = field;
	}

	public String getField() {
		return field;
	}
}
