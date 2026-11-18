package br.org.ongalimentar.girassol.familia;

import br.org.ongalimentar.girassol.common.crud.BaseRepository;

import java.util.List;

public interface FamiliaRepository extends BaseRepository<Familia, Long> {
	List<Familia> findByNomeContainingIgnoreCase(String nome);
}
