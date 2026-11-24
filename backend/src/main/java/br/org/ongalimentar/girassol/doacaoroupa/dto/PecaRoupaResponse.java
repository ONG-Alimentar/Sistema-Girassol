package br.org.ongalimentar.girassol.doacaoroupa.dto;

import br.org.ongalimentar.girassol.doacaoroupa.PecaRoupa;
import br.org.ongalimentar.girassol.familia.Genero;

/** DTO de saída de uma {@link PecaRoupa}. */
public record PecaRoupaResponse(Long id, String descricao, String tamanho, Genero genero) {

	public static PecaRoupaResponse from(PecaRoupa peca) {
		return new PecaRoupaResponse(peca.getId(), peca.getDescricao(), peca.getTamanho(), peca.getGenero());
	}
}
