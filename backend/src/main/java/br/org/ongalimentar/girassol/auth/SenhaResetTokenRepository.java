package br.org.ongalimentar.girassol.auth;

import java.util.List;

import br.org.ongalimentar.girassol.common.crud.BaseRepository;
import br.org.ongalimentar.girassol.rbac.Usuario;

public interface SenhaResetTokenRepository extends BaseRepository<SenhaResetToken, Long> {

	List<SenhaResetToken> findByUsuarioAndUsadoFalse(Usuario usuario);
}
