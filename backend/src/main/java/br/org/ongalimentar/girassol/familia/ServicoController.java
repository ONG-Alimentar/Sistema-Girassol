package br.org.ongalimentar.girassol.familia;

import br.org.ongalimentar.girassol.familia.dto.ServicoResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoRepository repository;

    public ServicoController(ServicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FAMILIA:READ')")
    public List<ServicoResponse> listar() {
        return repository.findAll()
                .stream()
                .map(ServicoResponse::from)
                .toList();
    }
}