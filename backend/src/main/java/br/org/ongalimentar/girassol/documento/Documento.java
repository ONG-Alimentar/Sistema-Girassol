package br.org.ongalimentar.girassol.documento;

import br.org.ongalimentar.girassol.rbac.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
public class Documento {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = true)
	@JoinColumn(name = "usuario_id", nullable = true)
	private Usuario cadastradoPor;

	@Column(nullable = false)
	private String tipoDocumento; //RG, CERTIDÃO DE NASCIMENTO, ETC.

	@Column(nullable = false)
	private String nomeDocumento; //NOME DO ARQUIVO EX: RG_Joao_Vitor.pdf

	@Column(nullable = false)
	private String caminhoStorage; //Link do arquivo

	@Column(nullable = false)
	private String contentType; //Tipo do arquivo, JPG, PDF, etc.

	private Long tamanhoBytes; //Tamanho do arquivo em BYTES

	@Column(length = 2000)
	private String descricao;

	@Column(nullable = false)
	private LocalDateTime dataUpload = LocalDateTime.now();

	protected Documento () {
	}

	public Documento(String tipoDocumento, String nomeDocumento, String caminhoStorage, String contentType) {
		this(tipoDocumento, nomeDocumento, caminhoStorage, contentType, null);
	}

	public Documento(String tipoDocumento, String nomeDocumento, String caminhoStorage, String contentType, Long tamanhoBytes) {
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

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public String getDescricao() {
		return descricao;
	}

	public Usuario getCadastradoPor() {
		return cadastradoPor;
	}

	public void setCadastradoPor(Usuario cadastradoPor) {
		this.cadastradoPor = cadastradoPor;
	}
}
