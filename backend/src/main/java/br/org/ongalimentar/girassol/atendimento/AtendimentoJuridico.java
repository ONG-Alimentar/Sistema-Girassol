package br.org.ongalimentar.girassol.atendimento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "atendimentos_juridicos")
public class AtendimentoJuridico extends Atendimento {

	@Column(columnDefinition = "text")
	private String bens;
	@Column(columnDefinition = "text")
	private String partesEnvolvidas;
	@Column(columnDefinition = "text")
	private String orientacaoJuridica;
	@Column(columnDefinition = "text")
	private String encaminhamento;

	@OneToMany(mappedBy = "atendimentoJuridico", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<DocumentoApresentado> documentos = new ArrayList<>();

	public String getBens() { return bens; }
	public void setBens(String bens) { this.bens = bens; }
	public String getPartesEnvolvidas() { return partesEnvolvidas; }
	public void setPartesEnvolvidas(String partesEnvolvidas) { this.partesEnvolvidas = partesEnvolvidas; }
	public String getOrientacaoJuridica() { return orientacaoJuridica; }
	public void setOrientacaoJuridica(String orientacaoJuridica) { this.orientacaoJuridica = orientacaoJuridica; }
	public String getEncaminhamento() { return encaminhamento; }
	public void setEncaminhamento(String encaminhamento) { this.encaminhamento = encaminhamento; }

	public List<DocumentoApresentado> getDocumentos() {
		return Collections.unmodifiableList(documentos);
	}

	public void addDocumento(DocumentoApresentado documento) {
		this.documentos.add(documento);
		documento.setAtendimentoJuridico(this);
	}

	public void removeDocumento(DocumentoApresentado documento) {
		if (documentos.remove(documento)) {
			documento.setAtendimentoJuridico(null);
		}
	}
}
