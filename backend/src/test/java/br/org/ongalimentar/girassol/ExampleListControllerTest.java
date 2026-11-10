package br.org.ongalimentar.girassol;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;

import br.org.ongalimentar.girassol.common.error.GlobalExceptionHandler;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ExampleListControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(new ExampleListController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .setCustomArgumentResolvers(
                new PageableHandlerMethodArgumentResolver()
            )
            .build();
    }

    @Test
    void shouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("page", "0")
                .param("size", "3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(3))
            .andExpect(jsonPath("$.totalElements").value(8))
            .andExpect(jsonPath("$.totalPages").value(3))
            .andExpect(jsonPath("$.first").value(true))
            .andExpect(jsonPath("$.last").value(false))
            .andExpect(jsonPath("$.sort").value("UNSORTED"))
            .andExpect(jsonPath("$.hasNext").doesNotExist());
    }

    @Test
    void shouldFilterByName() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("search", "Beta"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].name").value("Registro Beta"));
    }

    @Test
    void shouldFilterByDateRange() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("startDate", "2026-03-01")
                .param("endDate", "2026-04-30"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.content[0].name").value("Registro Gama"))
            .andExpect(jsonPath("$.content[1].name").value("Registro Delta"));
    }

    @Test
    void shouldSortByDateDescending() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("sort", "date,desc"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].name").value("Registro Teta"));
    }

    @Test
    void shouldRejectInvalidDateRange() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("startDate", "2026-05-01")
                .param("endDate", "2026-04-01"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void shouldRejectUnsupportedSortField() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("sort", "unknown,asc"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void shouldReturnLastPage() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("page", "1")
                .param("size", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.content[0].id").value(6))
            .andExpect(jsonPath("$.page").value(1))
            .andExpect(jsonPath("$.totalElements").value(8))
            .andExpect(jsonPath("$.first").value(false))
            .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void shouldReturnEmptyPageForUnmatchedFilter() throws Exception {
        mockMvc.perform(get("/api/examples/listagem").param("search", "inexistente"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(0))
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.totalPages").value(0))
            .andExpect(jsonPath("$.first").value(true))
            .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void shouldFilterAndSortBeforePaginating() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("startDate", "2026-03-01")
                .param("endDate", "2026-08-30")
                .param("sort", "date,desc")
                .param("page", "1")
                .param("size", "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].id").value(6))
            .andExpect(jsonPath("$.content[1].id").value(5))
            .andExpect(jsonPath("$.totalElements").value(6))
            .andExpect(jsonPath("$.totalPages").value(3))
            .andExpect(jsonPath("$.sort").value("date: DESC"));
    }
}
