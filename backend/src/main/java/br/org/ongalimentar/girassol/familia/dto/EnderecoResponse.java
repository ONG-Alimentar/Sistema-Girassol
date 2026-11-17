package br.org.ongalimentar.girassol.familia.dto;

import br.org.ongalimentar.girassol.familia.Endereco;

public record EnderecoResponse(
        Long id,
        String rua,
        String bairro,
        String numero,
        String complemento,
        String cidade,
        String cep
) {
    public static EnderecoResponse from(Endereco endereco) {
        return new EnderecoResponse(
                endereco.getId(),
                endereco.getRua(),
                endereco.getBairro(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getCidade(),
                endereco.getCep()
        );
    }
}