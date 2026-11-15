package br.org.ongalimentar.girassol.rbac;

import java.util.Map;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.org.ongalimentar.girassol.common.crud.CrudController;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.rbac.dto.UsuarioAdminRequest;
import br.org.ongalimentar.girassol.rbac.dto.UsuarioAdminResponse;

/**
 * CRUD REST de {@link Usuario} (administração, #3) sobre a base genérica
 * ({@link CrudController}). O específico é o mapeamento DTO↔entidade — hashing
 * BCrypt da senha e resolução dos {@code cargoIds} — e o filtro {@code ?q=} por
 * nome/e-mail. Autorização RBAC fica no {@link UsuarioService}.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController extends CrudController<Usuario, Long, UsuarioAdminRequest, UsuarioAdminResponse> {

	private final UsuarioService service;
	private final CargoRepository cargoRepository;
	private final PasswordEncoder passwordEncoder;

	public UsuarioController(UsuarioService service, CargoRepository cargoRepository, PasswordEncoder passwordEncoder) {
		this.service = service;
		this.cargoRepository = cargoRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	protected CrudService<Usuario, Long> service() {
		return service;
	}

	@Override
	protected Usuario toEntity(UsuarioAdminRequest req) {
		if (req.senha() == null || req.senha().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha é obrigatória ao criar um usuário.");
		}
		Usuario usuario = new Usuario(req.nome(), req.email(), passwordEncoder.encode(req.senha()));
		usuario.setAtivo(req.ativo() == null || req.ativo());
		sincronizarCargos(req.cargoIds(), usuario);
		return usuario;
	}

	@Override
	protected void apply(UsuarioAdminRequest req, Usuario usuario) {
		usuario.setNome(req.nome());
		usuario.setEmail(req.email());
		if (req.ativo() != null) {
			usuario.setAtivo(req.ativo());
		}
		// Senha só é alterada quando informada — ausente/vazia mantém a atual.
		if (req.senha() != null && !req.senha().isBlank()) {
			usuario.setSenhaHash(passwordEncoder.encode(req.senha()));
		}
		sincronizarCargos(req.cargoIds(), usuario);
	}

	@Override
	protected UsuarioAdminResponse toResponse(Usuario usuario) {
		return UsuarioAdminResponse.from(usuario);
	}

	/** Filtro opcional {@code ?q=}: busca por nome ou e-mail (case-insensitive). */
	@Override
	protected Specification<Usuario> filtro(Map<String, String> params) {
		String q = params.get("q");
		if (q == null || q.isBlank()) {
			return null;
		}
		String like = "%" + q.trim().toLowerCase() + "%";
		return (root, query, cb) -> cb.or(
				cb.like(cb.lower(root.get("nome")), like),
				cb.like(cb.lower(root.get("email")), like));
	}

	/** Sincroniza o lado dono (usuario_cargo); valida cada id (400 se inválido). */
	private void sincronizarCargos(Set<Long> ids, Usuario usuario) {
		usuario.getCargos().clear();
		if (ids == null || ids.isEmpty()) {
			return;
		}
		for (Long id : ids) {
			usuario.getCargos().add(cargoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
					HttpStatus.BAD_REQUEST, "Cargo inexistente: " + id)));
		}
	}
}
