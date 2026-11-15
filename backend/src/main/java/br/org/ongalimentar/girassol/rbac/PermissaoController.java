package br.org.ongalimentar.girassol.rbac;

import java.util.Map;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.org.ongalimentar.girassol.common.crud.CrudController;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.rbac.dto.PermissaoRequest;
import br.org.ongalimentar.girassol.rbac.dto.PermissaoResponse;

/**
 * CRUD REST do catálogo de {@link Permissao} sobre a base genérica
 * ({@link CrudController}). O específico é o mapeamento DTO↔entidade e o filtro
 * {@code ?q=} por código. Autorização RBAC fica no {@link PermissaoService}.
 */
@RestController
@RequestMapping("/api/permissoes")
public class PermissaoController extends CrudController<Permissao, Long, PermissaoRequest, PermissaoResponse> {

	private final PermissaoService service;

	public PermissaoController(PermissaoService service) {
		this.service = service;
	}

	@Override
	protected CrudService<Permissao, Long> service() {
		return service;
	}

	@Override
	protected Permissao toEntity(PermissaoRequest req) {
		return new Permissao(req.codigo());
	}

	@Override
	protected void apply(PermissaoRequest req, Permissao p) {
		p.setCodigo(req.codigo());
	}

	@Override
	protected PermissaoResponse toResponse(Permissao p) {
		return PermissaoResponse.from(p);
	}

	/** Filtro opcional {@code ?q=}: busca por código (case-insensitive). */
	@Override
	protected Specification<Permissao> filtro(Map<String, String> params) {
		String q = params.get("q");
		if (q == null || q.isBlank()) {
			return null;
		}
		String like = "%" + q.trim().toLowerCase() + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("codigo")), like);
	}
}
