package br.org.ongalimentar.girassol.doacaocesta;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_doados")
public class ItemCesta {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String descricao;

	@Column(nullable = false, precision = 10, scale = 3)
	private BigDecimal quantidade;

	@ManyToOne(optional = false)
	@JoinColumn(name = "doacao_cesta_id", nullable = false)
	private DoacaoCesta doacaoCesta;

	public ItemCesta() {
	}

	public ItemCesta(String descricao, BigDecimal quantidade) {
		this.descricao = descricao;
		setQuantidade(quantidade);
	}

	public ItemCesta(String descricao, int quantidade) {
		this(descricao, BigDecimal.valueOf(quantidade));
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

	public BigDecimal getQuantidade() {
		return quantidade;
	}

	public void setQuantidade(BigDecimal quantidade) {
		if (quantidade == null || quantidade.compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalArgumentException("A quantidade do item doado deve ser maior que zero.");
		}

		this.quantidade = quantidade;
	}

	public DoacaoCesta getDoacaoCesta() {
		return doacaoCesta;
	}

	public void setDoacaoCesta(DoacaoCesta doacaoCesta) {
		this.doacaoCesta = doacaoCesta;
	}
}
