package br.org.ongalimentar.girassol.rbac;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.org.ongalimentar.girassol.common.crud.CrudController;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.rbac.dto.CargoRequest;
import br.org.ongalimentar.girassol.rbac.dto.CargoResponse;

@RestController
@RequestMapping("/api/cargos")
public class CargoController extends CrudController<Cargo, Long, CargoRequest, CargoResponse> {

	private final CargoService service;
	private final PermissaoRepository permissaoRepository;

	public CargoController(CargoService service, PermissaoRepository permissaoRepository) {
		this.service = service;
		this.permissaoRepository = permissaoRepository;
	}

	@Override
	protected CrudService<Cargo, Long> service() {
		return service;
	}

	@Override
	protected Cargo toEntity(CargoRequest req) {
		Cargo cargo = new Cargo(req.nome());
		apply(req, cargo);
		return cargo;
	}

	@Override
	protected void apply(CargoRequest req, Cargo cargo) {
		cargo.setNome(req.nome());
		cargo.getPermissoes().clear();
		cargo.getPermissoes().addAll(resolverPermissoes(req.permissaoIds()));
	}

	@Override
	protected CargoResponse toResponse(Cargo cargo) {
		return CargoResponse.from(cargo);
	}

	@Override
	protected Specification<Cargo> filtro(Map<String, String> params) {
		String q = params.get("q");
		if (q == null || q.isBlank()) {
			return null;
		}
		String like = "%" + q.trim().toLowerCase() + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("nome")), like);
	}

	private Set<Permissao> resolverPermissoes(Set<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return Set.of();
		}
		Set<Permissao> permissoes = new LinkedHashSet<>();
		for (Long id : ids) {
			permissoes.add(permissaoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
					HttpStatus.BAD_REQUEST, "Permissão inexistente: " + id)));
		}
		return permissoes;
	}
}
