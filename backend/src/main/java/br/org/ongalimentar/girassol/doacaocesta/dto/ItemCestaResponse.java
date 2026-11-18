package br.org.ongalimentar.girassol.doacaocesta.dto;

import java.math.BigDecimal;

import br.org.ongalimentar.girassol.doacaocesta.ItemCesta;

/** DTO de saída de um {@link ItemCesta}. */
public record ItemCestaResponse(Long id, String descricao, BigDecimal quantidade) {

	public static ItemCestaResponse from(ItemCesta item) {
		return new ItemCestaResponse(item.getId(), item.getDescricao(), item.getQuantidade());
	}
}
