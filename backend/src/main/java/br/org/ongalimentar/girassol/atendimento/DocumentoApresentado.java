package br.org.ongalimentar.girassol.atendimento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import java.time.LocalDateTime;

@Entity
@Table(name = "atendimentos_juridicos_documentos")
public class DocumentoApresentado {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String tipoDocumento; //RG, CERTIDÃO DE NASCIMENTO, ETC.

	@Column(nullable = false)
	private String nomeDocumento; //NOME DO ARQUIVO EX: RG_Joao_Vitor.pdf

	@Column(nullable = false)
	private String caminhoStorage; //Link do arquivo

	@Column(nullable = false)
	private String contentType; //Tipo do arquivo, JPG, PDF, etc.

	private Long tamanhoBytes; //Tamanho do arquivo em BYTES

	@Column(nullable = false)
	private LocalDateTime dataUpload = LocalDateTime.now();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "atendimento_id", nullable = false)
	private AtendimentoJuridico atendimentoJuridico;

	protected DocumentoApresentado () {
	}

	public DocumentoApresentado(String tipoDocumento, String nomeDocumento, String caminhoStorage, String contentType) {
		this(tipoDocumento, nomeDocumento, caminhoStorage, contentType, null);
	}

	public DocumentoApresentado(String tipoDocumento, String nomeDocumento, String caminhoStorage, String contentType, Long tamanhoBytes) {
		this.tipoDocumento = tipoDocumento;
		this.nomeDocumento = nomeDocumento;
		this.caminhoStorage = caminhoStorage;
		this.contentType = contentType;
		this.tamanhoBytes = tamanhoBytes;
		this.dataUpload = LocalDateTime.now();
	}

	public Long getId() { return id; }

	public String getTipoDocumento() { return tipoDocumento; }

	public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

	public String getNomeDocumento() { return nomeDocumento; }

	public void setNomeDocumento(String nomeDocumento) { this.nomeDocumento = nomeDocumento; }

	public String getCaminhoStorage() {
		return caminhoStorage;
	}

	public void setCaminhoStorage(String caminhoStorage) {
		this.caminhoStorage = caminhoStorage;
	}

	public String getContentType() { return contentType; }

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public Long getTamanhoBytes() {
		return tamanhoBytes;
	}

	public void setTamanhoBytes(Long tamanhoBytes) {
		this.tamanhoBytes = tamanhoBytes;
	}

	public LocalDateTime getDataUpload() {
		return dataUpload;
	}

	public void setDataUpload(LocalDateTime dataUpload) {
		this.dataUpload = dataUpload;
	}

	public AtendimentoJuridico getAtendimentoJuridico() {
		return atendimentoJuridico;
	}

	public void setAtendimentoJuridico(AtendimentoJuridico atendimentoJuridico) { this.atendimentoJuridico = atendimentoJuridico; }
}
