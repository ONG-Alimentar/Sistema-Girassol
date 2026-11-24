package br.org.ongalimentar.girassol.doacaoroupa.dto;

import br.org.ongalimentar.girassol.familia.Genero;
import jakarta.validation.constraints.NotBlank;

/** Peça de uma doação de roupa (descrição obrigatória; tamanho e gênero opcionais). */
public record PecaRoupaRequest(
		@NotBlank(message = "A descrição da peça é obrigatória.") String descricao,
		String tamanho,
		Genero genero) {
}
