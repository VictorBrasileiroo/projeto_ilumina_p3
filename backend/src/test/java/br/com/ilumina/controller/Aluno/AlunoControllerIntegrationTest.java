package br.com.ilumina.controller.Aluno;

import br.com.ilumina.dto.aluno.CreateAlunoRequest;
import br.com.ilumina.dto.aluno.UpdateAlunoRequest;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Turma.AlunoTurma;
import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.Turma.Turno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
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

import java.nio.charset.StandardCharsets;
import java.util.Base64;
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
class AlunoControllerIntegrationTest {

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private AlunoTurmaRepository alunoTurmaRepository;

    @Autowired
    private TurmaRepository turmaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void cleanup() {
        alunoTurmaRepository.deleteAll();
        turmaRepository.deleteAll();
        alunoRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createAlunoWithoutAuthenticationShouldReturnCreated() throws Exception {
        CreateAlunoRequest request = new CreateAlunoRequest(
                "Aluno Um",
                "aluno.um@ilumina.com",
                "123456",
                "MAT-001",
                "Feminino"
        );

        mockMvc.perform(post("/api/v1/aluno")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("aluno.um@ilumina.com"))
                .andExpect(jsonPath("$.data.matricula").value("MAT-001"))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.type").value("Bearer"));

        assertThat(userRepository.existsByEmail("aluno.um@ilumina.com")).isTrue();
        assertThat(alunoRepository.findByUserActiveTrueOrderByCreatedAtDesc()).hasSize(1);
    }

    @Test
    void createAlunoTokenShouldContainExpectedClaims() throws Exception {
        CreateAlunoRequest request = new CreateAlunoRequest(
                "Aluno Claims",
                "claims.aluno@ilumina.com",
                "123456",
                "MAT-CLAIMS",
                "Masculino"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/aluno")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        String alunoId = root.path("data").path("id").asText();
        String userId = root.path("data").path("userId").asText();
        String token = root.path("data").path("token").asText();

        JsonNode payload = decodeJwtPayload(token);

        assertThat(payload.path("userId").asText()).isEqualTo(userId);
        assertThat(payload.path("alunoId").asText()).isEqualTo(alunoId);
        assertThat(payload.path("professorId").isMissingNode()).isTrue();
        assertThat(payload.path("roles").isArray()).isTrue();
        assertThat(payload.path("roles").toString()).contains("ROLE_ALUNO");
    }

    @Test
    void createAlunoWithDuplicateEmailShouldReturnConflict() throws Exception {
        createAlunoViaApi("Aluno Um", "duplicado.aluno@ilumina.com", "123456", "MAT-DUP-1", "Feminino");

        CreateAlunoRequest duplicate = new CreateAlunoRequest(
                "Aluno Dois",
                "duplicado.aluno@ilumina.com",
                "123456",
                "MAT-DUP-2",
                "Masculino"
        );

        mockMvc.perform(post("/api/v1/aluno")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void createAlunoWithDuplicateMatriculaShouldRollbackUserCreation() throws Exception {
        createAlunoViaApi("Aluno Base", "base.rollback@ilumina.com", "123456", "MAT-ROLL", "Feminino");

        CreateAlunoRequest duplicate = new CreateAlunoRequest(
                "Aluno Rollback",
                "rollback@ilumina.com",
                "123456",
                "MAT-ROLL",
                "Masculino"
        );

        mockMvc.perform(post("/api/v1/aluno")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));

        assertThat(userRepository.existsByEmail("rollback@ilumina.com")).isFalse();
    }

    @Test
    void getAlunoByIdAsOwnerShouldReturnOk() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Dono", "dono.aluno@ilumina.com", "MAT-DONO", "Feminino", true);

        mockMvc.perform(get("/api/v1/aluno/{id}", aluno.getId())
                        .with(user("dono.aluno@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("dono.aluno@ilumina.com"));
    }

    @Test
    void updateAnotherAlunoAsAlunoShouldReturnForbidden() throws Exception {
        createAlunoDirectly("Aluno Dono", "dono.update@ilumina.com", "MAT-OWNER", "Masculino", true);
        Aluno target = createAlunoDirectly("Aluno Alvo", "alvo.update@ilumina.com", "MAT-TARGET", "Feminino", true);

        UpdateAlunoRequest updateRequest = new UpdateAlunoRequest(
                null,
                "MAT-UPDATED",
                null
        );

        mockMvc.perform(put("/api/v1/aluno/{id}", target.getId())
                        .with(user("dono.update@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listAlunosShouldReturnOnlyActiveByDefault() throws Exception {
        createAlunoDirectly("Aluno Ativo", "ativo.aluno@ilumina.com", "MAT-ATIVO", "Masculino", true);
        createAlunoDirectly("Aluno Inativo", "inativo.aluno@ilumina.com", "MAT-INATIVO", "Feminino", false);

        mockMvc.perform(get("/api/v1/aluno")
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/aluno")
                        .with(user("admin@ilumina.com").roles("ADMIN"))
                        .param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void deactivateAlunoShouldBlockFutureLogin() throws Exception {
        UUID alunoId = createAlunoViaApi(
                "Aluno Login",
                "login.aluno@ilumina.com",
                "123456",
                "MAT-LOGIN",
                "Masculino"
        );

        mockMvc.perform(patch("/api/v1/aluno/{id}/deactivate", alunoId)
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login.aluno@ilumina.com\",\"password\":\"123456\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithCreatedAlunoCredentialsShouldReturnOk() throws Exception {
        createAlunoViaApi(
                "Aluno Login",
                "aluno.login@ilumina.com",
                "123456",
                "MAT-LOGIN-2",
                "Feminino"
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"aluno.login@ilumina.com\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("aluno.login@ilumina.com"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.userId").isNotEmpty())
                .andExpect(jsonPath("$.alunoId").isNotEmpty())
                .andExpect(jsonPath("$.roles[0]").value("ROLE_ALUNO"));
    }

    @Test
    void refreshTokenForAlunoShouldReturnAlunoId() throws Exception {
        createAlunoViaApi(
                "Aluno Refresh",
                "refresh.aluno@ilumina.com",
                "123456",
                "MAT-REFRESH",
                "Feminino"
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"refresh.aluno@ilumina.com\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginRoot = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = loginRoot.path("refreshToken").asText();

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("refresh.aluno@ilumina.com"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.alunoId").isNotEmpty())
                .andExpect(jsonPath("$.roles[0]").value("ROLE_ALUNO"));
    }

    @Test
    void findTurmasByAlunoAfterSelfEnrollmentShouldReturnTurma() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno E2E", "e2e.aluno@ilumina.com", "MAT-E2E", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma E2E", 3, Turno.MATUTINO, Ensino.FUNDAMENTAL, 32, true);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("e2e.aluno@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + aluno.getId() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/aluno/{id}/turmas", aluno.getId())
                        .with(user("e2e.aluno@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(turma.getId().toString()));
    }

    @Test
    void findTurmasByAlunoAsOwnerShouldRespectIncludeInactive() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Turmas", "aluno.turmas@ilumina.com", "MAT-TURMAS", "Feminino", true);
        Turma ativa = createTurmaDirectly("T-Ativa", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        Turma inativa = createTurmaDirectly("T-Inativa", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 18, false);
        linkAlunoTurma(aluno, ativa);
        linkAlunoTurma(aluno, inativa);

        mockMvc.perform(get("/api/v1/aluno/{id}/turmas", aluno.getId())
                        .with(user("aluno.turmas@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/aluno/{id}/turmas", aluno.getId())
                        .with(user("aluno.turmas@ilumina.com").roles("ALUNO"))
                        .param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void findTurmasByAnotherAlunoShouldReturnForbidden() throws Exception {
        Aluno owner = createAlunoDirectly("Aluno Owner", "owner.turmas@ilumina.com", "MAT-OWNER-T", "Feminino", true);
        createAlunoDirectly("Aluno Outro", "outro.turmas@ilumina.com", "MAT-OUTRO-T", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma A", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        linkAlunoTurma(owner, turma);

        mockMvc.perform(get("/api/v1/aluno/{id}/turmas", owner.getId())
                        .with(user("outro.turmas@ilumina.com").roles("ALUNO")))
                .andExpect(status().isForbidden());
    }

    @Test
    void createAlunoWithoutMatriculaShouldReturnBadRequest() throws Exception {
        CreateAlunoRequest invalidRequest = new CreateAlunoRequest(
                "Aluno Inválido",
                "invalido.aluno@ilumina.com",
                "123456",
                "",
                "Masculino"
        );

        mockMvc.perform(post("/api/v1/aluno")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    private UUID createAlunoViaApi(
            String name,
            String email,
            String password,
            String matricula,
            String sexo
    ) throws Exception {
        CreateAlunoRequest request = new CreateAlunoRequest(name, email, password, matricula, sexo);

        MvcResult result = mockMvc.perform(post("/api/v1/aluno")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return UUID.fromString(root.path("data").path("id").asText());
    }

    private JsonNode decodeJwtPayload(String token) throws Exception {
        String[] chunks = token.split("\\.");
        String payloadJson = new String(Base64.getUrlDecoder().decode(chunks[1]), StandardCharsets.UTF_8);
        return objectMapper.readTree(payloadJson);
    }

    private Aluno createAlunoDirectly(
            String name,
            String email,
            String matricula,
            String sexo,
            boolean active
    ) {
        UserRole roleAluno = roleRepository.findUserRoleByName("ROLE_ALUNO")
                .orElseThrow(() -> new IllegalStateException("ROLE_ALUNO não encontrada para teste."));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setActive(active);
        user.setRoles(Set.of(roleAluno));

        User savedUser = userRepository.save(user);

        Aluno aluno = new Aluno();
        aluno.setUser(savedUser);
        aluno.setMatricula(matricula);
        aluno.setSexo(sexo);

        return alunoRepository.save(aluno);
    }

    private Turma createTurmaDirectly(
            String nome,
            int ano,
            Turno turno,
            Ensino ensino,
            int qntAlunos,
            boolean active
    ) {
        Turma turma = new Turma();
        turma.setNome(nome);
        turma.setAno(ano);
        turma.setTurno(turno);
        turma.setEnsino(ensino);
        turma.setQntAlunos(qntAlunos);
        turma.setActive(active);

        return turmaRepository.save(turma);
    }

    private void linkAlunoTurma(Aluno aluno, Turma turma) {
        AlunoTurma alunoTurma = new AlunoTurma();
        alunoTurma.setAluno(aluno);
        alunoTurma.setTurma(turma);
        alunoTurmaRepository.save(alunoTurma);
    }
}
