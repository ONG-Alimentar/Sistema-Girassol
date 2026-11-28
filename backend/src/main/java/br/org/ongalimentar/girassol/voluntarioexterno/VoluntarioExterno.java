package br.org.ongalimentar.girassol.voluntarioexterno;

import br.org.ongalimentar.girassol.rbac.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "voluntarios_externos")
public class VoluntarioExterno {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = true)
	@JoinColumn(name = "usuario_id", nullable = true)
	private Usuario cadastradoPor;

	@Column(unique = true)
	private String cpf;

	@Column(nullable = false)
	private String nomeCompleto;

	private String contato;

	@Column(length = 2000)
	private String atividadesDesenvolvidas;

	private String frequencia;

	private Boolean ativo;

	private String areaAtuacao;

	protected VoluntarioExterno() {
	}

	public VoluntarioExterno(String cpf, String nome) {
		this.cpf = cpf;
		this.nomeCompleto = nome;
	}

	public Long getId() { return id; }

	public Usuario getCadastradoPor() { return cadastradoPor; }

	public void setCadastradoPor(Usuario cadastradoPor) { this.cadastradoPor = cadastradoPor; }

	public String getCpf() { return cpf; }

	public void setCpf(String cpf) { this.cpf = cpf; }

	public String getNomeCompleto() { return nomeCompleto; }

	public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }

	public String getNome() { return nomeCompleto; }

	public void setNome(String nome) { this.nomeCompleto = nome; }

	public String getContato() { return contato; }

	public void setContato(String contato) { this.contato = contato; }

	public String getAtividadesDesenvolvidas() { return atividadesDesenvolvidas; }

	public void setAtividadesDesenvolvidas(String atividadesDesenvolvidas) {
		this.atividadesDesenvolvidas = atividadesDesenvolvidas;
	}

	public String getAtividades() { return atividadesDesenvolvidas; }

	public void setAtividades(String atividades) { this.atividadesDesenvolvidas = atividades; }

	public String getFrequencia() { return frequencia; }

	public void setFrequencia(String frequencia) { this.frequencia = frequencia; }

	public Boolean getAtivo() { return ativo; }

	public void setAtivo(Boolean ativo) { this.ativo = ativo; }

	public boolean isAtivo() { return Boolean.TRUE.equals(ativo); }

	public String getAreaAtuacao() { return areaAtuacao; }

	public void setAreaAtuacao(String areaAtuacao) { this.areaAtuacao = areaAtuacao; }
}
