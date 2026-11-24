package br.org.ongalimentar.girassol.auth;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import br.org.ongalimentar.girassol.rbac.Usuario;

@Entity
@Table(name = "senha_reset_token")
public class SenhaResetToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "codigo_hash", nullable = false)
	private String codigoHash;

	@Column(name = "expira_em", nullable = false)
	private Instant expiraEm;

	@Column(nullable = false)
	private boolean usado = false;

	@Column(name = "criado_em", nullable = false)
	private Instant criadoEm;

	protected SenhaResetToken() {
	}

	public SenhaResetToken(Usuario usuario, String codigoHash, Instant expiraEm) {
		this.usuario = usuario;
		this.codigoHash = codigoHash;
		this.expiraEm = expiraEm;
		this.criadoEm = Instant.now();
	}

	public boolean valido(Instant agora) {
		return !usado && agora.isBefore(expiraEm);
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public String getCodigoHash() {
		return codigoHash;
	}

	public Instant getExpiraEm() {
		return expiraEm;
	}

	public boolean isUsado() {
		return usado;
	}

	public void setUsado(boolean usado) {
		this.usado = usado;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
