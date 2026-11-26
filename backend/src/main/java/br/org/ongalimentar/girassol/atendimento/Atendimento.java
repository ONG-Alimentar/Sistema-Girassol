package br.org.ongalimentar.girassol.atendimento;

import br.org.ongalimentar.girassol.familia.Dependente;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.rbac.Usuario;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GenerationType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.LocalDateTime;

@Entity
@Table(name = "atendimentos")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Atendimento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "familia_id", nullable = false)
	private Familia responsavelFamilia;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_responsavel_id", nullable = false)
	private Usuario profissional;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dependente_atendido_id")
	private Dependente numeroDependente;

	@Column(nullable = false)
	private LocalDateTime dataHora;
	private LocalDateTime dataHoraRetorno;
	@Enumerated(EnumType.STRING)
	private Modalidade modalidade;

	@Column(columnDefinition = "text")
	private String descricaoDoCaso;

	public Long getId() { return id; }
	public Familia getResponsavelFamilia() { return responsavelFamilia; }
	public void setResponsavelFamilia(Familia responsavelFamilia) { this.responsavelFamilia = responsavelFamilia; }
	public Usuario getProfissional() { return profissional; }
	public void setProfissional(Usuario profissional) { this.profissional = profissional; }
	public Dependente getNumeroDependente() { return numeroDependente; }
	public void setNumeroDependente(Dependente numeroDependente) { this.numeroDependente = numeroDependente; }
	public LocalDateTime getDataHora() { return dataHora; }
	public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
	public LocalDateTime getDataHoraRetorno() { return dataHoraRetorno; }
	public void setDataHoraRetorno(LocalDateTime dataHoraRetorno) { this.dataHoraRetorno = dataHoraRetorno; }
	public Modalidade getModalidade() { return modalidade; }
	public void setModalidade(Modalidade modalidade) { this.modalidade = modalidade; }
	public String getDescricaoDoCaso() { return descricaoDoCaso; }
	public void setDescricaoDoCaso(String descricaoDoCaso) { this.descricaoDoCaso = descricaoDoCaso; }
}
