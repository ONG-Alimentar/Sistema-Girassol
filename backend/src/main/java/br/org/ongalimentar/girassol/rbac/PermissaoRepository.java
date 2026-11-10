package br.org.ongalimentar.girassol.rbac;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissaoRepository extends JpaRepository<Permissao, Long> {

	Optional<Permissao> findByCodigo(String codigo);
}
