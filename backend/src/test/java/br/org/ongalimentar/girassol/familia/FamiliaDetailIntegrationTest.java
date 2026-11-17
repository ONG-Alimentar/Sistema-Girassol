package br.org.ongalimentar.girassol.familia;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.time.LocalDate;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.org.ongalimentar.girassol.TestcontainersConfiguration;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@WithMockUser(authorities = { "FAMILIA:READ", "FAMILIA:CREATE", "FAMILIA:UPDATE" })
class FamiliaDetailIntegrationTest {

	@Autowired
	private WebApplicationContext context;
	@Autowired
	private FamiliaRepository repository;
	@Autowired
	private ServicoRepository servicoRepository;

	private MockMvc mvc;

	@BeforeEach
	void setup() {
		limparRepositorios();
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	@AfterEach
	void tearDown() {
		limparRepositorios();
	}

	private void limparRepositorios() {
		repository.deleteAll();
		servicoRepository.deleteAll();
	}

	@Test
	void detalheRetornaColecoesCompletas() throws Exception {
		Servico servico = new Servico();
		servico.setNome("Orientação jurídica");
		servicoRepository.save(servico);

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
		familia.addServico(servico);

		Long id = repository.save(familia).getId();

		mvc.perform(get("/api/familias/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.telefones[0].numero").value("53999990000"))
				.andExpect(jsonPath("$.enderecos[0].rua").value("Rua das Flores"))
				.andExpect(jsonPath("$.dependentes[0].parentesco").value("Filho"))
				.andExpect(jsonPath("$.situacaoSocioeconomica.renda").value("ATE_1_SALARIO_MINIMO"))
				.andExpect(jsonPath("$.situacaoSocioeconomica.acessoAlimentacao").value(true))
				.andExpect(jsonPath("$.problemasSaude[0].gravidade").value("Moderada"))
				.andExpect(jsonPath("$.medicamentos[0].dosagem").value("2 jatos"))
				.andExpect(jsonPath("$.substancias[0].descricao").value("Tabaco"))
				.andExpect(jsonPath("$.servicosIds[0]").value(servico.getId()));
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
				.andExpect(jsonPath("$.servicosIds").isEmpty());
	}

	@Test
	void listagemUsaRespostaEnxutaSemExporColecoes() throws Exception {
		Familia familia = new Familia();
		familia.setNome("Família X");
		familia.addTelefone(new Telefone("53911111111"));
		repository.save(familia);

		mvc.perform(get("/api/familias"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].nome").value("Família X"))
				.andExpect(jsonPath("$.content[0].telefones").isArray())
				.andExpect(jsonPath("$.content[0].telefones").isEmpty());
	}

	@Test
	void criarEAtualizarRetornamColecoesVaziasSemLazyInitializationException() throws Exception {
		mvc.perform(post("/api/familias").contentType(MediaType.APPLICATION_JSON)
						.content("{\"nome\":\"Família Y\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.telefones").isArray())
				.andExpect(jsonPath("$.telefones").isEmpty())
				.andExpect(jsonPath("$.situacaoSocioeconomica").value(nullValue()));
		Long id = repository.findAll().get(0).getId();

		mvc.perform(put("/api/familias/" + id).contentType(MediaType.APPLICATION_JSON)
						.content("{\"nome\":\"Família Y Atualizada\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Família Y Atualizada"))
				.andExpect(jsonPath("$.telefones").isArray())
				.andExpect(jsonPath("$.telefones").isEmpty())
				.andExpect(jsonPath("$.servicosIds").isEmpty());
	}
}
