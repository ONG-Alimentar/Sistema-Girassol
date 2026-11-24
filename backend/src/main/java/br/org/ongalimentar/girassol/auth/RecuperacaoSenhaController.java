package br.org.ongalimentar.girassol.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth/recuperacao-senha")
public class RecuperacaoSenhaController {

	private final RecuperacaoSenhaService service;

	public RecuperacaoSenhaController(RecuperacaoSenhaService service) {
		this.service = service;
	}

	@PostMapping("/solicitar")
	public ResponseEntity<Void> solicitar(@Valid @RequestBody SolicitarRecuperacaoRequest req) {
		service.solicitar(req.email());
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/validar")
	public ResponseEntity<Void> validar(@Valid @RequestBody ValidarCodigoRequest req) {
		service.validar(req.email(), req.codigo());
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/redefinir")
	public ResponseEntity<Void> redefinir(@Valid @RequestBody RedefinirSenhaRequest req) {
		service.redefinir(req.email(), req.codigo(), req.novaSenha(), req.confirmarSenha());
		return ResponseEntity.noContent().build();
	}
}
