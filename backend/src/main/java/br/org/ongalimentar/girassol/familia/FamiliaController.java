package br.org.ongalimentar.girassol.familia;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.org.ongalimentar.girassol.common.crud.CrudController;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.common.crud.PaginatedList;
import br.org.ongalimentar.girassol.familia.dto.FamiliaRequest;
import br.org.ongalimentar.girassol.familia.dto.FamiliaResponse;

/**
 * CRUD REST de {@link Familia} — exemplo de reaproveitamento da base genérica
 * ({@link CrudController}). O específico aqui é só o mapeamento DTO↔entidade e um
 * filtro de busca por nome/CPF ({@code ?q=}). Autorização RBAC fica no
 * {@link FamiliaService}.
 */
@RestController
@RequestMapping("/api/familias")
public class FamiliaController extends CrudController<Familia, Long, FamiliaRequest, FamiliaResponse> {

	private final FamiliaService service;

	public FamiliaController(FamiliaService service) {
		this.service = service;
	}

	@Override
	protected CrudService<Familia, Long> service() {
		return service;
	}

	/**
	 * Sobrescreve a listagem genérica para mapear com {@link FamiliaResponse#paraListagem}
	 * em vez de {@link #toResponse} — a listagem não usa as coleções da família
	 * (telefones, dependentes, saúde, etc.), então evita inicializá-las por linha.
	 */
	@Override
	@GetMapping
	public PaginatedList<FamiliaResponse> listar(@RequestParam(required = false) Map<String, String> params, Pageable pageable) {
		Page<Familia> page = service().list(filtro(params == null ? Map.of() : params), pageable);
		return PaginatedList.from(page, FamiliaResponse::paraListagem);
	}

	@Override
	protected Familia toEntity(FamiliaRequest req) {
		Familia familia = new Familia();
		apply(req, familia);
		return familia;
	}

	@Override
	protected void apply(FamiliaRequest req, Familia f) {
		f.setNome(req.nome());
		f.setNomeSocial(req.nomeSocial());
		f.setDataNascimento(req.dataNascimento());
		f.setGenero(req.genero());
		f.setEstadoCivil(req.estadoCivil());
		f.setIndicacao(req.indicacao());
		f.setNomeMae(req.nomeMae());
		f.setEmail(req.email());
		f.setCpf(req.cpf());
		f.setRg(req.rg());
		f.setNis(req.nis());
		f.setNaturalidade(req.naturalidade());
		f.setObservacoes(req.observacoes());
	}

	@Override
	protected FamiliaResponse toResponse(Familia f) {
		return FamiliaResponse.from(f);
	}

	/** Filtro opcional {@code ?q=}: busca por nome ou CPF (case-insensitive). */
	@Override
	protected Specification<Familia> filtro(Map<String, String> params) {
		String q = params.get("q");
		if (q == null || q.isBlank()) {
			return null;
		}
		String like = "%" + q.trim().toLowerCase() + "%";
		return (root, query, cb) -> cb.or(
				cb.like(cb.lower(root.get("nome")), like),
				cb.like(cb.lower(root.get("cpf")), like));
	}
}
