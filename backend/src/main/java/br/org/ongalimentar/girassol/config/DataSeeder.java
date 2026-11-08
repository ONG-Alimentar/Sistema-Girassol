package br.org.ongalimentar.girassol.config;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.org.ongalimentar.girassol.rbac.Cargo;
import br.org.ongalimentar.girassol.rbac.CargoRepository;
import br.org.ongalimentar.girassol.rbac.Permissao;
import br.org.ongalimentar.girassol.rbac.PermissaoRepository;
import br.org.ongalimentar.girassol.rbac.Usuario;
import br.org.ongalimentar.girassol.rbac.UsuarioRepository;

/**
 * Semeia o RBAC (catálogo de permissões, cargos e o mapeamento cargo→permissão)
 * conforme {@code docs/seguranca/rbac.md}. Idempotente: só cria o que falta, então
 * pode rodar a cada startup.
 *
 * <p>Ativo apenas nos profiles {@code dev} e {@code prod} (não nos testes, que
 * montam seus próprios dados). O usuário admin inicial é criado <b>somente</b>
 * quando {@code app.seed.admin=true} (ligado no profile dev) — prod não recebe
 * conta com senha padrão.
 */
@Component
@Profile({ "dev", "prod" })
public class DataSeeder implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

	/** Catálogo completo de permissões (espelha frontend/src/auth/permissions.ts). */
	private static final List<String> CATALOGO = List.of(
			"CONTA:CREATE", "SENHA:UPDATE_SELF",
			"FAMILIA:READ", "FAMILIA:CREATE", "FAMILIA:UPDATE", "FAMILIA:DELETE",
			"DOCUMENTACAO:READ", "DOCUMENTACAO:CREATE", "DOCUMENTACAO:DELETE",
			"PROJETO:READ", "PROJETO:CREATE", "PROJETO:UPDATE", "PROJETO:DELETE",
			"FINANCEIRO:READ", "FINANCEIRO:CREATE", "FINANCEIRO:UPDATE", "FINANCEIRO:DELETE",
			"VOL_EXTERNO:READ", "VOL_EXTERNO:CREATE", "VOL_EXTERNO:UPDATE", "VOL_EXTERNO:DELETE",
			"CESTA:READ", "CESTA:CREATE", "CESTA:DELETE",
			"ROUPA:READ", "ROUPA:CREATE", "ROUPA:DELETE",
			"VISITA:READ", "VISITA:CREATE", "VISITA:DELETE",
			"JURIDICO:READ", "JURIDICO:CREATE", "JURIDICO:UPDATE", "JURIDICO:DELETE",
			"PSICOLOGICO:READ", "PSICOLOGICO:CREATE", "PSICOLOGICO:UPDATE", "PSICOLOGICO:DELETE");

	/** Mapeamento cargo → permissões (rbac.md). ADMINISTRADOR recebe tudo. */
	private static final Map<String, List<String>> CARGOS = cargos();

	private final PermissaoRepository permissaoRepository;
	private final CargoRepository cargoRepository;
	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.seed.admin:false}")
	private boolean seedAdmin;

	@Value("${app.seed.admin-email:admin@ong.org}")
	private String adminEmail;

	@Value("${app.seed.admin-password:admin}")
	private String adminPassword;

	public DataSeeder(PermissaoRepository permissaoRepository, CargoRepository cargoRepository,
			UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
		this.permissaoRepository = permissaoRepository;
		this.cargoRepository = cargoRepository;
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional
	public void run(String... args) {
		Map<String, Permissao> porCodigo = garantirPermissoes();
		garantirCargos(porCodigo);
		if (seedAdmin) {
			garantirAdmin();
		}
	}

	private Map<String, Permissao> garantirPermissoes() {
		Map<String, Permissao> porCodigo = new LinkedHashMap<>();
		for (String codigo : CATALOGO) {
			Permissao permissao = permissaoRepository.findByCodigo(codigo)
					.orElseGet(() -> permissaoRepository.save(new Permissao(codigo)));
			porCodigo.put(codigo, permissao);
		}
		return porCodigo;
	}

	private void garantirCargos(Map<String, Permissao> porCodigo) {
		CARGOS.forEach((nome, codigos) -> {
			if (cargoRepository.findByNome(nome).isPresent()) {
				return;
			}
			Cargo cargo = new Cargo(nome);
			for (String codigo : codigos) {
				cargo.adicionarPermissao(porCodigo.get(codigo));
			}
			cargoRepository.save(cargo);
			log.info("Seed RBAC: cargo '{}' criado com {} permissões", nome, codigos.size());
		});
	}

	private void garantirAdmin() {
		if (usuarioRepository.existsByEmail(adminEmail)) {
			return;
		}
		Usuario admin = new Usuario("Administrador", adminEmail, passwordEncoder.encode(adminPassword));
		cargoRepository.findByNome("ADMINISTRADOR").ifPresent(admin::adicionarCargo);
		usuarioRepository.save(admin);
		log.warn("Seed RBAC: usuário admin '{}' criado com SENHA PADRÃO — use apenas em dev.", adminEmail);
	}

	private static Map<String, List<String>> cargos() {
		Map<String, List<String>> map = new LinkedHashMap<>();
		// Administrador: superusuário — todas as permissões do catálogo (inclui sigilo).
		map.put("ADMINISTRADOR", CATALOGO);
		map.put("ASSISTENTE_SOCIAL", List.of(
				"FAMILIA:READ", "FAMILIA:CREATE", "FAMILIA:UPDATE", "FAMILIA:DELETE",
				"DOCUMENTACAO:READ", "DOCUMENTACAO:CREATE", "DOCUMENTACAO:DELETE",
				"PROJETO:READ", "PROJETO:CREATE", "PROJETO:UPDATE", "PROJETO:DELETE",
				"FINANCEIRO:READ", "FINANCEIRO:CREATE", "FINANCEIRO:UPDATE", "FINANCEIRO:DELETE",
				"VOL_EXTERNO:READ", "VOL_EXTERNO:CREATE", "VOL_EXTERNO:UPDATE", "VOL_EXTERNO:DELETE",
				"CESTA:READ", "CESTA:CREATE", "CESTA:DELETE",
				"ROUPA:READ", "ROUPA:CREATE", "ROUPA:DELETE",
				"VISITA:READ", "VISITA:CREATE", "VISITA:DELETE",
				"SENHA:UPDATE_SELF"));
		map.put("VOLUNTARIO_INTERNO", List.of(
				"CESTA:READ", "CESTA:CREATE", "CESTA:DELETE",
				"ROUPA:READ", "ROUPA:CREATE", "ROUPA:DELETE",
				"VISITA:READ", "VISITA:CREATE", "VISITA:DELETE",
				"SENHA:UPDATE_SELF"));
		map.put("ADVOGADA", List.of(
				"JURIDICO:READ", "JURIDICO:CREATE", "JURIDICO:UPDATE", "JURIDICO:DELETE",
				"SENHA:UPDATE_SELF"));
		map.put("PSICOLOGO", List.of(
				"PSICOLOGICO:READ", "PSICOLOGICO:CREATE", "PSICOLOGICO:UPDATE", "PSICOLOGICO:DELETE",
				"SENHA:UPDATE_SELF"));
		return map;
	}
}
