package br.org.ongalimentar.girassol.familia;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositório de {@link Servico} (catálogo). Sem CRUD REST próprio — hoje só
 * serve para persistir/consultar serviços em testes; a administração do
 * catálogo fica para quando houver demanda.
 */
public interface ServicoRepository extends JpaRepository<Servico, Long> {
}
