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

/**
 * CRUD de {@link Usuario} sobre a base genérica, com guards {@code USUARIO:*}.
 *
 * <p>Como o {@code open-in-view=false}, a coleção lazy {@code cargos} é inicializada
 * aqui, dentro da transação, para o mapeamento do DTO conseguir lê-la no controller.
 *
 * <p>Também protege o invariante "deve restar ao menos um administrador ativo":
 * nenhuma exclusão/edição pode deixar o sistema sem um usuário ativo capaz de gerir
 * usuários ({@link #PERMISSAO_ADMIN}). A verificação roda <b>após</b> a alteração,
 * dentro da mesma transação, e lança para forçar rollback.
 */
@Service
public class UsuarioService extends CrudService<Usuario, Long> {

	/** Permissão que caracteriza "pode administrar o RBAC". */
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
		// Desativar ou remover o cargo de administração do último admin deixaria o
		// sistema sem quem administre — bloqueia (rollback da transação).
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

	/**
	 * Bloqueia a operação se ela zerou os administradores — ou seja, só quando havia
	 * ao menos um antes e nenhum restou. Um sistema que já estava sem admin (ex.: antes
	 * do seed) não tem edições comuns bloqueadas.
	 */
	private void garantirAdministradorRemanescente(long adminsAntes) {
		if (adminsAntes >= 1 && repository.countAtivosComPermissao(PERMISSAO_ADMIN) == 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Operação bloqueada: deixaria o sistema sem nenhum administrador ativo.");
		}
	}
}
