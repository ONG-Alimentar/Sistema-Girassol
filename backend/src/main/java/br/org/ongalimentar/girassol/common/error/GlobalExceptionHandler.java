package br.org.ongalimentar.girassol.common.error;

import java.time.Instant;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Tradução central de exceções para o formato único {@link ApiError}, aplicada a
 * todos os endpoints. Garante respostas de erro previsíveis para o front.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	/** Recurso inexistente → 404. */
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
		return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
	}

	/** Falha de Bean Validation (@Valid) → 400 com erros por campo. */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
		List<ApiError.FieldError> campos = ex.getBindingResult().getFieldErrors().stream()
				.map(fe -> new ApiError.FieldError(fe.getField(), fe.getDefaultMessage()))
				.toList();
		ApiError body = new ApiError(Instant.now(), HttpStatus.BAD_REQUEST.value(),
				HttpStatus.BAD_REQUEST.getReasonPhrase(), "Dados inválidos.", req.getRequestURI(), campos);
		return ResponseEntity.badRequest().body(body);
	}

	/** Sem permissão (@PreAuthorize) para usuário autenticado → 403. */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
		return build(HttpStatus.FORBIDDEN, "Acesso negado.", req);
	}

	/** Preserva o status/razão de exceções que já carregam um HTTP status. */
	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException ex, HttpServletRequest req) {
		HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
		String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
		return build(status, message, req);
	}

	/** Violação de integridade (ex.: valor único duplicado) → 409. */
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleConflict(DataIntegrityViolationException ex, HttpServletRequest req) {
		return build(HttpStatus.CONFLICT,
				"Violação de restrição de dados (valor duplicado ou referência inválida).", req);
	}

	/** Rede de segurança: qualquer outra exceção → 500 (sem vazar detalhes). */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
		return build(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno.", req);
	}

	private ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest req) {
		ApiError body = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(),
				message, req.getRequestURI(), null);
		return ResponseEntity.status(status).body(body);
	}
}
