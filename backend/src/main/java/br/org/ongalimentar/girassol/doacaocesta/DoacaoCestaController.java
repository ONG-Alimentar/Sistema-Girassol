package br.org.ongalimentar.girassol.doacaocesta;

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
import br.org.ongalimentar.girassol.doacaocesta.dto.CestaRequest;
import br.org.ongalimentar.girassol.doacaocesta.dto.CestaResponse;
import br.org.ongalimentar.girassol.doacaocesta.dto.ItemCestaRequest;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.FamiliaRepository;

/**
 * CRUD REST de {@link DoacaoCesta} sobre a base genérica ({@link CrudController}).
 * O específico aqui é o mapeamento DTO↔entidade (resolvendo a família e
 * reconstruindo os itens) e os filtros de listagem ({@code ?familia=},
 * {@code ?q=} por nome da família e {@code ?startDate=}/{@code ?endDate=}).
 * Autorização RBAC fica no {@link DoacaoCestaService}.
 */
@RestController
@RequestMapping("/api/cestas")
public class DoacaoCestaController extends CrudController<DoacaoCesta, Long, CestaRequest, CestaResponse> {

	private final DoacaoCestaService service;
	private final FamiliaRepository familiaRepository;

	public DoacaoCestaController(DoacaoCestaService service, FamiliaRepository familiaRepository) {
		this.service = service;
		this.familiaRepository = familiaRepository;
	}

	@Override
	protected CrudService<DoacaoCesta, Long> service() {
		return service;
	}

	@Override
	protected DoacaoCesta toEntity(CestaRequest req) {
		DoacaoCesta cesta = new DoacaoCesta();
		apply(req, cesta);
		return cesta;
	}

	@Override
	protected void apply(CestaRequest req, DoacaoCesta cesta) {
		cesta.setData(req.data());
		cesta.setFamilia(familia(req.familiaId()));

		// Reconstrói os itens: limpa os atuais (orphanRemoval cuida da exclusão)
		// e re-adiciona a partir do request.
		cesta.getItens().clear();
		for (ItemCestaRequest item : req.itens()) {
			cesta.addItem(new ItemCesta(item.descricao(), item.quantidade()));
		}
	}

	@Override
	protected CestaResponse toResponse(DoacaoCesta cesta) {
		return CestaResponse.from(cesta);
	}

	/** Filtros: {@code ?familia=} (id), {@code ?q=} (nome da família) e intervalo de datas. */
	@Override
	protected Specification<DoacaoCesta> filtro(Map<String, String> params) {
		List<Specification<DoacaoCesta>> specs = new ArrayList<>();

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
