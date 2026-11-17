package br.org.ongalimentar.girassol.familia;

import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.common.crud.CrudService;

/**
 * CRUD da {@link Familia} sobre a base genérica. O código específico aqui é
 * mínimo: apenas o vínculo com o repositório e os guards RBAC por operação
 * ({@code FAMILIA:*}), sobrescrevendo os métodos da base com {@code @PreAuthorize}
 * (padrão de autorização por método do {@code SecurityConfig}). Como o
 * {@code open-in-view=false}, as coleções lazy (telefones, endereços,
 * dependentes, saúde, substâncias, serviços e situação socioeconômica) são
 * inicializadas aqui, dentro da transação, para o {@code FamiliaResponse}
 * conseguir lê-las no controller — exceto em {@link #list}, que o
 * {@code FamiliaController} mapeia para uma resposta enxuta (só escalares),
 * sem tocar nas coleções: evita N×7 queries lazy por página de listagem (a
 * listagem não usa esses dados).
 */
@Service
public class FamiliaService extends CrudService<Familia, Long> {

	public FamiliaService(FamiliaRepository repository) {
		super(repository, "Família");
	}

	@Override
	@PreAuthorize("hasAuthority('FAMILIA:READ')")
	public Page<Familia> list(Specification<Familia> filtro, Pageable pageable) {
		return super.list(filtro, pageable);
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('FAMILIA:READ')")
	public Familia buscar(Long id) {
		Familia familia = super.buscar(id);
		inicializarColecoes(familia);
		return familia;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('FAMILIA:CREATE')")
	public Familia criar(Familia entidade) {
		Familia salva = super.criar(entidade);
		inicializarColecoes(salva);
		return salva;
	}

	@Override
	@Transactional
	@PreAuthorize("hasAuthority('FAMILIA:UPDATE')")
	public Familia atualizar(Long id, Consumer<Familia> patch) {
		Familia salva = super.atualizar(id, patch);
		inicializarColecoes(salva);
		return salva;
	}

	@Override
	@PreAuthorize("hasAuthority('FAMILIA:DELETE')")
	public void excluir(Long id) {
		super.excluir(id);
	}

	/** Toca as coleções lazy para materializá-las antes de a transação fechar. */
	private static void inicializarColecoes(Familia familia) {
		familia.getTelefones().size();
		familia.getEnderecos().size();
		familia.getDependentes().size();
		familia.getProblemasSaude().size();
		familia.getMedicamentos().size();
		familia.getSubstancias().size();
		familia.getServicos().size();
		familia.getSituacaoSocioeconomica();
	}
}
