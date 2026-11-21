package br.org.ongalimentar.girassol.visita;

import br.org.ongalimentar.girassol.rbac.Usuario;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "visitas")
public class Visita {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario criadoPor;

	@Enumerated(EnumType.STRING)
	private Turno turno;

	@Enumerated(EnumType.STRING)
	private Situacao situacao;

	@Column(nullable = false)
	private LocalDate data;

	private String nome;

	private Integer idade;

	private String contato;

	@Column(length = 1000)
	private String motivoDaProcura;

	private Boolean pedidoAtendido;

	@Column(length = 2000)
	private String observacoes;

	protected Visita() {
	}

	public Visita(Usuario criadoPor, LocalDate data) {
		this.criadoPor = criadoPor;
		this.data = data;
	}

	public Long getId() { return id; }

	public Usuario getCriadoPor() { return criadoPor; }

	public void setCriadoPor(Usuario criadoPor) { this.criadoPor = criadoPor; }

	public Turno getTurno() { return turno; }

	public void setTurno(Turno turno) { this.turno = turno; }

	public Situacao getSituacao() { return situacao; }

	public void setSituacao(Situacao situacao) { this.situacao = situacao; }

	public LocalDate getData() { return data; }

	public void setData(LocalDate data) { this.data = data; }

	public String getNome() { return nome; }

	public void setNome(String nome) { this.nome = nome; }

	public Integer getIdade() { return idade; }

	public void setIdade(Integer idade) { this.idade = idade; }

	public String getContato() { return contato; }

	public void setContato(String contato) { this.contato = contato; }

	public String getMotivoDaProcura() { return motivoDaProcura; }

	public void setMotivoDaProcura(String motivoDaProcura) { this.motivoDaProcura = motivoDaProcura; }

	public Boolean getPedidoAtendido() { return pedidoAtendido; }

	public void setPedidoAtendido(Boolean pedidoAtendido) { this.pedidoAtendido = pedidoAtendido; }

	public String getObservacoes() { return observacoes; }

	public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
