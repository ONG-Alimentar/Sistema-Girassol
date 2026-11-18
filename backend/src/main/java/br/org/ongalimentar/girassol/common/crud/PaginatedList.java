package br.org.ongalimentar.girassol.common.crud;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

public record PaginatedList<T>(
		List<T> content,
		int page,
		int size,
		long totalElements,
		int totalPages,
		boolean first,
		boolean last,
		String sort) {

	public static <E, D> PaginatedList<D> from(Page<E> page, Function<E, D> mapper) {
		List<D> content = page.getContent().stream().map(mapper).toList();
		return new PaginatedList<>(
				content,
				page.getNumber(),
				page.getSize(),
				page.getTotalElements(),
				page.getTotalPages(),
				page.isFirst(),
				page.isLast(),
				page.getSort().toString());
	}
}
