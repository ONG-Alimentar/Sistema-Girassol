package br.org.ongalimentar.girassol.familia;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.org.ongalimentar.girassol.common.crud.CrudController;
import br.org.ongalimentar.girassol.common.crud.CrudService;
import br.org.ongalimentar.girassol.common.crud.PaginatedList;
import br.org.ongalimentar.girassol.familia.dto.FamiliaRequest;
import br.org.ongalimentar.girassol.familia.dto.FamiliaResponse;
import br.org.ongalimentar.girassol.familia.dto.MedicamentoRequest;
import br.org.ongalimentar.girassol.familia.dto.ProblemaSaudeRequest;
import br.org.ongalimentar.girassol.familia.dto.SituacaoSocioeconomicaRequest;
import br.org.ongalimentar.girassol.familia.dto.SubstanciaRequest;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import br.org.ongalimentar.girassol.familia.dto.TelefoneRequest;
import br.org.ongalimentar.girassol.familia.dto.EnderecoRequest;
import br.org.ongalimentar.girassol.familia.dto.DependenteRequest;
import br.org.ongalimentar.girassol.familia.ServicoRepository;

@RestController
@RequestMapping("/api/familias")
public class FamiliaController extends CrudController<Familia, Long, FamiliaRequest, FamiliaResponse> {

	private final FamiliaService service;
	private final ServicoRepository servicoRepository;

	public FamiliaController(FamiliaService service, ServicoRepository servicoRepository) {
		this.service = service;
		this.servicoRepository = servicoRepository;
	}

	@Override
	protected CrudService<Familia, Long> service() {
		return service;
	}

	@Override
	@GetMapping
	public PaginatedList<FamiliaResponse> listar(@RequestParam(required = false) Map<String, String> params, Pageable pageable) {
		Page<Familia> page = service().list(filtro(params == null ? Map.of() : params), pageable);
		return PaginatedList.from(page, FamiliaResponse::paraListagem);
	}

	@Override
	protected Familia toEntity(FamiliaRequest req) {
		Familia familia = new Familia();
		apply(req, familia);
		return familia;
	}

	private void sincronizarTelefones(Familia familia,java.util.List<TelefoneRequest> telefonesRequest) {
		if (telefonesRequest == null) {
			return;
		}

		Set<Long> idsRecebidos = new HashSet<>();

		for (TelefoneRequest req : telefonesRequest) {
			if (req.id() != null) {
				if (!idsRecebidos.add(req.id())) {
					throw new IllegalArgumentException(
						"Telefone informado mais de uma vez: " + req.id()
					);
				}

				boolean pertenceFamilia = familia.getTelefones()
					.stream()
					.anyMatch(t -> req.id().equals(t.getId()));

				if (!pertenceFamilia) {
					throw new IllegalArgumentException(
						"Telefone não pertence à família: " + req.id()
					);
				}
			}
		}

		for (Telefone telefone :
				new ArrayList<>(familia.getTelefones())) {

			if (telefone.getId() != null
					&& !idsRecebidos.contains(telefone.getId())) {
				familia.removeTelefone(telefone);
			}
		}

		for (TelefoneRequest req : telefonesRequest) {
			if (req.id() == null) {
				familia.addTelefone(new Telefone(req.numero()));
			} else {
				Telefone existente = familia.getTelefones()
					.stream()
					.filter(t -> req.id().equals(t.getId()))
					.findFirst()
					.orElseThrow();

				existente.setNumero(req.numero());
			}
		}
	}

	private void sincronizarEnderecos(
        Familia familia,
        List<EnderecoRequest> enderecosRequest
	) {
		if (enderecosRequest == null) {
			return;
		}

		Set<Long> idsRecebidos = new HashSet<>();

		for (EnderecoRequest req : enderecosRequest) {
			if (req.id() != null) {
				if (!idsRecebidos.add(req.id())) {
					throw new IllegalArgumentException(
						"Endereço informado mais de uma vez: " + req.id()
					);
				}

				boolean pertenceFamilia = familia.getEnderecos()
					.stream()
					.anyMatch(e -> req.id().equals(e.getId()));

				if (!pertenceFamilia) {
					throw new IllegalArgumentException(
						"Endereço não pertence à família: " + req.id()
					);
				}
			}
		}

		for (Endereco endereco : new ArrayList<>(familia.getEnderecos())) {
			if (endereco.getId() != null
					&& !idsRecebidos.contains(endereco.getId())) {
				familia.removeEndereco(endereco);
			}
		}

		for (EnderecoRequest req : enderecosRequest) {
			if (req.id() == null) {
				Endereco novo = new Endereco(
					req.rua(),
					req.bairro(),
					req.numero(),
					req.complemento(),
					req.cidade(),
					req.cep()
				);

				familia.addEndereco(novo);
			} else {
				Endereco existente = familia.getEnderecos()
					.stream()
					.filter(e -> req.id().equals(e.getId()))
					.findFirst()
					.orElseThrow();

				existente.setRua(req.rua());
				existente.setBairro(req.bairro());
				existente.setNumero(req.numero());
				existente.setComplemento(req.complemento());
				existente.setCidade(req.cidade());
				existente.setCep(req.cep());
			}
		}
	}

	private void sincronizarDependentes(
			Familia familia,
			List<DependenteRequest> dependentesRequest
	) {
		if (dependentesRequest == null) {
			return;
		}

		Set<Long> idsRecebidos = new HashSet<>();

		for (DependenteRequest req : dependentesRequest) {
			if (req.id() != null) {
				if (!idsRecebidos.add(req.id())) {
					throw new IllegalArgumentException(
						"Dependente informado mais de uma vez: " + req.id()
					);
				}

				boolean pertenceFamilia = familia.getDependentes()
					.stream()
					.anyMatch(d -> req.id().equals(d.getId()));

				if (!pertenceFamilia) {
					throw new IllegalArgumentException(
						"Dependente não pertence à família: " + req.id()
					);
				}
			}
		}

		for (Dependente dependente :
				new ArrayList<>(familia.getDependentes())) {

			if (dependente.getId() != null
					&& !idsRecebidos.contains(dependente.getId())) {
				familia.removeDependente(dependente);
			}
		}

		for (DependenteRequest req : dependentesRequest) {
			if (req.id() == null) {
				Dependente novo = new Dependente(
					req.nome(),
					req.dataNascimento(),
					req.parentesco(),
					req.ocupacao()
				);

				familia.addDependente(novo);
			} else {
				Dependente existente = familia.getDependentes()
					.stream()
					.filter(d -> req.id().equals(d.getId()))
					.findFirst()
					.orElseThrow();

				existente.setNome(req.nome());
				existente.setDataNascimento(req.dataNascimento());
				existente.setParentesco(req.parentesco());
				existente.setOcupacao(req.ocupacao());
			}
		}
	}

	private void sincronizarProblemasSaude(
			Familia familia,
			List<ProblemaSaudeRequest> requests
	) {
		if (requests == null) {
			return;
		}

		Set<Long> idsRecebidos = new HashSet<>();

		for (ProblemaSaudeRequest req : requests) {
			if (req.id() != null) {
				if (!idsRecebidos.add(req.id())) {
					throw new IllegalArgumentException(
						"Problema de saúde informado mais de uma vez: " + req.id()
					);
				}

				boolean pertenceFamilia = familia.getProblemasSaude()
					.stream()
					.anyMatch(p -> req.id().equals(p.getId()));

				if (!pertenceFamilia) {
					throw new IllegalArgumentException(
						"Problema de saúde não pertence à família: " + req.id()
					);
				}
			}
		}

		for (ProblemaSaude problema :
				new ArrayList<>(familia.getProblemasSaude())) {

			if (problema.getId() != null
					&& !idsRecebidos.contains(problema.getId())) {
				familia.removeProblemaSaude(problema);
			}
		}

		for (ProblemaSaudeRequest req : requests) {
			if (req.id() == null) {
				familia.addProblemaSaude(
					new ProblemaSaude(req.descricao(), req.gravidade())
				);
			} else {
				ProblemaSaude existente = familia.getProblemasSaude()
					.stream()
					.filter(p -> req.id().equals(p.getId()))
					.findFirst()
					.orElseThrow();

				existente.setDescricao(req.descricao());
				existente.setGravidade(req.gravidade());
			}
		}
	}

	private void sincronizarMedicamentos(
			Familia familia,
			List<MedicamentoRequest> requests
	) {
		if (requests == null) {
			return;
		}

		Set<Long> idsRecebidos = new HashSet<>();

		for (MedicamentoRequest req : requests) {
			if (req.id() != null) {
				if (!idsRecebidos.add(req.id())) {
					throw new IllegalArgumentException(
						"Medicamento informado mais de uma vez: " + req.id()
					);
				}

				boolean pertenceFamilia = familia.getMedicamentos()
					.stream()
					.anyMatch(m -> req.id().equals(m.getId()));

				if (!pertenceFamilia) {
					throw new IllegalArgumentException(
						"Medicamento não pertence à família: " + req.id()
					);
				}
			}
		}

		for (Medicamento medicamento :
				new ArrayList<>(familia.getMedicamentos())) {

			if (medicamento.getId() != null
					&& !idsRecebidos.contains(medicamento.getId())) {
				familia.removeMedicamento(medicamento);
			}
		}

		for (MedicamentoRequest req : requests) {
			if (req.id() == null) {
				familia.addMedicamento(
					new Medicamento(req.descricao(), req.dosagem())
				);
			} else {
				Medicamento existente = familia.getMedicamentos()
					.stream()
					.filter(m -> req.id().equals(m.getId()))
					.findFirst()
					.orElseThrow();

				existente.setDescricao(req.descricao());
				existente.setDosagem(req.dosagem());
			}
		}
	}

	private void sincronizarSubstancias(
			Familia familia,
			List<SubstanciaRequest> requests
	) {
		if (requests == null) {
			return;
		}

		Set<Long> idsRecebidos = new HashSet<>();

		for (SubstanciaRequest req : requests) {
			if (req.id() != null) {
				if (!idsRecebidos.add(req.id())) {
					throw new IllegalArgumentException(
						"Substância informada mais de uma vez: " + req.id()
					);
				}

				boolean pertenceFamilia = familia.getSubstancias()
					.stream()
					.anyMatch(s -> req.id().equals(s.getId()));

				if (!pertenceFamilia) {
					throw new IllegalArgumentException(
						"Substância não pertence à família: " + req.id()
					);
				}
			}
		}

		for (Substancia substancia :
				new ArrayList<>(familia.getSubstancias())) {

			if (substancia.getId() != null
					&& !idsRecebidos.contains(substancia.getId())) {
				familia.removeSubstancia(substancia);
			}
		}

		for (SubstanciaRequest req : requests) {
			if (req.id() == null) {
				familia.addSubstancia(new Substancia(req.descricao()));
			} else {
				Substancia existente = familia.getSubstancias()
					.stream()
					.filter(s -> req.id().equals(s.getId()))
					.findFirst()
					.orElseThrow();

				existente.setDescricao(req.descricao());
			}
		}
	}

	private void sincronizarSituacaoSocioeconomica(
			Familia familia,
			SituacaoSocioeconomicaRequest req
	) {
		if (req == null) {
			return;
		}

		SituacaoSocioeconomica situacao =
				familia.getSituacaoSocioeconomica();

		if (situacao == null) {
			situacao = new SituacaoSocioeconomica();
			familia.setSituacaoSocioeconomica(situacao);
		}

		situacao.setProfissao(req.profissao());
		situacao.setEscolaridade(req.escolaridade());
		situacao.setTipoMoradia(req.tipoMoradia());
		situacao.setRenda(req.renda());
		situacao.setBeneficio(req.beneficio());
		situacao.setAcessoAlimentacao(req.acessoAlimentacao());
	}

	private void sincronizarServicos(
			Familia familia,
			Set<Long> servicosIds
	) {
		if (servicosIds == null) {
			return;
		}

		List<Servico> selecionados =
				servicoRepository.findAllById(servicosIds);

		if (selecionados.size() != servicosIds.size()) {
			throw new IllegalArgumentException(
				"Um ou mais serviços informados não existem."
			);
		}

		Set<Long> idsSelecionados = selecionados.stream()
				.map(Servico::getId)
				.collect(Collectors.toSet());

		for (Servico servico :
				new HashSet<>(familia.getServicos())) {

			if (!idsSelecionados.contains(servico.getId())) {
				familia.removeServico(servico);
			}
		}

		Set<Long> idsAtuais = familia.getServicos()
				.stream()
				.map(Servico::getId)
				.collect(Collectors.toSet());

		for (Servico servico : selecionados) {
			if (!idsAtuais.contains(servico.getId())) {
				familia.addServico(servico);
			}
		}
	}

	@Override
	protected void apply(FamiliaRequest req, Familia f) {
		f.setNome(req.nome());
		f.setNomeSocial(req.nomeSocial());
		f.setDataNascimento(req.dataNascimento());
		f.setGenero(req.genero());
		f.setEstadoCivil(req.estadoCivil());
		f.setIndicacao(req.indicacao());
		f.setNomeMae(req.nomeMae());
		f.setEmail(req.email());
		f.setCpf(req.cpf());
		f.setRg(req.rg());
		f.setNis(req.nis());
		f.setNaturalidade(req.naturalidade());
		f.setObservacoes(req.observacoes());
		sincronizarTelefones(f, req.telefones());
		sincronizarEnderecos(f, req.enderecos());
		sincronizarDependentes(f, req.dependentes());
		sincronizarProblemasSaude(f, req.problemasSaude());
		sincronizarMedicamentos(f, req.medicamentos());
		sincronizarSubstancias(f, req.substancias());
		sincronizarSituacaoSocioeconomica(
				f,
				req.situacaoSocioeconomica()
		);
		sincronizarServicos(f, req.servicosIds());
	}

	@Override
	protected FamiliaResponse toResponse(Familia f) {
		return FamiliaResponse.from(f);
	}

	@Override
	protected Specification<Familia> filtro(Map<String, String> params) {
		String q = params.get("q");
		if (q == null || q.isBlank()) {
			return null;
		}
		String like = "%" + q.trim().toLowerCase() + "%";
		return (root, query, cb) -> cb.or(
				cb.like(cb.lower(root.get("nome")), like),
				cb.like(cb.lower(root.get("cpf")), like));
	}


}