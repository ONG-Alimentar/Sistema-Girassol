package br.org.ongalimentar.girassol.rbac;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	boolean existsByEmail(String email);

	/**
	 * Carrega o usuário com seus cargos e as permissões de cada cargo já
	 * inicializados — usado pelo {@code UserDetailsService} para montar as
	 * autoridades sem depender de sessão aberta ({@code open-in-view=false}).
	 */
	@Query("""
			select distinct u from Usuario u
			left join fetch u.cargos c
			left join fetch c.permissoes
			where u.email = :email
			""")
	Optional<Usuario> findByEmailComAutoridades(@Param("email") String email);
}
