package br.org.ongalimentar.girassol.common.error;

/**
 * Lançada quando um recurso referenciado por id não existe. O
 * {@link GlobalExceptionHandler} a traduz para HTTP 404 no formato {@link ApiError}.
 */
public class ResourceNotFoundException extends RuntimeException {

	public ResourceNotFoundException(String message) {
		super(message);
	}
}
