package br.org.ongalimentar.girassol.familia;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import br.org.ongalimentar.girassol.common.crud.CrudService;

/**
 * CRUD da {@link Familia} sobre a base genérica. O código específico aqui é
 * mínimo: apenas o vínculo com o repositório e os guards RBAC por operação
 * ({@code FAMILIA:*}), sobrescrevendo os métodos da base com {@code @PreAuthorize}
 * (padrão de autorização por método do {@code SecurityConfig}).
 */
@Service
public class FamiliaService extends CrudService<Familia, Long> {

	public FamiliaService(FamiliaRepository repository) {
		super(repository, "Família");
	}

	@Override
	@PreAuthorize("hasAuthority('FAMILIA:READ')")
	public Page<Familia> list(Specification<Familia> filtro, Pageable pageable) {
		return super.list(filtro, pageable);
	}

	@Override
	@PreAuthorize("hasAuthority('FAMILIA:READ')")
	public Familia buscar(Long id) {
		return super.buscar(id);
	}

	@Override
	@PreAuthorize("hasAuthority('FAMILIA:CREATE')")
	public Familia criar(Familia entidade) {
		return super.criar(entidade);
	}

	@Override
	@PreAuthorize("hasAuthority('FAMILIA:UPDATE')")
	public Familia atualizar(Long id, Consumer<Familia> patch) {
		return super.atualizar(id, patch);
	}

	@Override
	@PreAuthorize("hasAuthority('FAMILIA:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}
}
