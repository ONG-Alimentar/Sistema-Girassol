package br.org.ongalimentar.girassol.example;

import java.time.LocalDate;

public record ExampleListItem(
	Long id,
	String name,
	String category,
	LocalDate date
) {
}
