package br.org.ongalimentar.girassol;

import br.org.ongalimentar.girassol.familia.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class FamiliaPersistenceTests {

	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void createsSchemaAndPersistsFamilyAndItsRelatedRecords() {
		Servico servico = new Servico();
		servico.setNome("Orientação jurídica");
		entityManager.persist(servico);

		Familia familia = new Familia();
		familia.setNome("Ana da Silva");
		familia.setNomeSocial("Ana");
		familia.setDataNascimento(LocalDate.of(1987, 4, 12));
		familia.setGenero(Genero.FEMININO);
		familia.setEstadoCivil(EstadoCivil.SOLTEIRO);
		familia.setIndicacao(Indicacao.RECOMENDACAO_DE_AMIGOS_OU_CONHECIDOS);
		familia.setNomeMae("Maria da Silva");
		familia.setCpf("12345678900");
		familia.setRg("1234567");
		familia.setNis("12345678901");
		familia.setEmail("ana@example.org");
		familia.setObservacoes("Contato no período da tarde");
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

		entityManager.persist(familia);
		entityManager.flush();
		Long familiaId = familia.getId();

		entityManager.clear();

		Familia persistida = entityManager.find(Familia.class, familiaId);
		assertNotNull(persistida);
		assertEquals("Ana da Silva", persistida.getNome());
		assertEquals(EstadoCivil.SOLTEIRO, persistida.getEstadoCivil());
		assertNotNull(persistida.getDataCadastro());
		assertEquals("53999990000", persistida.getTelefones().getFirst().getNumero());
		assertEquals("Rua das Flores", persistida.getEnderecos().getFirst().getRua());
		assertEquals(LocalDate.of(2012, 8, 3), persistida.getDependentes().getFirst().getDataNascimento());
		assertEquals(Renda.ATE_1_SALARIO_MINIMO, persistida.getSituacaoSocioeconomica().getRenda());
		assertEquals("Moderada", persistida.getProblemasSaude().getFirst().getGravidade());
		assertEquals("2 jatos", persistida.getMedicamentos().getFirst().getDosagem());
		assertEquals("Tabaco", persistida.getSubstancias().getFirst().getDescricao());
		assertEquals("Orientação jurídica", persistida.getServicos().iterator().next().getNome());
	}

	@Test
	void removesOrphanedRecordsWithoutDeletingSharedServices() {
		Servico servico = new Servico();
		servico.setNome("Cesta básica");
		entityManager.persist(servico);

		Familia primeiraFamilia = new Familia();
		primeiraFamilia.setNome("Família A");
		Telefone telefone = new Telefone("53911111111");
		primeiraFamilia.addTelefone(telefone);
		primeiraFamilia.addServico(servico);

		Familia segundaFamilia = new Familia();
		segundaFamilia.setNome("Família B");
		segundaFamilia.addServico(servico);

		entityManager.persist(primeiraFamilia);
		entityManager.persist(segundaFamilia);
		entityManager.flush();
		Long servicoId = servico.getId();
		Long telefoneId = telefone.getId();
		Long segundaFamiliaId = segundaFamilia.getId();

		primeiraFamilia.removeTelefone(telefone);
		entityManager.flush();
		assertNull(entityManager.find(Telefone.class, telefoneId));

		entityManager.remove(primeiraFamilia);
		entityManager.flush();
		entityManager.clear();

		assertNotNull(entityManager.find(Servico.class, servicoId));
		Familia familiaRestante = entityManager.find(Familia.class, segundaFamiliaId);
		assertEquals(1, familiaRestante.getServicos().size());
	}

	@Test
	void allowsMultipleFamiliesWithoutCpfButRejectsDuplicateCpf() {
		// Famílias em situação de extrema pobreza podem não ter CPF. A constraint
		// UNIQUE do Postgres trata NULL como distinto, então vários cpf == null
		// convivem; apenas um cpf NÃO-nulo repetido é barrado.
		Familia semCpfA = new Familia();
		semCpfA.setNome("Família sem CPF A");
		Familia semCpfB = new Familia();
		semCpfB.setNome("Família sem CPF B");

		entityManager.persist(semCpfA);
		entityManager.persist(semCpfB);
		entityManager.flush();

		assertNotNull(semCpfA.getId());
		assertNotNull(semCpfB.getId());

		Familia comCpf = new Familia();
		comCpf.setNome("Família com CPF");
		comCpf.setCpf("11122233344");
		entityManager.persist(comCpf);
		entityManager.flush();

		// Com GenerationType.IDENTITY o INSERT sai já no persist(); o flush cobre
		// o caso de estratégias com escrita adiada. Qualquer um deve violar a UNIQUE.
		Familia cpfDuplicado = new Familia();
		cpfDuplicado.setNome("Família com CPF duplicado");
		cpfDuplicado.setCpf("11122233344");
		assertThrows(RuntimeException.class, () -> {
			entityManager.persist(cpfDuplicado);
			entityManager.flush();
		});
	}
}
