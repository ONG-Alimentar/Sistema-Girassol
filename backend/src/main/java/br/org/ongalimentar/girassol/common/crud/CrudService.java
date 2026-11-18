package br.org.ongalimentar.girassol.common.crud;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.common.error.ResourceNotFoundException;

public abstract class CrudService<E, ID> {

	private final BaseRepository<E, ID> repository;
	private final String recurso;

	protected CrudService(BaseRepository<E, ID> repository, String recurso) {
		this.repository = repository;
		this.recurso = recurso;
	}

	@Transactional(readOnly = true)
	public Page<E> list(Specification<E> filtro, Pageable pageable) {
		return repository.findAll(filtro, pageable);
	}

	@Transactional(readOnly = true)
	public E buscar(ID id) {
		return repository.findById(id).orElseThrow(() -> naoEncontrado(id));
	}

	@Transactional
	public E criar(E entidade) {
		return repository.save(entidade);
	}

	@Transactional
	public E atualizar(ID id, Consumer<E> patch) {
		E entidade = repository.findById(id).orElseThrow(() -> naoEncontrado(id));
		patch.accept(entidade);
		return repository.save(entidade);
	}

	@Transactional
	public void excluir(ID id) {
		if (!repository.existsById(id)) {
			throw naoEncontrado(id);
		}
		repository.deleteById(id);
	}

	private ResourceNotFoundException naoEncontrado(ID id) {
		return new ResourceNotFoundException(recurso + " não encontrado(a): " + id);
	}
}
