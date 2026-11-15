package br.org.ongalimentar.girassol.rbac;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.org.ongalimentar.girassol.common.crud.BaseRepository;

public interface UsuarioRepository extends BaseRepository<Usuario, Long> {

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

	/**
	 * Conta usuários <b>ativos</b> cujo conjunto de cargos concede a permissão
	 * {@code codigo}. Usado para garantir que sempre reste um administrador capaz
	 * de gerir o RBAC (ver {@code UsuarioService}).
	 */
	@Query("""
			select count(distinct u) from Usuario u
			join u.cargos c join c.permissoes p
			where u.ativo = true and p.codigo = :codigo
			""")
	long countAtivosComPermissao(@Param("codigo") String codigo);
}
