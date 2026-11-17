package br.org.ongalimentar.girassol.familia.dto;

import java.time.LocalDate;
import java.util.List;

import br.org.ongalimentar.girassol.familia.Dependente;
import br.org.ongalimentar.girassol.familia.Endereco;
import br.org.ongalimentar.girassol.familia.EstadoCivil;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.Genero;
import br.org.ongalimentar.girassol.familia.Indicacao;
import br.org.ongalimentar.girassol.familia.Medicamento;
import br.org.ongalimentar.girassol.familia.ProblemaSaude;
import br.org.ongalimentar.girassol.familia.Renda;
import br.org.ongalimentar.girassol.familia.Servico;
import br.org.ongalimentar.girassol.familia.SituacaoSocioeconomica;
import br.org.ongalimentar.girassol.familia.Substancia;
import br.org.ongalimentar.girassol.familia.Telefone;
import br.org.ongalimentar.girassol.familia.TipoMoradia;

/**
 * DTO de saída da {@link Familia}: campos escalares do cadastro mais as coleções
 * (telefones, endereços, dependentes, situação socioeconômica, saúde, serviços)
 * — só leitura, para a tela de detalhe (#50); a edição delas é do módulo #4. As
 * coleções devem estar inicializadas pelo service antes da conversão
 * ({@code open-in-view=false}).
 */
public record FamiliaResponse(
		Long id,
		String nome,
		String nomeSocial,
		LocalDate dataNascimento,
		Genero genero,
		EstadoCivil estadoCivil,
		Indicacao indicacao,
		String nomeMae,
		String email,
		String cpf,
		String rg,
		String nis,
		String naturalidade,
		String observacoes,
		LocalDate dataCadastro,
		List<String> telefones,
		List<EnderecoResumo> enderecos,
		List<DependenteResumo> dependentes,
		SituacaoSocioeconomicaResumo situacaoSocioeconomica,
		List<ProblemaSaudeResumo> problemasSaude,
		List<MedicamentoResumo> medicamentos,
		List<String> substancias,
		List<String> servicos) {

	public record EnderecoResumo(String rua, String bairro, String numero, String complemento, String cidade, String cep) {
		static EnderecoResumo from(Endereco e) {
			return new EnderecoResumo(e.getRua(), e.getBairro(), e.getNumero(), e.getComplemento(), e.getCidade(), e.getCep());
		}
	}

	public record DependenteResumo(String nome, LocalDate dataNascimento, String parentesco, String ocupacao) {
		static DependenteResumo from(Dependente d) {
			return new DependenteResumo(d.getNome(), d.getDataNascimento(), d.getParentesco(), d.getOcupacao());
		}
	}

	public record SituacaoSocioeconomicaResumo(
			String profissao, String escolaridade, TipoMoradia tipoMoradia, Renda renda, String beneficio, Boolean acessoAlimentacao) {
		static SituacaoSocioeconomicaResumo from(SituacaoSocioeconomica s) {
			return new SituacaoSocioeconomicaResumo(
					s.getProfissao(), s.getEscolaridade(), s.getTipoMoradia(), s.getRenda(), s.getBeneficio(), s.getAcessoAlimentacao());
		}
	}

	public record ProblemaSaudeResumo(String descricao, String gravidade) {
		static ProblemaSaudeResumo from(ProblemaSaude p) {
			return new ProblemaSaudeResumo(p.getDescricao(), p.getGravidade());
		}
	}

	public record MedicamentoResumo(String descricao, String dosagem) {
		static MedicamentoResumo from(Medicamento m) {
			return new MedicamentoResumo(m.getDescricao(), m.getDosagem());
		}
	}

	public static FamiliaResponse from(Familia f) {
		SituacaoSocioeconomica situacao = f.getSituacaoSocioeconomica();
		return new FamiliaResponse(
				f.getId(),
				f.getNome(),
				f.getNomeSocial(),
				f.getDataNascimento(),
				f.getGenero(),
				f.getEstadoCivil(),
				f.getIndicacao(),
				f.getNomeMae(),
				f.getEmail(),
				f.getCpf(),
				f.getRg(),
				f.getNis(),
				f.getNaturalidade(),
				f.getObservacoes(),
				f.getDataCadastro(),
				f.getTelefones().stream().map(Telefone::getNumero).toList(),
				f.getEnderecos().stream().map(EnderecoResumo::from).toList(),
				f.getDependentes().stream().map(DependenteResumo::from).toList(),
				situacao == null ? null : SituacaoSocioeconomicaResumo.from(situacao),
				f.getProblemasSaude().stream().map(ProblemaSaudeResumo::from).toList(),
				f.getMedicamentos().stream().map(MedicamentoResumo::from).toList(),
				f.getSubstancias().stream().map(Substancia::getDescricao).toList(),
				f.getServicos().stream().map(Servico::getNome).sorted().toList());
	}
}
