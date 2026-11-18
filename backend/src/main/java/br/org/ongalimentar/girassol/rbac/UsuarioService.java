package br.org.ongalimentar.girassol.rbac;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.org.ongalimentar.girassol.common.crud.CrudService;

@Service
public class UsuarioService extends CrudService<Usuario, Long> {

	static final String PERMISSAO_ADMIN = "USUARIO:UPDATE";

	private final UsuarioRepository repository;

	public UsuarioService(UsuarioRepository repository) {
		super(repository, "Usuário");
		this.repository = repository;
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
		long adminsAntes = repository.countAtivosComPermissao(PERMISSAO_ADMIN);
		Usuario salvo = super.atualizar(id, patch);
		salvo.getCargos().size();
		garantirAdministradorRemanescente(adminsAntes);
		return salvo;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('USUARIO:DELETE')")
	public void excluir(Long id) {
		long adminsAntes = repository.countAtivosComPermissao(PERMISSAO_ADMIN);
		super.excluir(id);
		garantirAdministradorRemanescente(adminsAntes);
	}

	private void garantirAdministradorRemanescente(long adminsAntes) {
		if (adminsAntes >= 1 && repository.countAtivosComPermissao(PERMISSAO_ADMIN) == 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Operação bloqueada: deixaria o sistema sem nenhum administrador ativo.");
		}
	}
}
