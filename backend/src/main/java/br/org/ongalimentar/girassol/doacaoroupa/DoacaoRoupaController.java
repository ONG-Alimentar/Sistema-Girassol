package br.org.ongalimentar.girassol.doacaoroupa;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.org.ongalimentar.girassol.common.crud.CrudController;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.common.error.ResourceNotFoundException;
import br.org.ongalimentar.girassol.doacaoroupa.dto.PecaRoupaRequest;
import br.org.ongalimentar.girassol.doacaoroupa.dto.RoupaRequest;
import br.org.ongalimentar.girassol.doacaoroupa.dto.RoupaResponse;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.FamiliaRepository;

/**
 * CRUD REST de {@link DoacaoRoupa} sobre a base genérica ({@link CrudController}).
 * O específico aqui é o mapeamento DTO↔entidade (resolvendo a família e
 * reconstruindo as peças, que são opcionais) e os filtros de listagem
 * ({@code ?familia=}, {@code ?q=} por nome da família e
 * {@code ?startDate=}/{@code ?endDate=}). Autorização RBAC fica no
 * {@link DoacaoRoupaService}.
 */
@RestController
@RequestMapping("/api/roupas")
public class DoacaoRoupaController extends CrudController<DoacaoRoupa, Long, RoupaRequest, RoupaResponse> {

	private final DoacaoRoupaService service;
	private final FamiliaRepository familiaRepository;

	public DoacaoRoupaController(DoacaoRoupaService service, FamiliaRepository familiaRepository) {
		this.service = service;
		this.familiaRepository = familiaRepository;
	}

	@Override
	protected CrudService<DoacaoRoupa, Long> service() {
		return service;
	}

	@Override
	protected DoacaoRoupa toEntity(RoupaRequest req) {
		DoacaoRoupa roupa = new DoacaoRoupa();
		apply(req, roupa);
		return roupa;
	}

	@Override
	protected void apply(RoupaRequest req, DoacaoRoupa roupa) {
		roupa.setData(req.data());
		roupa.setQuantidade(req.quantidade());
		roupa.setFamilia(familia(req.familiaId()));

		// Reconstrói as peças: limpa as atuais (orphanRemoval cuida da exclusão)
		// e re-adiciona a partir do request. A lista é opcional.
		roupa.getPecas().clear();
		List<PecaRoupaRequest> pecas = req.pecas() != null ? req.pecas() : List.of();
		for (PecaRoupaRequest peca : pecas) {
			PecaRoupa pecaRoupa = new PecaRoupa(peca.descricao());
			pecaRoupa.setTamanho(peca.tamanho());
			pecaRoupa.setGenero(peca.genero());
			roupa.addPecaRoupa(pecaRoupa);
		}
	}

	@Override
	protected RoupaResponse toResponse(DoacaoRoupa roupa) {
		return RoupaResponse.from(roupa);
	}

	/** Filtros: {@code ?familia=} (id), {@code ?q=} (nome da família) e intervalo de datas. */
	@Override
	protected Specification<DoacaoRoupa> filtro(Map<String, String> params) {
		List<Specification<DoacaoRoupa>> specs = new ArrayList<>();

		String familiaId = params.get("familia");
		if (familiaId != null && !familiaId.isBlank()) {
			Long id = Long.valueOf(familiaId.trim());
			specs.add((root, query, cb) -> cb.equal(root.get("familia").get("id"), id));
		}

		String q = params.get("q");
		if (q != null && !q.isBlank()) {
			String like = "%" + q.trim().toLowerCase() + "%";
			specs.add((root, query, cb) -> cb.like(cb.lower(root.get("familia").get("nome")), like));
		}

		String startDate = params.get("startDate");
		if (startDate != null && !startDate.isBlank()) {
			LocalDate de = LocalDate.parse(startDate.trim());
			specs.add((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("data"), de));
		}

		String endDate = params.get("endDate");
		if (endDate != null && !endDate.isBlank()) {
			LocalDate ate = LocalDate.parse(endDate.trim());
			specs.add((root, query, cb) -> cb.lessThanOrEqualTo(root.get("data"), ate));
		}

		return specs.isEmpty() ? null : Specification.allOf(specs);
	}

	private Familia familia(Long id) {
		return familiaRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Família não encontrada: " + id));
	}
}
