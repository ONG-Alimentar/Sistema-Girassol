package br.org.ongalimentar.girassol.auth;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Principal autenticado. Carrega os dados que a API expõe (id, email, nome) e as
 * autoridades (permissões {@code MODULO:ACAO}) já materializadas, para não depender
 * de sessão JPA aberta após o login.
 */
public class AppUserDetails implements UserDetails {

	private final Long id;
	private final String email;
	private final String nome;
	private final String senhaHash;
	private final boolean ativo;
	private final Collection<? extends GrantedAuthority> authorities;

	public AppUserDetails(Long id, String email, String nome, String senhaHash,
			boolean ativo, Collection<? extends GrantedAuthority> authorities) {
		this.id = id;
		this.email = email;
		this.nome = nome;
		this.senhaHash = senhaHash;
		this.ativo = ativo;
		this.authorities = authorities;
	}

	public Long getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getNome() {
		return nome;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return senhaHash;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isEnabled() {
		return ativo;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}
}
