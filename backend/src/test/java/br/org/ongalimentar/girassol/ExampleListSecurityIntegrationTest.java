package br.org.ongalimentar.girassol;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/** Integra o endpoint de exemplo com a configuração de segurança existente. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class ExampleListSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(springSecurity()).build();
    }

    @Test
    void shouldRequireAuthentication() throws Exception {
        mvc.perform(get("/api/examples/listagem"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void shouldReturnSharedContractForAuthenticatedUser() throws Exception {
        mvc.perform(get("/api/examples/listagem")
                .param("page", "0")
                .param("size", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(5))
            .andExpect(jsonPath("$.totalElements").value(8))
            .andExpect(jsonPath("$.first").value(true))
            .andExpect(jsonPath("$.last").value(false))
            .andExpect(jsonPath("$.sort").value("UNSORTED"))
            .andExpect(jsonPath("$.hasNext").doesNotExist());
    }
}
