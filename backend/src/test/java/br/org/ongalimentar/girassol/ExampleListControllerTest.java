
package br.org.ongalimentar.girassol;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ExampleListControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(new ExampleListController())
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
            .andExpect(jsonPath("$.hasNext").value(true));
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
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectUnsupportedSortField() throws Exception {
        mockMvc.perform(get("/api/examples/listagem")
                .param("sort", "unknown,asc"))
            .andExpect(status().isBadRequest());
    }
}
