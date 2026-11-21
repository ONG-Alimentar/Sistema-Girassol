package br.org.ongalimentar.girassol;

import br.org.ongalimentar.girassol.atendimento.*;
import br.org.ongalimentar.girassol.familia.Dependente;
import br.org.ongalimentar.girassol.familia.Familia;
import br.org.ongalimentar.girassol.rbac.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class AtendimentoPersistenceTests {

	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void persisteTiposRelacionamentosChecklistERetorno() {
		Familia familia = new Familia();
		familia.setNome("Família de teste");
		Dependente dependente = new Dependente("Dependente", null, "Filho", null);
		familia.addDependente(dependente);
		entityManager.persist(familia);
		Usuario usuario = new Usuario("Profissional", "profissional@example.org", "hash");
		entityManager.persist(usuario);

		AtendimentoJuridico juridico = new AtendimentoJuridico();
		juridico.setResponsavelFamilia(familia);
		juridico.setProfissional(usuario);
		juridico.setNumeroDependente(dependente);
		juridico.setDataHora(LocalDateTime.of(2026, 1, 1, 10, 30));
		juridico.setDataHoraRetorno(LocalDateTime.of(2026, 2, 1, 10, 30));
		juridico.setModalidade(Modalidade.PRESENCIAL);
		juridico.setDescricaoDoCaso("Relato do caso");
		juridico.setBens("Imóvel");
		juridico.setPartesEnvolvidas("Parte envolvida");
		juridico.setOrientacaoJuridica("Orientação");
		juridico.setEncaminhamento("Encaminhamento");
		juridico.setBens("Imóvel");
		juridico.setPartesEnvolvidas("Parte envolvida");
		juridico.setOrientacaoJuridica("Orientação");
		juridico.setEncaminhamento("Encaminhamento");
		juridico.addDocumento(new DocumentoApresentado(
			"RG",
			"rg_dependente.pdf",
			"atendimentos/juridicos/rg_dependente.pdf",
			"application/pdf",
			1024L
		));
		juridico.addDocumento(new DocumentoApresentado(
			"Comprovante de residência",
			"comprovante_residencia.jpg",
			"atendimentos/juridicos/comprovante_residencia.jpg",
			"image/jpeg",
			2048L
		));
		entityManager.persist(juridico);

		AtendimentoPsicologico psicologico = new AtendimentoPsicologico();
		psicologico.setResponsavelFamilia(familia);
		psicologico.setProfissional(usuario);
		psicologico.setDataHora(LocalDateTime.of(2026, 1, 2, 10, 30));
		psicologico.setCondicoesInvestigadas("Condições");
		psicologico.setDiagnosticosPrevios("Diagnósticos");
		psicologico.setHistoricoSubstancias("Substâncias");
		psicologico.setInternacao("Internação");
		entityManager.persist(psicologico);
		entityManager.flush();
		Long juridicoId = juridico.getId();
		Long psicologicoId = psicologico.getId();
		entityManager.clear();

		AtendimentoJuridico salvo = (AtendimentoJuridico) entityManager.find(Atendimento.class, juridicoId);
		assertEquals("Família de teste", salvo.getResponsavelFamilia().getNome());
		assertEquals("Profissional", salvo.getProfissional().getNome());
		assertEquals("Dependente", salvo.getNumeroDependente().getNome());
		assertEquals(LocalDateTime.of(2026, 1 , 1, 10, 30), salvo.getDataHora());
		assertEquals("Relato do caso", salvo.getDescricaoDoCaso());
		assertEquals("Imóvel", salvo.getBens());
		assertEquals("Parte envolvida", salvo.getPartesEnvolvidas());
		assertEquals("Orientação", salvo.getOrientacaoJuridica());
		assertEquals("Encaminhamento", salvo.getEncaminhamento());

		DocumentoApresentado rg = salvo.getDocumentos().stream()
			.filter(documento -> "RG".equals(documento.getTipoDocumento()))
			.findFirst()
			.orElseThrow();
		assertEquals("rg_dependente.pdf", rg.getNomeDocumento());
		assertEquals("atendimentos/juridicos/rg_dependente.pdf", rg.getCaminhoStorage());
		assertEquals("application/pdf", rg.getContentType());
		assertEquals(1024L, rg.getTamanhoBytes());
		assertNotNull(rg.getDataUpload());
		assertEquals(salvo, rg.getAtendimentoJuridico());

		DocumentoApresentado comprovanteResidencia = salvo.getDocumentos().stream()
			.filter(documento -> "Comprovante de residência".equals(documento.getTipoDocumento()))
			.findFirst()
			.orElseThrow();
		assertEquals("comprovante_residencia.jpg", comprovanteResidencia.getNomeDocumento());
		assertEquals("atendimentos/juridicos/comprovante_residencia.jpg", comprovanteResidencia.getCaminhoStorage());
		assertEquals("image/jpeg", comprovanteResidencia.getContentType());
		assertEquals(2048L, comprovanteResidencia.getTamanhoBytes());
		assertNotNull(comprovanteResidencia.getDataUpload());
		assertEquals(salvo, comprovanteResidencia.getAtendimentoJuridico());

		AtendimentoPsicologico salvoPsicologico = (AtendimentoPsicologico) entityManager.find(Atendimento.class, psicologicoId);
		assertNull(salvoPsicologico.getNumeroDependente());
		assertNull(salvoPsicologico.getDataHoraRetorno());
		assertEquals("Condições", salvoPsicologico.getCondicoesInvestigadas());
		assertEquals("Diagnósticos", salvoPsicologico.getDiagnosticosPrevios());
		assertEquals("Substâncias", salvoPsicologico.getHistoricoSubstancias());
		assertEquals("Internação", salvoPsicologico.getInternacao());
		assertEquals(1, entityManager.createQuery("select a from Atendimento a where a.dataHoraRetorno > :data", Atendimento.class)
				.setParameter("data", LocalDate.of(2026, 1, 15).atStartOfDay()).getResultList().size());
	}
}
