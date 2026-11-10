package br.org.ongalimentar.girassol.rbac;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CargoRepository extends JpaRepository<Cargo, Long> {

	Optional<Cargo> findByNome(String nome);
}
