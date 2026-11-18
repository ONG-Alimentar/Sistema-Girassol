package br.org.ongalimentar.girassol.common.crud;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;

import jakarta.validation.Valid;

public abstract class CrudController<E, ID, REQ, RES> {

	protected abstract CrudService<E, ID> service();

	protected abstract E toEntity(REQ req);

	protected abstract void apply(REQ req, E entity);

	protected abstract RES toResponse(E entity);

	protected Specification<E> filtro(Map<String, String> params) {
		return null;
	}

	@GetMapping
	public PaginatedList<RES> listar(@RequestParam(required = false) Map<String, String> params, Pageable pageable) {
		Page<E> page = service().list(filtro(params == null ? Map.of() : params), pageable);
		return PaginatedList.from(page, this::toResponse);
	}

	@GetMapping("/{id}")
	public RES buscar(@PathVariable ID id) {
		return toResponse(service().buscar(id));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RES criar(@Valid @RequestBody REQ req) {
		return toResponse(service().criar(toEntity(req)));
	}

	@PutMapping("/{id}")
	public RES atualizar(@PathVariable ID id, @Valid @RequestBody REQ req) {
		return toResponse(service().atualizar(id, entity -> apply(req, entity)));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable ID id) {
		service().excluir(id);
	}
}
