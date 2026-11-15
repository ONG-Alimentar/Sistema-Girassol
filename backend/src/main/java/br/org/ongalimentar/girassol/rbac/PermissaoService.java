package br.org.ongalimentar.girassol.rbac;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import br.org.ongalimentar.girassol.common.crud.CrudService;

/**
 * CRUD da {@link Permissao} (catálogo RBAC) sobre a base genérica. Os guards
 * {@code PERMISSAO:*} restringem a administração do catálogo ao Administrador —
 * padrão de autorização por método do {@code SecurityConfig}.
 */
@Service
public class PermissaoService extends CrudService<Permissao, Long> {

	public PermissaoService(PermissaoRepository repository) {
		super(repository, "Permissão");
	}

	@Override
	@PreAuthorize("hasAuthority('PERMISSAO:READ')")
	public Page<Permissao> list(Specification<Permissao> filtro, Pageable pageable) {
		return super.list(filtro, pageable);
	}

	@Override
	@PreAuthorize("hasAuthority('PERMISSAO:READ')")
	public Permissao buscar(Long id) {
		return super.buscar(id);
	}

	@Override
	@PreAuthorize("hasAuthority('PERMISSAO:CREATE')")
	public Permissao criar(Permissao entidade) {
		return super.criar(entidade);
	}

	@Override
	@PreAuthorize("hasAuthority('PERMISSAO:UPDATE')")
	public Permissao atualizar(Long id, Consumer<Permissao> patch) {
		return super.atualizar(id, patch);
	}

	@Override
	@PreAuthorize("hasAuthority('PERMISSAO:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}
}
