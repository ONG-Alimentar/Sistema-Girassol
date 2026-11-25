package br.org.ongalimentar.girassol.visita;

import java.util.Locale;
import java.util.Map;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.org.ongalimentar.girassol.common.crud.CrudController;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.visita.dto.VisitaRequest;
import br.org.ongalimentar.girassol.visita.dto.VisitaResponse;

@RestController
@RequestMapping("/api/visitas")
public class VisitaController extends CrudController<Visita, Long, VisitaRequest, VisitaResponse> {

	private final VisitaService service;

	public VisitaController(VisitaService service) {
		this.service = service;
	}

	@Override
	protected CrudService<Visita, Long> service() {
		return service;
	}

	@Override
	protected Visita toEntity(VisitaRequest req) {
		Visita visita = new Visita(null, req.data());
		visita.setTurno(req.turno());
		visita.setNome(req.nome().trim());
		visita.setIdade(req.idade());
		visita.setContato(req.contato());
		visita.setSituacao(req.situacao());
		visita.setMotivoDaProcura(req.motivoDaProcura());
		visita.setPedidoAtendido(req.pedidoAtendido());
		visita.setObservacoes(req.observacoes());
		return visita;
	}

	@Override
	protected void apply(VisitaRequest req, Visita entity) {
		throw new AccessDeniedException("Não é permitido editar visitas.");
	}

	@Override
	protected VisitaResponse toResponse(Visita entity) {
		return VisitaResponse.from(entity);
	}

	@Override
	protected Specification<Visita> filtro(Map<String, String> params) {
		String q = params.get("q");
		if (q == null || q.isBlank()) {
			return null;
		}
		String termo = q.trim().toLowerCase(Locale.ROOT)
				.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
		return (root, query, cb) -> cb.like(cb.lower(root.<String>get("nome")), "%" + termo + "%", '\\');
	}
}
