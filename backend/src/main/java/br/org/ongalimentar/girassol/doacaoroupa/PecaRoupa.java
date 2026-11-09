package br.org.ongalimentar.girassol.doacaoroupa;

import br.org.ongalimentar.girassol.familia.Genero;
import jakarta.persistence.*;

@Entity
@Table(name = "pecas_roupas")
public class PecaRoupa {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String descricao;

	private String tamanho;

	@Enumerated(EnumType.STRING)
	private Genero genero;

	@ManyToOne(optional = false)
	@JoinColumn(name = "doacao_roupa_id", nullable = false)
	private DoacaoRoupa doacaoRoupa;

	public PecaRoupa() {
	}

	public PecaRoupa(String descricao) {
		this.descricao = descricao;
	}

	public Long getId() {
		return id;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public String getTamanho() {
		return tamanho;
	}

	public void setTamanho(String tamanho) { this.tamanho = tamanho; }

	public Genero getGenero() {
		return genero;
	}

	public void setGenero(Genero genero) { this.genero = genero; }

	public DoacaoRoupa getDoacaoRoupa() {
		return doacaoRoupa;
	}

	public void setDoacaoRoupa(DoacaoRoupa doacaoRoupa) {
		this.doacaoRoupa = doacaoRoupa;
	}
}

