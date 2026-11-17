package br.org.ongalimentar.girassol.rbac;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.common.error.ResourceNotFoundException;

@Service
public class PermissaoService {

	private final PermissaoRepository repository;

	public PermissaoService(PermissaoRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('PERMISSAO:READ')")
	public Page<Permissao> list(Specification<Permissao> filtro, Pageable pageable) {
		return repository.findAll(filtro, pageable);
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('PERMISSAO:READ')")
	public Permissao buscar(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada: " + id));
	}
}
