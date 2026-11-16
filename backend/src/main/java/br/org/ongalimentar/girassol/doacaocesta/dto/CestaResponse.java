package br.org.ongalimentar.girassol.doacaocesta.dto;

import java.time.LocalDate;
import java.util.List;

import br.org.ongalimentar.girassol.doacaocesta.DoacaoCesta;

/** DTO de saída de uma {@link DoacaoCesta}, com a família resolvida para exibição. */
public record CestaResponse(
		Long id,
		LocalDate data,
		Long familiaId,
		String familiaNome,
		List<ItemCestaResponse> itens) {

	public static CestaResponse from(DoacaoCesta c) {
		return new CestaResponse(
				c.getId(),
				c.getData(),
				c.getFamilia() != null ? c.getFamilia().getId() : null,
				c.getFamilia() != null ? c.getFamilia().getNome() : null,
				c.getItens().stream().map(ItemCestaResponse::from).toList());
	}
}
