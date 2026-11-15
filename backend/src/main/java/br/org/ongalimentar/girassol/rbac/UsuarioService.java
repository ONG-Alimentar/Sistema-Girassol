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
 * CRUD de {@link Usuario} sobre a base genérica, com guards {@code USUARIO:*}.
 * Como o {@code open-in-view=false}, a coleção lazy {@code cargos} é inicializada
 * aqui, dentro da transação, para o mapeamento do DTO conseguir lê-la no controller.
 */
@Service
public class UsuarioService extends CrudService<Usuario, Long> {

	public UsuarioService(UsuarioRepository repository) {
		super(repository, "Usuário");
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('USUARIO:READ')")
	public Page<Usuario> list(Specification<Usuario> filtro, Pageable pageable) {
		Page<Usuario> page = super.list(filtro, pageable);
		page.forEach(u -> u.getCargos().size());
		return page;
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('USUARIO:READ')")
	public Usuario buscar(Long id) {
		Usuario usuario = super.buscar(id);
		usuario.getCargos().size();
		return usuario;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('USUARIO:CREATE')")
	public Usuario criar(Usuario entidade) {
		Usuario salvo = super.criar(entidade);
		salvo.getCargos().size();
		return salvo;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('USUARIO:UPDATE')")
	public Usuario atualizar(Long id, Consumer<Usuario> patch) {
		Usuario salvo = super.atualizar(id, patch);
		salvo.getCargos().size();
		return salvo;
	}

	@Override
	@PreAuthorize("hasAuthority('USUARIO:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}
}
