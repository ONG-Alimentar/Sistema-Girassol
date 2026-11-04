package br.org.ongalimentar.girassol;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.org.ongalimentar.girassol.dto.ExampleListItem;
import br.org.ongalimentar.girassol.dto.PaginatedList;

@RestController
@RequestMapping("/api/examples/listagem")
public class ExampleListController {

    private static final List<ExampleListItem> ITEMS = List.of(
        new ExampleListItem(1L, "Registro Alfa", "Categoria A", LocalDate.of(2026, 1, 10)),
        new ExampleListItem(2L, "Registro Beta", "Categoria B", LocalDate.of(2026, 2, 15)),
        new ExampleListItem(3L, "Registro Gama", "Categoria A", LocalDate.of(2026, 3, 20)),
        new ExampleListItem(4L, "Registro Delta", "Categoria C", LocalDate.of(2026, 4, 5)),
        new ExampleListItem(5L, "Registro Épsilon", "Categoria B", LocalDate.of(2026, 5, 12)),
        new ExampleListItem(6L, "Registro Zeta", "Categoria A", LocalDate.of(2026, 6, 18)),
        new ExampleListItem(7L, "Registro Eta", "Categoria C", LocalDate.of(2026, 7, 22)),
        new ExampleListItem(8L, "Registro Teta", "Categoria B", LocalDate.of(2026, 8, 30))
    );

    @GetMapping
    public PaginatedList<ExampleListItem> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate,
        Pageable pageable
    ) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A data inicial não pode ser posterior à data final."
            );
        }

        List<ExampleListItem> filtered = ITEMS.stream()
            .filter(item -> search == null
                || search.isBlank()
                || item.name().toLowerCase().contains(search.toLowerCase()))
            .filter(item -> startDate == null || !item.date().isBefore(startDate))
            .filter(item -> endDate == null || !item.date().isAfter(endDate))
            .sorted(buildComparator(pageable.getSort()))
            .toList();

        int pageSize = pageable.getPageSize();
        long offset = pageable.getOffset();

        int start = (int) Math.min(offset, filtered.size());
        int end = Math.min(start + pageSize, filtered.size());

        Page<ExampleListItem> page = new PageImpl<>(
            filtered.subList(start, end),
            pageable,
            filtered.size()
        );

        return PaginatedList.from(page);
    }

    private Comparator<ExampleListItem> buildComparator(Sort sort) {
        Comparator<ExampleListItem> comparator = null;

        for (Sort.Order order : sort) {
            Comparator<ExampleListItem> next = switch (order.getProperty()) {
                case "id" -> Comparator.comparing(ExampleListItem::id);
                case "name" -> Comparator.comparing(
                    ExampleListItem::name,
                    String.CASE_INSENSITIVE_ORDER
                );
                case "category" -> Comparator.comparing(
                    ExampleListItem::category,
                    String.CASE_INSENSITIVE_ORDER
                );
                case "date" -> Comparator.comparing(ExampleListItem::date);
                default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Campo de ordenação não permitido: " + order.getProperty()
                );
            };

            if (order.isDescending()) {
                next = next.reversed();
            }

            comparator = comparator == null
                ? next
                : comparator.thenComparing(next);
        }

        return comparator != null
            ? comparator
            : Comparator.comparing(ExampleListItem::id);
    }
}