package br.org.ongalimentar.girassol.familia;

import br.org.ongalimentar.girassol.doacaocesta.DoacaoCesta;
import br.org.ongalimentar.girassol.doacaoroupa.DoacaoRoupa;
import br.org.ongalimentar.girassol.doacaoroupa.PecaRoupa;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "familias")
public class Familia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nome;

	private String nomeSocial;
	private LocalDate dataNascimento;

	@Enumerated(EnumType.STRING)
	private Genero genero;

	@Enumerated(EnumType.STRING)
	private EstadoCivil estadoCivil;

	@Enumerated(EnumType.STRING)
	private Indicacao indicacao;

	private String nomeMae; //Adicionamos depois, não está nos diagramas.

	@Column(unique = true)
	private String cpf;
	private String rg;
	private String nis;
	private String email;
	private LocalDate dataCadastro; //Boa prática, mas não está nos diagramas. Qualquer coisa, removemos.
	private String naturalidade;

	@Column(length = 2000)
	private String observacoes;

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Telefone> telefones = new ArrayList<>();

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Endereco> enderecos = new ArrayList<>();

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Dependente> dependentes = new ArrayList<>();

	@OneToOne(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private SituacaoSocioeconomica situacaoSocioeconomica;

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProblemaSaude> problemasSaude = new ArrayList<>();

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Medicamento> medicamentos = new ArrayList<>();

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Substancia> substancias = new ArrayList<>();

	@ManyToMany
	@JoinTable(name = "familias_servicos",
			joinColumns = @JoinColumn(name = "familia_id"),
			inverseJoinColumns = @JoinColumn(name = "servico_id"))
	private Set<Servico> servicos = new HashSet<>();

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<DoacaoCesta> doacoesCestas = new ArrayList<>();

	@OneToMany(mappedBy = "familia", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<DoacaoRoupa> doacoesRoupas = new ArrayList<>();

	public Familia() {
	}

	@PrePersist
	void definirDataCadastro() {
		if (dataCadastro == null) {
			dataCadastro = LocalDate.now();
		}
	}

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getNomeSocial() {
		return nomeSocial;
	}

	public void setNomeSocial(String nomeSocial) {
		this.nomeSocial = nomeSocial;
	}

	public LocalDate getDataNascimento() {
		return dataNascimento;
	}

	public void setDataNascimento(LocalDate dataNascimento) {
		this.dataNascimento = dataNascimento;
	}

	public Genero getGenero() {
		return genero;
	}

	public void setGenero(Genero genero) { this.genero = genero; }

	public Indicacao getIndicacao() {
		return indicacao;
	}

	public void setIndicacao(Indicacao indicacao) { this.indicacao = indicacao; }

	public EstadoCivil getEstadoCivil() {
		return estadoCivil;
	}

	public void setEstadoCivil(EstadoCivil estadoCivil) {
		this.estadoCivil = estadoCivil;
	}

	public String getNomeMae() {
		return nomeMae;
	}

	public void setNomeMae(String nomeMae) {
		this.nomeMae = nomeMae;
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public String getRg() {
		return rg;
	}

	public void setRg(String rg) {
		this.rg = rg;
	}

	public String getNis() {
		return nis;
	}

	public void setNis(String nis) {
		this.nis = nis;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public LocalDate getDataCadastro() {
		return dataCadastro;
	}

	public String getNaturalidade() {
		return naturalidade;
	}

	public void setNaturalidade(String naturalidade) {
		this.naturalidade = naturalidade;
	}

	public String getObservacoes() {
		return observacoes;
	}

	public void setObservacoes(String observacoes) {
		this.observacoes = observacoes;
	}

	public List<Telefone> getTelefones() {
		return telefones;
	}

	public void addTelefone(Telefone telefone) {
		telefones.add(telefone);
		telefone.setFamilia(this);
	}

	public void removeTelefone(Telefone telefone) {
		if (telefones.remove(telefone)) {
			telefone.setFamilia(null);
		}
	}

	public List<Endereco> getEnderecos() {
		return enderecos;
	}

	public void addEndereco(Endereco endereco) {
		enderecos.add(endereco);
		endereco.setFamilia(this);
	}

	public void removeEndereco(Endereco endereco) {
		if (enderecos.remove(endereco)) {
			endereco.setFamilia(null);
		}
	}

	public List<Dependente> getDependentes() {
		return dependentes;
	}

	public void addDependente(Dependente dependente) {
		dependentes.add(dependente);
		dependente.setFamilia(this);
	}

	public void removeDependente(Dependente dependente) {
		if (dependentes.remove(dependente)) {
			dependente.setFamilia(null);
		}
	}

	public SituacaoSocioeconomica getSituacaoSocioeconomica() {
		return situacaoSocioeconomica;
	}

	public void setSituacaoSocioeconomica(SituacaoSocioeconomica situacaoSocioeconomica) {
		this.situacaoSocioeconomica = situacaoSocioeconomica;
		if (situacaoSocioeconomica != null && situacaoSocioeconomica.getFamilia() != this) {
			situacaoSocioeconomica.setFamilia(this);
		}
	}

	public List<ProblemaSaude> getProblemasSaude() {
		return problemasSaude;
	}

	public void addProblemaSaude(ProblemaSaude problemaSaude) {
		problemasSaude.add(problemaSaude);
		problemaSaude.setFamilia(this);
	}

	public void removeProblemaSaude(ProblemaSaude problemaSaude) {
		if (problemasSaude.remove(problemaSaude)) {
			problemaSaude.setFamilia(null);
		}
	}

	public List<Medicamento> getMedicamentos() {
		return medicamentos;
	}

	public void addMedicamento(Medicamento medicamento) {
		medicamentos.add(medicamento);
		medicamento.setFamilia(this);
	}

	public void removeMedicamento(Medicamento medicamento) {
		if (medicamentos.remove(medicamento)) {
			medicamento.setFamilia(null);
		}
	}

	public List<Substancia> getSubstancias() {
		return substancias;
	}

	public void addSubstancia(Substancia substancia) {
		substancias.add(substancia);
		substancia.setFamilia(this);
	}

	public void removeSubstancia(Substancia substancia) {
		if (substancias.remove(substancia)) {
			substancia.setFamilia(null);
		}
	}

	public Set<Servico> getServicos() {
		return servicos;
	}

	public void addServico(Servico servico) {
		servicos.add(servico);
		servico.getFamilias().add(this);
	}

	public void removeServico(Servico servico) {
		if (servicos.remove(servico)) {
			servico.getFamilias().remove(this);
		}
	}

	public List<DoacaoRoupa> getDoacoesRoupas() {
		return doacoesRoupas;
	}

	public void addDoacaoRoupa(DoacaoRoupa doacaoRoupa) {
		doacoesRoupas.add(doacaoRoupa);
		doacaoRoupa.setFamilia(this);
	}

	public void removeDoacaoRoupa(DoacaoRoupa doacaoRoupa) {
		if (doacoesRoupas.remove(doacaoRoupa)) {
			doacaoRoupa.setFamilia(null);
		}
	}

	public List<DoacaoCesta> getDoacoesCestas() {
		return doacoesCestas;
	}

	public void addDoacaoCesta(DoacaoCesta doacaoCesta) {
		doacoesCestas.add(doacaoCesta);
		doacaoCesta.setFamilia(this);
	}

	public void removeDoacaoCesta(DoacaoCesta doacaoCesta) {
		if (doacoesCestas.remove(doacaoCesta)) {
			doacaoCesta.setFamilia(null);
		}
	}
}
