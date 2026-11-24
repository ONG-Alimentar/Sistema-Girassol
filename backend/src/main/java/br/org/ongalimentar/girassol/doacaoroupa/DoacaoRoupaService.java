package br.org.ongalimentar.girassol.doacaoroupa;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.common.crud.CrudService;

/**
 * CRUD da {@link DoacaoRoupa} sobre a base genérica. O específico aqui é o
 * vínculo com o repositório, os guards RBAC por operação ({@code ROUPA:*}) e a
 * materialização da coleção lazy {@code pecas} dentro da transação — o mapeamento
 * para DTO acontece no controller, após a transação fechar ({@code open-in-view=false}).
 * Não há cargo com {@code ROUPA:UPDATE} no seed atual (sem edição pela UI), mas o
 * guard abaixo fica mesmo assim — sem ele, {@code atualizar} herdaria o acesso
 * irrestrito da classe-base e o endpoint PUT ficaria aberto a qualquer autenticado.
 */
@Service
public class DoacaoRoupaService extends CrudService<DoacaoRoupa, Long> {

	public DoacaoRoupaService(DoacaoRoupaRepository repository) {
		super(repository, "Doação de roupa");
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('ROUPA:READ')")
	public Page<DoacaoRoupa> list(Specification<DoacaoRoupa> filtro, Pageable pageable) {
		Page<DoacaoRoupa> page = super.list(filtro, pageable);
		page.forEach(DoacaoRoupaService::inicializarPecas);
		return page;
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('ROUPA:READ')")
	public DoacaoRoupa buscar(Long id) {
		DoacaoRoupa roupa = super.buscar(id);
		inicializarPecas(roupa);
		return roupa;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('ROUPA:CREATE')")
	public DoacaoRoupa criar(DoacaoRoupa entidade) {
		DoacaoRoupa salva = super.criar(entidade);
		inicializarPecas(salva);
		return salva;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('ROUPA:UPDATE')")
	public DoacaoRoupa atualizar(Long id, Consumer<DoacaoRoupa> patch) {
		DoacaoRoupa salva = super.atualizar(id, patch);
		inicializarPecas(salva);
		return salva;
	}

	@Override
	@PreAuthorize("hasAuthority('ROUPA:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}

	/** Toca a coleção lazy para materializá-la antes de a transação fechar. */
	private static void inicializarPecas(DoacaoRoupa roupa) {
		roupa.getPecas().size();
	}
}
