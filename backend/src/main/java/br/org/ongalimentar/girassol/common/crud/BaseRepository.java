package br.org.ongalimentar.girassol.common.crud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseRepository<E, ID> extends JpaRepository<E, ID>, JpaSpecificationExecutor<E> {
}
