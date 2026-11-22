package br.org.ongalimentar.girassol.voluntarioexterno;

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

@Entity
@Table(name = "voluntarios_externos")
public class VoluntarioExterno {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = true)
	@JoinColumn(name = "usuario_id", nullable = true)
	private Usuario cadastradoPor;

	@Column(unique = true, nullable = false)
	private String cpf;

	@Column(nullable = false)
	private String nome;

	private String contato;

	@Column(length = 2000)
	private String atividades;

	private String frequencia;

	private Boolean ativo;

	protected VoluntarioExterno() {
	}

	public VoluntarioExterno(String cpf, String nome) {
		this.cpf = cpf;
		this.nome = nome;
	}

	public Long getId() { return id; }

	public Usuario getCadastradoPor() { return cadastradoPor; }

	public void setCadastradoPor(Usuario cadastradoPor) { this.cadastradoPor = cadastradoPor; }

	public String getCpf() { return cpf; }

	public String getNome() { return nome; }

	public String getContato() { return contato; }

	public void setContato(String contato) { this.contato = contato; }

	public String getAtividades() { return atividades; }

	public void setAtividades(String atividades) { this.atividades = atividades; }

	public String getFrequencia() { return frequencia; }

	public void setFrequencia(String frequencia) { this.frequencia = frequencia; }

	public Boolean getAtivo() { return ativo; }

	public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
