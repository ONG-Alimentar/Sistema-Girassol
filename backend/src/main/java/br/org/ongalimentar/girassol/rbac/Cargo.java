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

@Entity
@Table(name = "cargo")
public class Cargo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String nome;

	@ManyToMany
	@JoinTable(
			name = "cargo_permissao",
			joinColumns = @JoinColumn(name = "cargo_id"),
			inverseJoinColumns = @JoinColumn(name = "permissao_id"))
	private Set<Permissao> permissoes = new HashSet<>();

	@ManyToMany(mappedBy = "cargos")
	private Set<Usuario> usuarios = new HashSet<>();

	protected Cargo() {
	}

	public Cargo(String nome) {
		this.nome = nome;
	}

	public void adicionarPermissao(Permissao permissao) {
		permissoes.add(permissao);
		permissao.getCargos().add(this);
	}

	public void removerPermissao(Permissao permissao) {
		permissoes.remove(permissao);
		permissao.getCargos().remove(this);
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

	public Set<Permissao> getPermissoes() {
		return permissoes;
	}

	public Set<Usuario> getUsuarios() {
		return usuarios;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof Cargo other)) {
			return false;
		}
		return id != null && id.equals(other.id);
	}

	@Override
	public int hashCode() {
		return getClass().hashCode();
	}
}
