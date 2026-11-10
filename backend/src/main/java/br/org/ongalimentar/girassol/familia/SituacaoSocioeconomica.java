package br.org.ongalimentar.girassol.familia;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "situacoes_socioeconomicas")
public class SituacaoSocioeconomica {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String profissao;
	private String escolaridade;
	@Enumerated(EnumType.STRING)
	private TipoMoradia tipoMoradia;
	@Enumerated(EnumType.STRING)
	private Renda renda;
	private String beneficio; // Não entendi oq String [0..1] quis dizer
	private Boolean acessoAlimentacao;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "familia_id", nullable = false, unique = true)
	private Familia familia;

	public SituacaoSocioeconomica() {
	}

	public Long getId() {
		return id;
	}

	public String getProfissao() {
		return profissao;
	}

	public void setProfissao(String profissao) {
		this.profissao = profissao;
	}

	public String getEscolaridade() {
		return escolaridade;
	}

	public void setEscolaridade(String escolaridade) {
		this.escolaridade = escolaridade;
	}

	public TipoMoradia getTipoMoradia() { return tipoMoradia; }

	public void setTipoMoradia(TipoMoradia tipoMoradia) { this.tipoMoradia = tipoMoradia; }

	public Renda getRenda() {
		return renda;
	}

	public void setRenda(Renda renda) { this.renda = renda; }

	public String getBeneficio() {
		return beneficio;
	}

	public void setBeneficio(String beneficio) {
		this.beneficio = beneficio;
	}

	public Boolean getAcessoAlimentacao() {
		return acessoAlimentacao;
	}

	public void setAcessoAlimentacao(Boolean acessoAlimentacao) {
		this.acessoAlimentacao = acessoAlimentacao;
	}

	public Familia getFamilia() {
		return familia;
	}

	public void setFamilia(Familia familia) {
		this.familia = familia;
		if (familia != null && familia.getSituacaoSocioeconomica() != this) {
			familia.setSituacaoSocioeconomica(this);
		}
	}
}
