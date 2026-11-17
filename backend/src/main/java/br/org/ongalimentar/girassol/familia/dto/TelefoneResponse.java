package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.Telefone;

public record TelefoneResponse(
        Long id,
        String numero
) {
    public static TelefoneResponse from(Telefone telefone) {
        return new TelefoneResponse(
                telefone.getId(),
                telefone.getNumero()
        );
    }
}