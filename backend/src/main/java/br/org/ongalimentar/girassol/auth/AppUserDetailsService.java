package br.org.ongalimentar.girassol.auth;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.rbac.Cargo;
import br.org.ongalimentar.girassol.rbac.Permissao;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

@Service
public class AppUserDetailsService implements UserDetailsService {

	private final UsuarioRepository usuarioRepository;

	public AppUserDetailsService(UsuarioRepository usuarioRepository) {
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		Usuario usuario = usuarioRepository.findByEmailComAutoridades(email)
				.orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));

		var authorities = usuario.getCargos().stream()
				.flatMap(cargo -> cargo.getPermissoes().stream())
				.map(Permissao::getCodigo)
				.distinct()
				.map(SimpleGrantedAuthority::new)
				.toList();

		var cargos = usuario.getCargos().stream()
				.map(Cargo::getNome)
				.sorted()
				.toList();

		return new AppUserDetails(
				usuario.getId(),
				usuario.getEmail(),
				usuario.getNome(),
				usuario.getSenhaHash(),
				usuario.isAtivo(),
				authorities,
				cargos);
	}
}
