package br.org.ongalimentar.girassol.rbac;

import java.util.Optional;

import br.org.ongalimentar.girassol.common.crud.BaseRepository;

public interface PermissaoRepository extends BaseRepository<Permissao, Long> {

	Optional<Permissao> findByCodigo(String codigo);
}
