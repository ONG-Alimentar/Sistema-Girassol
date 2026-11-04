
package br.org.ongalimentar.girassol.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PaginatedListTest {

    @Test
    void shouldConvertPageToPaginatedList() {
        List<String> content = List.of("Família A", "Família B");

        Page<String> page = new PageImpl<>(
            content,
            PageRequest.of(1, 2),
            5
        );

        PaginatedList<String> result = PaginatedList.from(page);

        assertEquals(content, result.content());
        assertEquals(1, result.page());
        assertEquals(2, result.size());
        assertEquals(5, result.totalElements());
        assertEquals(3, result.totalPages());
        assertTrue(result.hasNext());
    }

    @Test
    void shouldConvertEmptyPage() {
        Page<String> page = new PageImpl<>(
            List.of(),
            PageRequest.of(0, 10),
            0
        );

        PaginatedList<String> result = PaginatedList.from(page);

        assertTrue(result.content().isEmpty());
        assertEquals(0, result.page());
        assertEquals(10, result.size());
        assertEquals(0, result.totalElements());
        assertEquals(0, result.totalPages());
        assertFalse(result.hasNext());
    }

    @Test
    void shouldIdentifyLastPage() {
        Page<String> page = new PageImpl<>(
            List.of("Família A", "Família B"),
            PageRequest.of(4, 10),
            42
        );

        PaginatedList<String> result = PaginatedList.from(page);

        assertEquals(4, result.page());
        assertEquals(10, result.size());
        assertEquals(42, result.totalElements());
        assertEquals(5, result.totalPages());
        assertFalse(result.hasNext());
    }
}
