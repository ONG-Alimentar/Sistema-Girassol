package br.org.ongalimentar.girassol.rbac;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.common.crud.CrudService;

/**
 * CRUD do {@link Cargo} sobre a base genérica, com guards {@code CARGO:*}. Como o
 * {@code open-in-view=false}, as coleções lazy ({@code permissoes}, {@code usuarios})
 * são inicializadas aqui, dentro da transação, para o mapeamento do DTO conseguir
 * lê-las no controller.
 */
@Service
public class CargoService extends CrudService<Cargo, Long> {

	public CargoService(CargoRepository repository) {
		super(repository, "Cargo");
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('CARGO:READ')")
	public Page<Cargo> list(Specification<Cargo> filtro, Pageable pageable) {
		Page<Cargo> page = super.list(filtro, pageable);
		page.forEach(CargoService::inicializarColecoes);
		return page;
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('CARGO:READ')")
	public Cargo buscar(Long id) {
		Cargo cargo = super.buscar(id);
		inicializarColecoes(cargo);
		return cargo;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('CARGO:CREATE')")
	public Cargo criar(Cargo entidade) {
		Cargo salvo = super.criar(entidade);
		inicializarColecoes(salvo);
		return salvo;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('CARGO:UPDATE')")
	public Cargo atualizar(Long id, Consumer<Cargo> patch) {
		Cargo salvo = super.atualizar(id, patch);
		inicializarColecoes(salvo);
		return salvo;
	}

	@Override
	@PreAuthorize("hasAuthority('CARGO:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}

	/** Toca as coleções lazy para materializá-las antes de a transação fechar. */
	private static void inicializarColecoes(Cargo cargo) {
		cargo.getPermissoes().size();
		cargo.getUsuarios().size();
	}
}
