package br.org.ongalimentar.girassol.common.crud;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.function.Function;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

class PaginatedListTest {

    @Test
    void shouldConvertPageToPaginatedList() {
        List<String> content = List.of("Família A", "Família B");

        Page<String> page = new PageImpl<>(
            content,
            PageRequest.of(1, 2),
            5
        );

        PaginatedList<String> result = PaginatedList.from(page, Function.identity());

        assertEquals(content, result.content());
        assertEquals(1, result.page());
        assertEquals(2, result.size());
        assertEquals(5, result.totalElements());
        assertEquals(3, result.totalPages());
        assertFalse(result.first());
        assertFalse(result.last());
    }

    @Test
    void shouldConvertEmptyPage() {
        Page<String> page = new PageImpl<>(
            List.of(),
            PageRequest.of(0, 10),
            0
        );

        PaginatedList<String> result = PaginatedList.from(page, Function.identity());

        assertTrue(result.content().isEmpty());
        assertTrue(result.first());
        assertEquals("UNSORTED", result.sort());
        assertEquals(0, result.page());
        assertEquals(10, result.size());
        assertEquals(0, result.totalElements());
        assertEquals(0, result.totalPages());
        assertTrue(result.last());
    }

    @Test
    void shouldIdentifyLastPage() {
        Page<String> page = new PageImpl<>(
            List.of("Família A", "Família B"),
            PageRequest.of(4, 10),
            42
        );

        PaginatedList<String> result = PaginatedList.from(page, Function.identity());

        assertEquals(4, result.page());
        assertEquals(10, result.size());
        assertEquals(42, result.totalElements());
        assertEquals(5, result.totalPages());
        assertTrue(result.last());
    }

    @Test
    void shouldMapContentAndPreserveSort() {
        Page<Integer> page = new PageImpl<>(
            List.of(1, 2),
            PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "id")),
            3
        );

        PaginatedList<String> result = PaginatedList.from(page, value -> "Item " + value);

        assertEquals(List.of("Item 1", "Item 2"), result.content());
        assertEquals("id: DESC", result.sort());
        assertTrue(result.first());
        assertFalse(result.last());
        assertEquals(3, result.totalElements());
    }
}
