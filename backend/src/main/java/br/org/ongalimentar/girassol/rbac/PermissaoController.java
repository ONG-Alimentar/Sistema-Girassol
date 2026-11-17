package br.org.ongalimentar.girassol.rbac;

import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.org.ongalimentar.girassol.common.crud.PaginatedList;
import br.org.ongalimentar.girassol.rbac.dto.PermissaoResponse;

@RestController
@RequestMapping("/api/permissoes")
public class PermissaoController {

	private final PermissaoService service;

	public PermissaoController(PermissaoService service) {
		this.service = service;
	}

	@GetMapping
	public PaginatedList<PermissaoResponse> listar(@RequestParam(required = false) Map<String, String> params,
			Pageable pageable) {
		return PaginatedList.from(service.list(filtro(params == null ? Map.of() : params), pageable),
				PermissaoResponse::from);
	}

	@GetMapping("/{id}")
	public PermissaoResponse buscar(@PathVariable Long id) {
		return PermissaoResponse.from(service.buscar(id));
	}

	/** Filtro opcional {@code ?q=}: busca por código (case-insensitive). */
	private Specification<Permissao> filtro(Map<String, String> params) {
		String q = params.get("q");
		if (q == null || q.isBlank()) {
			return null;
		}
		String like = "%" + q.trim().toLowerCase() + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("codigo")), like);
	}
}
