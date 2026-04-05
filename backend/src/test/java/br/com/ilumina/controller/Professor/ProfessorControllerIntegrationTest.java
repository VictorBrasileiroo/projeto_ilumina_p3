package br.com.ilumina.controller.Professor;

import br.com.ilumina.dto.professor.CreateProfessorRequest;
import br.com.ilumina.dto.professor.UpdateProfessorRequest;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.User.RoleRepository;
import br.com.ilumina.repository.User.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProfessorControllerIntegrationTest {

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void cleanup() {
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createProfessorWithoutAuthenticationShouldReturnCreated() throws Exception {
        CreateProfessorRequest request = new CreateProfessorRequest(
                "Professor Um",
                "prof.um@ilumina.com",
                "123456",
                "Matemática",
                "Masculino"
        );

        mockMvc.perform(post("/api/v1/professor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("prof.um@ilumina.com"))
                .andExpect(jsonPath("$.data.disciplina").value("Matemática"));

        assertThat(userRepository.existsByEmail("prof.um@ilumina.com")).isTrue();
        assertThat(professorRepository.findByUserActiveTrueOrderByCreatedAtDesc()).hasSize(1);
    }

    @Test
    void createProfessorWithDuplicateEmailShouldReturnConflict() throws Exception {
        createProfessorViaApi("Professor Um", "duplicado@ilumina.com", "123456", "História", "Feminino");

        CreateProfessorRequest duplicate = new CreateProfessorRequest(
                "Professor Dois",
                "duplicado@ilumina.com",
                "123456",
                "Física",
                "Feminino"
        );

        mockMvc.perform(post("/api/v1/professor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
        void createProfessorWithProfessorRoleShouldReturnCreated() throws Exception {
        CreateProfessorRequest request = new CreateProfessorRequest(
                "Professor Sem Permissão",
                "sem.permissao@ilumina.com",
                "123456",
                "Química",
                "Feminino"
        );

        mockMvc.perform(post("/api/v1/professor")
                        .with(user("prof@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void getProfessorByIdAsOwnerShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly("Professor Dono", "dono@ilumina.com", "Arte", "Feminino", true);

        mockMvc.perform(get("/api/v1/professor/{id}", professor.getId())
                        .with(user("dono@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("dono@ilumina.com"));
    }

    @Test
    void updateAnotherProfessorAsProfessorShouldReturnForbidden() throws Exception {
        createProfessorDirectly("Professor Dono", "dono@ilumina.com", "Biologia", "Masculino", true);
        Professor target = createProfessorDirectly("Professor Alvo", "alvo@ilumina.com", "Geografia", "Feminino", true);

        UpdateProfessorRequest updateRequest = new UpdateProfessorRequest(
                null,
                null,
                "Educação Física",
                null
        );

        mockMvc.perform(put("/api/v1/professor/{id}", target.getId())
                        .with(user("dono@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listProfessorsShouldReturnOnlyActiveByDefault() throws Exception {
        createProfessorDirectly("Professor Ativo", "ativo@ilumina.com", "Música", "Masculino", true);
        createProfessorDirectly("Professor Inativo", "inativo@ilumina.com", "Língua Portuguesa", "Feminino", false);

        mockMvc.perform(get("/api/v1/professor")
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/professor")
                        .with(user("admin@ilumina.com").roles("ADMIN"))
                        .param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void deactivateProfessorShouldBlockFutureLogin() throws Exception {
        UUID professorId = createProfessorViaApi(
                "Professor Login",
                "login.professor@ilumina.com",
                "123456",
                "Filosofia",
                "Masculino"
        );

        mockMvc.perform(patch("/api/v1/professor/{id}/deactivate", professorId)
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login.professor@ilumina.com\",\"password\":\"123456\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deactivateAlreadyInactiveProfessorShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly("Professor Inativo", "inativo2@ilumina.com", "Física", "Masculino", false);

        mockMvc.perform(patch("/api/v1/professor/{id}/deactivate", professor.getId())
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getProfessorByInvalidIdShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/professor/{id}", UUID.randomUUID())
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isNotFound());
    }

    @Test
    void createProfessorWithoutDisciplinaShouldReturnBadRequest() throws Exception {
        CreateProfessorRequest invalidRequest = new CreateProfessorRequest(
                "Professor Inválido",
                "invalido@ilumina.com",
                "123456",
                "",
                "Masculino"
        );

        mockMvc.perform(post("/api/v1/professor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    private UUID createProfessorViaApi(
            String name,
            String email,
            String password,
            String disciplina,
            String sexo
    ) throws Exception {
        CreateProfessorRequest request = new CreateProfessorRequest(name, email, password, disciplina, sexo);

        MvcResult result = mockMvc.perform(post("/api/v1/professor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return UUID.fromString(root.path("data").path("id").asText());
    }

    private Professor createProfessorDirectly(
            String name,
            String email,
            String disciplina,
            String sexo,
            boolean active
    ) {
        UserRole roleProfessor = roleRepository.findUserRoleByName("ROLE_PROFESSOR")
                .orElseThrow(() -> new IllegalStateException("ROLE_PROFESSOR não encontrada para teste."));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setActive(active);
        user.setRoles(Set.of(roleProfessor));

        User savedUser = userRepository.save(user);

        Professor professor = new Professor();
        professor.setUser(savedUser);
        professor.setDisciplina(disciplina);
        professor.setSexo(sexo);

        return professorRepository.save(professor);
    }
}
