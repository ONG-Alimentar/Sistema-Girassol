package br.org.ongalimentar.girassol.rbac;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.org.ongalimentar.girassol.common.crud.BaseRepository;

public interface UsuarioRepository extends BaseRepository<Usuario, Long> {

	boolean existsByEmail(String email);

	Optional<Usuario> findByEmail(String email);

	@Query("""
			select distinct u from Usuario u
			left join fetch u.cargos c
			left join fetch c.permissoes
			where u.email = :email
			""")
	Optional<Usuario> findByEmailComAutoridades(@Param("email") String email);

	@Query("""
			select count(distinct u) from Usuario u
			join u.cargos c join c.permissoes p
			where u.ativo = true and p.codigo = :codigo
			""")
	long countAtivosComPermissao(@Param("codigo") String codigo);
}
