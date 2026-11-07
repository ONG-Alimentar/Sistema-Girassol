package br.org.ongalimentar.girassol.rbac;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

/**
 * Permissão granular no formato {@code MODULO:ACAO} (ex.: {@code FAMILIA:CREATE}).
 *
 * <p>Lado <b>inverso</b> da relação N:N com {@link Cargo}: o dono do vínculo é o
 * {@code Cargo} (tabela de junção {@code cargo_permissao}). O catálogo e o
 * mapeamento cargo→permissão ficam no banco, populados por seed na #46 — ver
 * {@code docs/seguranca/rbac.md}.
 */
@Entity
@Table(name = "permissao")
public class Permissao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** Código no formato {@code MODULO:ACAO}, único no catálogo. */
	@Column(nullable = false, unique = true)
	private String codigo;

	@ManyToMany(mappedBy = "permissoes")
	private Set<Cargo> cargos = new HashSet<>();

	/** Exigido pelo JPA. */
	protected Permissao() {
	}

	public Permissao(String codigo) {
		this.codigo = codigo;
	}

	public Long getId() {
		return id;
	}

	public String getCodigo() {
		return codigo;
	}

	public void setCodigo(String codigo) {
		this.codigo = codigo;
	}

	public Set<Cargo> getCargos() {
		return cargos;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof Permissao other)) {
			return false;
		}
		return id != null && id.equals(other.id);
	}

	@Override
	public int hashCode() {
		return getClass().hashCode();
	}
}
