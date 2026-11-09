package br.org.ongalimentar.girassol.doacaoroupa;

import br.org.ongalimentar.girassol.familia.Familia;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doacoes_roupas")
public class DoacaoRoupa {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private LocalDate data;

	@Column(nullable = false)
	private int quantidade;

	@ManyToOne(optional = false)
	@JoinColumn(name = "familia_id", nullable = false)
	private Familia familia;

	@OneToMany(mappedBy = "doacaoRoupa", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<PecaRoupa> pecas = new ArrayList<>();

	public DoacaoRoupa() {
	}

	@PrePersist
	void definirData() {
		if (data == null) {
			data = LocalDate.now();
		}
	}

	public Long getId() {
		return id;
	}

	public LocalDate getData() {
		return data;
	}

	public void setData(LocalDate data) {
		this.data = data;
	}

	public int getQuantidade() { return quantidade; }

	public void setQuantidade(int quantidade) { this.quantidade = quantidade; }

	public Familia getFamilia() {
		return familia;
	}

	public void setFamilia(Familia familia) {
		this.familia = familia;
	}

	public List<PecaRoupa> getPecas() {
		return pecas;
	}

	public void addPecaRoupa(PecaRoupa peca) {
		pecas.add(peca);
		peca.setDoacaoRoupa(this);
	}

	public void removePecaRoupa(PecaRoupa peca) {
		if (pecas.remove(peca)) {
			peca.setDoacaoRoupa(null);
		}
	}
}
