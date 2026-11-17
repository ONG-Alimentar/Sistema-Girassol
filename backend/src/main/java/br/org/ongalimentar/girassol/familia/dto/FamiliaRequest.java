package br.org.ongalimentar.girassol.familia.dto;

import java.time.LocalDate;
import java.util.Set;

import br.org.ongalimentar.girassol.familia.EstadoCivil;
import br.org.ongalimentar.girassol.familia.Genero;
import br.org.ongalimentar.girassol.familia.Indicacao;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import jakarta.validation.Valid;

/**
 * DTO de entrada (create/update) da {@link br.org.ongalimentar.girassol.familia.Familia}.
 * Cobre os campos escalares do cadastro — as coleções (telefones, endereços,
 * dependentes, situação socioeconômica, saúde, serviços) ficam para o módulo
 * Famílias (#4).
 */
public record FamiliaRequest(
		@NotBlank(message = "O nome é obrigatório.") String nome,
		String nomeSocial,
		LocalDate dataNascimento,
		Genero genero,
		EstadoCivil estadoCivil,
		Indicacao indicacao,
		String nomeMae,
		@Email(message = "E-mail inválido.") String email,
		String cpf,
		String rg,
		String nis,
		String naturalidade,
		@Size(max = 2000, message = "As observações devem ter no máximo 2000 caracteres.") String observacoes,
		@Valid List<TelefoneRequest> telefones, 
		@Valid List<EnderecoRequest> enderecos,
		@Valid List<DependenteRequest> dependentes,
		@Valid List<ProblemaSaudeRequest> problemasSaude,
		@Valid List<MedicamentoRequest> medicamentos,
		@Valid List<SubstanciaRequest> substancias,
		@Valid SituacaoSocioeconomicaRequest situacaoSocioeconomica,
		Set<Long> servicosIds){
			
		}
