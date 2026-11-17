package br.org.ongalimentar.girassol.familia.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import br.org.ongalimentar.girassol.familia.EstadoCivil;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.Genero;
import br.org.ongalimentar.girassol.familia.Indicacao;
import br.org.ongalimentar.girassol.familia.Servico;
import br.org.ongalimentar.girassol.familia.SituacaoSocioeconomica;

/**
 * DTO de saída da {@link Familia}: campos escalares do cadastro mais as coleções
 * (telefones, endereços, dependentes, situação socioeconômica, saúde, serviços),
 * reaproveitando os DTOs por entidade (#51) tanto para a tela de detalhe (#50,
 * só leitura) quanto para o formulário de edição. As coleções devem estar
 * inicializadas pelo service antes da conversão ({@code open-in-view=false}).
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
		List<TelefoneResponse> telefones,
		List<EnderecoResponse> enderecos,
		List<DependenteResponse> dependentes,
		List<ProblemaSaudeResponse> problemasSaude,
		List<MedicamentoResponse> medicamentos,
		List<SubstanciaResponse> substancias,
		SituacaoSocioeconomicaResponse situacaoSocioeconomica,
		Set<Long> servicosIds) {

	/**
	 * Versão enxuta para a listagem paginada ({@code GET /api/familias}): só os
	 * campos escalares, sem tocar nenhuma coleção lazy — a listagem (#23) não usa
	 * esses dados, e inicializá-los por linha custaria N×7 queries extras por página.
	 */
	public static FamiliaResponse paraListagem(Familia f) {
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
				List.of(),
				List.of(),
				List.of(),
				List.of(),
				List.of(),
				List.of(),
				null,
				Set.of());
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
				f.getTelefones().stream().map(TelefoneResponse::from).toList(),
				f.getEnderecos().stream().map(EnderecoResponse::from).toList(),
				f.getDependentes().stream().map(DependenteResponse::from).toList(),
				f.getProblemasSaude().stream().map(ProblemaSaudeResponse::from).toList(),
				f.getMedicamentos().stream().map(MedicamentoResponse::from).toList(),
				f.getSubstancias().stream().map(SubstanciaResponse::from).toList(),
				situacao == null ? null : SituacaoSocioeconomicaResponse.from(situacao),
				f.getServicos().stream().map(Servico::getId).collect(Collectors.toSet()));
	}
}
