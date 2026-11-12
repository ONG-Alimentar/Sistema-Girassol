package br.org.ongalimentar.girassol.rbac;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

/**
 * Pessoa autenticável no sistema (assistente social, voluntário interno,
 * profissional, administrador). Recebe {@link Cargo}s, que agrupam as permissões
 * efetivas do usuário.
 *
 * <p>É o <b>dono</b> da relação N:N com {@code Cargo} (tabela {@code usuario_cargo}).
 * A senha é armazenada <b>sempre hasheada</b> (BCrypt); nunca em texto puro — ver
 * {@code PasswordEncoderConfig}.
 */
@Entity
@Table(name = "usuario")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false, unique = true)
	private String email;

	/** Hash BCrypt da senha — nunca o texto puro. */
	@Column(name = "senha_hash", nullable = false)
	private String senhaHash;

	@Column(nullable = false)
	private boolean ativo = true;

	@ManyToMany
	@JoinTable(
			name = "usuario_cargo",
			joinColumns = @JoinColumn(name = "usuario_id"),
			inverseJoinColumns = @JoinColumn(name = "cargo_id"))
	private Set<Cargo> cargos = new HashSet<>();

	/** Exigido pelo JPA. */
	protected Usuario() {
	}

	public Usuario(String nome, String email, String senhaHash) {
		this.nome = nome;
		this.email = email;
		this.senhaHash = senhaHash;
	}

	/** Vincula um cargo a este usuário, mantendo os dois lados da relação. */
	public void adicionarCargo(Cargo cargo) {
		cargos.add(cargo);
		cargo.getUsuarios().add(this);
	}

	public void removerCargo(Cargo cargo) {
		cargos.remove(cargo);
		cargo.getUsuarios().remove(this);
	}

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSenhaHash() {
		return senhaHash;
	}

	public void setSenhaHash(String senhaHash) {
		this.senhaHash = senhaHash;
	}

	public boolean isAtivo() {
		return ativo;
	}

	public void setAtivo(boolean ativo) {
		this.ativo = ativo;
	}

	public Set<Cargo> getCargos() {
		return cargos;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof Usuario other)) {
			return false;
		}
		return id != null && id.equals(other.id);
	}

	@Override
	public int hashCode() {
		return getClass().hashCode();
	}
}
