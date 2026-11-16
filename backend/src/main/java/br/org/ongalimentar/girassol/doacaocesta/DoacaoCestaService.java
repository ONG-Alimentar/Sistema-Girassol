package br.org.ongalimentar.girassol.doacaocesta;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.common.crud.CrudService;

/**
 * CRUD da {@link DoacaoCesta} sobre a base genérica. O específico aqui é o
 * vínculo com o repositório, os guards RBAC por operação ({@code CESTA:*}) e a
 * materialização da coleção lazy {@code itens} dentro da transação — o mapeamento
 * para DTO acontece no controller, após a transação fechar ({@code open-in-view=false}).
 */
@Service
public class DoacaoCestaService extends CrudService<DoacaoCesta, Long> {

	public DoacaoCestaService(DoacaoCestaRepository repository) {
		super(repository, "Doação de cesta");
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('CESTA:READ')")
	public Page<DoacaoCesta> list(Specification<DoacaoCesta> filtro, Pageable pageable) {
		Page<DoacaoCesta> page = super.list(filtro, pageable);
		page.forEach(DoacaoCestaService::inicializarItens);
		return page;
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('CESTA:READ')")
	public DoacaoCesta buscar(Long id) {
		DoacaoCesta cesta = super.buscar(id);
		inicializarItens(cesta);
		return cesta;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('CESTA:CREATE')")
	public DoacaoCesta criar(DoacaoCesta entidade) {
		DoacaoCesta salva = super.criar(entidade);
		inicializarItens(salva);
		return salva;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('CESTA:UPDATE')")
	public DoacaoCesta atualizar(Long id, Consumer<DoacaoCesta> patch) {
		DoacaoCesta salva = super.atualizar(id, patch);
		inicializarItens(salva);
		return salva;
	}

	@Override
	@PreAuthorize("hasAuthority('CESTA:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}

	/** Toca a coleção lazy para materializá-la antes de a transação fechar. */
	private static void inicializarItens(DoacaoCesta cesta) {
		cesta.getItens().size();
	}
}
