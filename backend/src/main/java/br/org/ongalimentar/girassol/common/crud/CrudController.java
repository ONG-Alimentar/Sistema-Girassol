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

/**
 * Controller REST base de CRUD. Uma entidade ganha o CRUD completo apenas
 * estendendo esta classe com {@code @RestController} + {@code @RequestMapping},
 * fornecendo o service e o mapeamento entidade↔DTO.
 *
 * <p>Endpoints: {@code GET /} (paginado/ordenado/filtrado), {@code GET /{id}},
 * {@code POST /}, {@code PUT /{id}}, {@code DELETE /{id}}. Paginação/ordenação vêm
 * do {@link Pageable} (params {@code page}, {@code size}, {@code sort}); o filtro é
 * definido por entidade em {@link #filtro(Map)}.
 *
 * @param <E>   entidade
 * @param <ID>  tipo do id
 * @param <REQ> DTO de entrada (create/update)
 * @param <RES> DTO de saída
 */
public abstract class CrudController<E, ID, REQ, RES> {

	protected abstract CrudService<E, ID> service();

	/** Cria uma nova entidade a partir do DTO de request. */
	protected abstract E toEntity(REQ req);

	/** Aplica o DTO de request sobre uma entidade existente (update). */
	protected abstract void apply(REQ req, E entity);

	/** Converte a entidade no DTO de response. */
	protected abstract RES toResponse(E entity);

	/** Filtro dinâmico a partir dos query params. Padrão: sem filtro. */
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
