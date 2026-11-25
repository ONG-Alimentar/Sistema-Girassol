package br.org.ongalimentar.girassol.visita;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.org.ongalimentar.girassol.auth.AppUserDetails;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

@Service
public class VisitaService extends CrudService<Visita, Long> {

	private final UsuarioRepository usuarioRepository;

	public VisitaService(VisitaRepository repository, UsuarioRepository usuarioRepository) {
		super(repository, "Visita");
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('VISITA:READ')")
	public Page<Visita> list(Specification<Visita> filtro, Pageable pageable) {
		if (pageable.isPaged()) {
			Sort sort = pageable.getSort();
			for (Sort.Order order : sort) {
				if (!"data".equals(order.getProperty()) && !"nome".equals(order.getProperty())
						&& !"id".equals(order.getProperty())) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo de ordenação inválido.");
				}
			}
			if (sort.isUnsorted()) {
				sort = Sort.by(Sort.Order.desc("data"));
			}
			if (sort.getOrderFor("id") == null) {
				sort = sort.and(Sort.by(Sort.Order.desc("id")));
			}
			pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
		}
		return super.list(filtro, pageable);
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('VISITA:READ')")
	public Visita buscar(Long id) {
		return super.buscar(id);
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('VISITA:CREATE')")
	public Visita criar(Visita entidade) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof AppUserDetails usuarioAtual)) {
			throw new AccessDeniedException("Usuário autenticado não identificado.");
		}
		Usuario usuario = usuarioRepository.findById(usuarioAtual.getId())
				.orElseThrow(() -> new AccessDeniedException("Usuário autenticado não encontrado."));
		entidade.setCriadoPor(usuario);
		return super.criar(entidade);
	}

	@Override
	@PreAuthorize("denyAll()")
	public Visita atualizar(Long id, Consumer<Visita> patch) {
		throw new AccessDeniedException("Não é permitido editar visitas.");
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('VISITA:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}
}
