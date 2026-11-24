package br.org.ongalimentar.girassol.doacaoroupa.dto;

import java.time.LocalDate;
import java.util.List;

import br.org.ongalimentar.girassol.doacaoroupa.DoacaoRoupa;

/** DTO de saída de uma {@link DoacaoRoupa}, com a família resolvida para exibição. */
public record RoupaResponse(
		Long id,
		LocalDate data,
		int quantidade,
		Long familiaId,
		String familiaNome,
		List<PecaRoupaResponse> pecas) {

	public static RoupaResponse from(DoacaoRoupa r) {
		return new RoupaResponse(
				r.getId(),
				r.getData(),
				r.getQuantidade(),
				r.getFamilia() != null ? r.getFamilia().getId() : null,
				r.getFamilia() != null ? r.getFamilia().getNome() : null,
				r.getPecas().stream().map(PecaRoupaResponse::from).toList());
	}
}
