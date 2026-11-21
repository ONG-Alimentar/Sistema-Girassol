package br.org.ongalimentar.girassol.atendimento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "atendimentos_psicologicos")
public class AtendimentoPsicologico extends Atendimento {

	@Column(columnDefinition = "text")
	private String condicoesInvestigadas;
	@Column(columnDefinition = "text")
	private String diagnosticosPrevios;
	@Column(columnDefinition = "text")
	private String historicoSubstancias;
	@Column(columnDefinition = "text")
	private String internacao;

	public String getCondicoesInvestigadas() { return condicoesInvestigadas; }
	public void setCondicoesInvestigadas(String condicoesInvestigadas) { this.condicoesInvestigadas = condicoesInvestigadas; }
	public String getDiagnosticosPrevios() { return diagnosticosPrevios; }
	public void setDiagnosticosPrevios(String diagnosticosPrevios) { this.diagnosticosPrevios = diagnosticosPrevios; }
	public String getHistoricoSubstancias() { return historicoSubstancias; }
	public void setHistoricoSubstancias(String historicoSubstancias) { this.historicoSubstancias = historicoSubstancias; }
	public String getInternacao() { return internacao; }
	public void setInternacao(String internacao) { this.internacao = internacao; }
}
