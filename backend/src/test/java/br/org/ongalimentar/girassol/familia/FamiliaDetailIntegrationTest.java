package br.org.ongalimentar.girassol.familia;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;

/**
 * Valida que {@code GET /api/familias/{id}} e {@code GET /api/familias} expõem as
 * coleções da família (telefones, endereços, dependentes, situação
 * socioeconômica, saúde, serviços) sem {@code LazyInitializationException}
 * ({@code open-in-view=false}, resolvido no {@link FamiliaService}).
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = "FAMILIA:READ")
class FamiliaDetailIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private FamiliaRepository repository;

	private MockMvc mvc;

	@BeforeEach
	void setup() {
		repository.deleteAll();
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	@Test
	void detalheRetornaColecoesCompletas() throws Exception {
		Familia familia = new Familia();
		familia.setNome("Ana da Silva");
		familia.addTelefone(new Telefone("53999990000"));
		familia.addEndereco(new Endereco("Rua das Flores", "Centro", "42", "Casa 2", "Pelotas", "96015000"));
		familia.addDependente(new Dependente("João da Silva", LocalDate.of(2012, 8, 3), "Filho", "Estudante"));

		SituacaoSocioeconomica situacao = new SituacaoSocioeconomica();
		situacao.setProfissao("Costureira");
		situacao.setTipoMoradia(TipoMoradia.ALUGADA);
		situacao.setRenda(Renda.ATE_1_SALARIO_MINIMO);
		situacao.setAcessoAlimentacao(true);
		familia.setSituacaoSocioeconomica(situacao);

		familia.addProblemaSaude(new ProblemaSaude("Asma", "Moderada"));
		familia.addMedicamento(new Medicamento("Salbutamol", "2 jatos"));
		familia.addSubstancia(new Substancia("Tabaco"));

		Long id = repository.save(familia).getId();

		mvc.perform(get("/api/familias/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.telefones[0]").value("53999990000"))
				.andExpect(jsonPath("$.enderecos[0].rua").value("Rua das Flores"))
				.andExpect(jsonPath("$.dependentes[0].parentesco").value("Filho"))
				.andExpect(jsonPath("$.situacaoSocioeconomica.renda").value("ATE_1_SALARIO_MINIMO"))
				.andExpect(jsonPath("$.situacaoSocioeconomica.acessoAlimentacao").value(true))
				.andExpect(jsonPath("$.problemasSaude[0].gravidade").value("Moderada"))
				.andExpect(jsonPath("$.medicamentos[0].dosagem").value("2 jatos"))
				.andExpect(jsonPath("$.substancias[0]").value("Tabaco"));
	}

	@Test
	void detalheComFamiliaSemColecoesNaoQuebra() throws Exception {
		Familia familia = new Familia();
		familia.setNome("Família sem dados complementares");
		Long id = repository.save(familia).getId();

		mvc.perform(get("/api/familias/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.telefones").isArray())
				.andExpect(jsonPath("$.telefones").isEmpty())
				.andExpect(jsonPath("$.enderecos").isEmpty())
				.andExpect(jsonPath("$.dependentes").isEmpty())
				.andExpect(jsonPath("$.situacaoSocioeconomica").value(nullValue()))
				.andExpect(jsonPath("$.problemasSaude").isEmpty())
				.andExpect(jsonPath("$.medicamentos").isEmpty())
				.andExpect(jsonPath("$.substancias").isEmpty())
				.andExpect(jsonPath("$.servicos").isEmpty());
	}

	@Test
	void listagemContinuaFuncionandoAposExpandirOResponse() throws Exception {
		Familia familia = new Familia();
		familia.setNome("Família X");
		familia.addTelefone(new Telefone("53911111111"));
		repository.save(familia);

		mvc.perform(get("/api/familias"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].nome").value("Família X"))
				.andExpect(jsonPath("$.content[0].telefones[0]").value("53911111111"));
	}
}
