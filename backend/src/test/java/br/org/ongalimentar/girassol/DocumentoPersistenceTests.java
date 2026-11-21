package br.org.ongalimentar.girassol;

import br.org.ongalimentar.girassol.documento.Documento;
import br.org.ongalimentar.girassol.rbac.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class DocumentoPersistenceTests {

	@PersistenceContext
	private EntityManager entityManager;

	@Test
	void createsSchemaAndPersistsDocumento() {
		Documento documento = new Documento(
			"RG",
			"RG_Joao_Vitor.pdf",
			"documentos/RG_Joao_Vitor.pdf",
			"application/pdf",
			1024L
		);
		documento.setDescricao("Documento de identificação");

		entityManager.persist(documento);
		entityManager.flush();

		Long documentoId = documento.getId();

		entityManager.clear();

		Documento persistido = entityManager.find(Documento.class, documentoId);

		assertNotNull(persistido);
		assertEquals("RG", persistido.getTipoDocumento());
		assertEquals("RG_Joao_Vitor.pdf", persistido.getNomeDocumento());
		assertEquals("documentos/RG_Joao_Vitor.pdf", persistido.getCaminhoStorage());
		assertEquals("application/pdf", persistido.getContentType());
		assertEquals(1024L, persistido.getTamanhoBytes());
		assertEquals("Documento de identificação", persistido.getDescricao());
		assertNotNull(persistido.getDataUpload());
		assertNull(persistido.getCadastradoPor());
	}

	@Test
	void persistsDocumentoWithUsuarioCadastradoPor() {
		Usuario usuario = new Usuario(
			"Usuário Responsável",
			"responsavel@girassol.org.br",
			"senha-hash"
		);
		entityManager.persist(usuario);

		Documento documento = new Documento(
			"CPF",
			"CPF_Maria.pdf",
			"documentos/CPF_Maria.pdf",
			"application/pdf",
			2048L
		);
		documento.setCadastradoPor(usuario);

		entityManager.persist(documento);
		entityManager.flush();

		Long documentoId = documento.getId();

		entityManager.clear();

		Documento persistido = entityManager.find(Documento.class, documentoId);

		assertNotNull(persistido);
		assertEquals("CPF", persistido.getTipoDocumento());
		assertNotNull(persistido.getCadastradoPor());
		assertEquals("Usuário Responsável", persistido.getCadastradoPor().getNome());
		assertEquals("responsavel@girassol.org.br", persistido.getCadastradoPor().getEmail());
	}

	@Test
	void persistsDocumentoWithoutOptionalTamanhoBytesAndDescricao() {
		Documento documento = new Documento(
			"CERTIDÃO DE NASCIMENTO",
			"Certidao_Ana.jpg",
			"documentos/Certidao_Ana.jpg",
			"image/jpeg"
		);

		entityManager.persist(documento);
		entityManager.flush();

		Long documentoId = documento.getId();

		entityManager.clear();

		Documento persistido = entityManager.find(Documento.class, documentoId);

		assertNotNull(persistido);
		assertEquals("CERTIDÃO DE NASCIMENTO", persistido.getTipoDocumento());
		assertEquals("Certidao_Ana.jpg", persistido.getNomeDocumento());
		assertEquals("documentos/Certidao_Ana.jpg", persistido.getCaminhoStorage());
		assertEquals("image/jpeg", persistido.getContentType());
		assertNull(persistido.getTamanhoBytes());
		assertNull(persistido.getDescricao());
		assertNotNull(persistido.getDataUpload());
	}

	@Test
	void allowsUpdatingDocumentoFields() {
		Documento documento = new Documento(
			"RG",
			"RG_Antigo.pdf",
			"documentos/RG_Antigo.pdf",
			"application/pdf",
			512L
		);

		entityManager.persist(documento);
		entityManager.flush();

		Long documentoId = documento.getId();

		documento.setTipoDocumento("COMPROVANTE DE RESIDÊNCIA");
		documento.setNomeDocumento("Comprovante_Atualizado.pdf");
		documento.setCaminhoStorage("documentos/Comprovante_Atualizado.pdf");
		documento.setContentType("application/pdf");
		documento.setTamanhoBytes(4096L);
		documento.setDescricao("Comprovante atualizado");
		documento.setDataUpload(LocalDateTime.of(2026, 11, 21, 10, 30));

		entityManager.flush();
		entityManager.clear();

		Documento persistido = entityManager.find(Documento.class, documentoId);

		assertNotNull(persistido);
		assertEquals("COMPROVANTE DE RESIDÊNCIA", persistido.getTipoDocumento());
		assertEquals("Comprovante_Atualizado.pdf", persistido.getNomeDocumento());
		assertEquals("documentos/Comprovante_Atualizado.pdf", persistido.getCaminhoStorage());
		assertEquals("application/pdf", persistido.getContentType());
		assertEquals(4096L, persistido.getTamanhoBytes());
		assertEquals("Comprovante atualizado", persistido.getDescricao());
		assertEquals(LocalDateTime.of(2026, 11, 21, 10, 30), persistido.getDataUpload());
	}

	@Test
	void removesPersistedDocumento() {
		Documento documento = new Documento(
			"RG",
			"RG_Removido.pdf",
			"documentos/RG_Removido.pdf",
			"application/pdf"
		);

		entityManager.persist(documento);
		entityManager.flush();

		Long documentoId = documento.getId();

		entityManager.remove(documento);
		entityManager.flush();
		entityManager.clear();

		assertNull(entityManager.find(Documento.class, documentoId));
	}
}
