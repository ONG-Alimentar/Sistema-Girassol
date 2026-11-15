package br.org.ongalimentar.girassol.rbac;

import java.util.Optional;

import br.org.ongalimentar.girassol.common.crud.BaseRepository;

public interface CargoRepository extends BaseRepository<Cargo, Long> {

	Optional<Cargo> findByNome(String nome);
}
