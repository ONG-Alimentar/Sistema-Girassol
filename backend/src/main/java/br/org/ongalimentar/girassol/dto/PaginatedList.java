
package br.org.ongalimentar.girassol.dto;

import java.util.List;

import org.springframework.data.domain.Page;

public record PaginatedList<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext
) {

    public static <T> PaginatedList<T> from(Page<T> page) {
        return new PaginatedList<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.hasNext()
        );
    }
}
