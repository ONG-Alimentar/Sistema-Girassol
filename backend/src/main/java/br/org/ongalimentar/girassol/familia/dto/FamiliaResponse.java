package br.org.ongalimentar.girassol.familia.dto;

import java.time.LocalDate;

import br.org.ongalimentar.girassol.familia.EstadoCivil;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.Genero;
import br.org.ongalimentar.girassol.familia.Indicacao;

/** DTO de saída da {@link Familia} (campos escalares do cadastro). */
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
		LocalDate dataCadastro) {

	public static FamiliaResponse from(Familia f) {
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
				f.getDataCadastro());
	}
}
