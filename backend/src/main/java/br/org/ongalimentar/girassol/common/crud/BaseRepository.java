package br.org.ongalimentar.girassol.common.crud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Repositório base das entidades que usam o CRUD genérico: JPA (CRUD + paginação)
 * + {@link JpaSpecificationExecutor} (filtro dinâmico via {@code Specification}).
 * Não é um bean em si ({@code @NoRepositoryBean}); cada entidade estende com os
 * tipos concretos.
 */
@NoRepositoryBean
public interface BaseRepository<E, ID> extends JpaRepository<E, ID>, JpaSpecificationExecutor<E> {
}
