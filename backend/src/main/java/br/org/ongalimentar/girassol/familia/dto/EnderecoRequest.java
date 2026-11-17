package br.org.ongalimentar.girassol.familia.dto;
import jakarta.validation.constraints.NotBlank;

public record EnderecoRequest(
        Long id,

        @NotBlank(message = "A rua é obrigatória.")
        String rua,
        
        String bairro,
        String numero,
        String complemento,
        String cidade,
        String cep
) {
}