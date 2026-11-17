package br.org.ongalimentar.girassol.common.error;

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
