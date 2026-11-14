package br.org.ongalimentar.girassol.familia;

import br.org.ongalimentar.girassol.common.crud.BaseRepository;

import java.util.List;

/** Repositório da {@link Familia} sobre o {@link BaseRepository} (CRUD + filtro). */
public interface FamiliaRepository extends BaseRepository<Familia, Long> {
	List<Familia> findByNomeContainingIgnoreCase(String nome);
}
