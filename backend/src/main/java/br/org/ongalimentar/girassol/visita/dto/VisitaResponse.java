package br.org.ongalimentar.girassol.visita.dto;

import java.time.LocalDate;

import br.org.ongalimentar.girassol.visita.Situacao;
import br.org.ongalimentar.girassol.visita.Turno;
import br.org.ongalimentar.girassol.visita.Visita;

public record VisitaResponse(
		Long id,
		LocalDate data,
		Turno turno,
		String nome,
		Integer idade,
		String contato,
		Situacao situacao,
		String motivoDaProcura,
		Boolean pedidoAtendido,
		String observacoes) {

	public static VisitaResponse from(Visita visita) {
		return new VisitaResponse(
				visita.getId(), visita.getData(), visita.getTurno(), visita.getNome(),
				visita.getIdade(), visita.getContato(), visita.getSituacao(),
				visita.getMotivoDaProcura(), visita.getPedidoAtendido(), visita.getObservacoes());
	}
}
