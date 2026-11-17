package br.org.ongalimentar.girassol.familia.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import br.org.ongalimentar.girassol.familia.Dependente;
import br.org.ongalimentar.girassol.familia.Endereco;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.familia.Medicamento;
import br.org.ongalimentar.girassol.familia.ProblemaSaude;
import br.org.ongalimentar.girassol.familia.Renda;
import br.org.ongalimentar.girassol.familia.Servico;
import br.org.ongalimentar.girassol.familia.SituacaoSocioeconomica;
import br.org.ongalimentar.girassol.familia.Substancia;
import br.org.ongalimentar.girassol.familia.Telefone;
import br.org.ongalimentar.girassol.familia.TipoMoradia;

/**
 * Mapeamento de {@link Familia} para {@link FamiliaResponse}, isolado do problema
 * de lazy-loading ({@code open-in-view=false}, resolvido no {@code FamiliaService})
 * — aqui as entidades são montadas inteiramente em memória, sem JPA/Testcontainers.
 */
class FamiliaResponseTest {

	@Test
	void mapeiaTodasAsColecoesDaFamilia() {
		Servico servico = new Servico();
		servico.setNome("Orientação jurídica");

		Familia familia = new Familia();
		familia.setNome("Ana da Silva");
		familia.addTelefone(new Telefone("53999990000"));
		familia.addEndereco(new Endereco("Rua das Flores", "Centro", "42", "Casa 2", "Pelotas", "96015000"));
		familia.addDependente(new Dependente("João da Silva", LocalDate.of(2012, 8, 3), "Filho", "Estudante"));

		SituacaoSocioeconomica situacao = new SituacaoSocioeconomica();
		situacao.setProfissao("Costureira");
		situacao.setEscolaridade("Ensino médio");
		situacao.setTipoMoradia(TipoMoradia.ALUGADA);
		situacao.setRenda(Renda.ATE_1_SALARIO_MINIMO);
		situacao.setBeneficio("Bolsa Família");
		situacao.setAcessoAlimentacao(true);
		familia.setSituacaoSocioeconomica(situacao);

		familia.addProblemaSaude(new ProblemaSaude("Asma", "Moderada"));
		familia.addMedicamento(new Medicamento("Salbutamol", "2 jatos"));
		familia.addSubstancia(new Substancia("Tabaco"));
		familia.addServico(servico);

		FamiliaResponse response = FamiliaResponse.from(familia);

		assertEquals(1, response.telefones().size());
		assertEquals("53999990000", response.telefones().get(0).numero());

		assertEquals(1, response.enderecos().size());
		assertEquals("Rua das Flores", response.enderecos().get(0).rua());
		assertEquals("Centro", response.enderecos().get(0).bairro());

		assertEquals(1, response.dependentes().size());
		assertEquals("João da Silva", response.dependentes().get(0).nome());
		assertEquals(LocalDate.of(2012, 8, 3), response.dependentes().get(0).dataNascimento());
		assertEquals("Filho", response.dependentes().get(0).parentesco());

		assertEquals(Renda.ATE_1_SALARIO_MINIMO, response.situacaoSocioeconomica().renda());
		assertEquals(TipoMoradia.ALUGADA, response.situacaoSocioeconomica().tipoMoradia());
		assertTrue(response.situacaoSocioeconomica().acessoAlimentacao());

		assertEquals(1, response.problemasSaude().size());
		assertEquals("Moderada", response.problemasSaude().get(0).gravidade());

		assertEquals(1, response.medicamentos().size());
		assertEquals("2 jatos", response.medicamentos().get(0).dosagem());

		assertEquals("Tabaco", response.substancias().get(0).descricao());
		assertEquals(1, response.servicosIds().size());
	}

	@Test
	void familiaSemColecoesViraListasVaziasESemSituacaoSocioeconomica() {
		Familia familia = new Familia();
		familia.setNome("Família sem dados complementares");

		FamiliaResponse response = FamiliaResponse.from(familia);

		assertTrue(response.telefones().isEmpty());
		assertTrue(response.enderecos().isEmpty());
		assertTrue(response.dependentes().isEmpty());
		assertNull(response.situacaoSocioeconomica());
		assertTrue(response.problemasSaude().isEmpty());
		assertTrue(response.medicamentos().isEmpty());
		assertTrue(response.substancias().isEmpty());
		assertTrue(response.servicosIds().isEmpty());
	}

	@Test
	void paraListagemIgnoraAsColecoesMesmoQuandoPreenchidas() {
		Familia familia = new Familia();
		familia.setNome("Ana da Silva");
		familia.addTelefone(new Telefone("53999990000"));
		familia.addServico(novoServico("Cesta básica"));

		FamiliaResponse response = FamiliaResponse.paraListagem(familia);

		assertEquals("Ana da Silva", response.nome());
		assertTrue(response.telefones().isEmpty());
		assertTrue(response.enderecos().isEmpty());
		assertTrue(response.dependentes().isEmpty());
		assertNull(response.situacaoSocioeconomica());
		assertTrue(response.problemasSaude().isEmpty());
		assertTrue(response.medicamentos().isEmpty());
		assertTrue(response.substancias().isEmpty());
		assertTrue(response.servicosIds().isEmpty());
	}

	private static Servico novoServico(String nome) {
		Servico servico = new Servico();
		servico.setNome(nome);
		return servico;
	}

	@Test
	void situacaoSocioeconomicaComCamposOpcionaisNulosNaoQuebra() {
		Familia familia = new Familia();
		familia.setNome("Família com situação parcial");
		familia.setSituacaoSocioeconomica(new SituacaoSocioeconomica());

		SituacaoSocioeconomicaResponse situacao = FamiliaResponse.from(familia).situacaoSocioeconomica();

		assertNull(situacao.renda());
		assertNull(situacao.tipoMoradia());
		assertNull(situacao.profissao());
		assertNull(situacao.acessoAlimentacao());
	}
}
