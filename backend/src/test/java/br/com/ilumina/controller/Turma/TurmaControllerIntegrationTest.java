package br.com.ilumina.controller.Turma;

import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Turma.AlunoTurma;
import br.com.ilumina.dto.turma.CreateTurmaRequest;
import br.com.ilumina.dto.turma.UpdateTurmaRequest;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.ProfTurma;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.Turma.Turno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Turma.ProfTurmaRepository;
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

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TurmaControllerIntegrationTest {

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TurmaRepository turmaRepository;

    @Autowired
        private AlunoTurmaRepository alunoTurmaRepository;

        @Autowired
    private ProfTurmaRepository profTurmaRepository;

    @Autowired
        private AlunoRepository alunoRepository;

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
        alunoTurmaRepository.deleteAll();
        profTurmaRepository.deleteAll();
        turmaRepository.deleteAll();
        alunoRepository.deleteAll();
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createTurmaWithoutAuthenticationShouldReturnUnauthorized() throws Exception {
        CreateTurmaRequest request = new CreateTurmaRequest(
                "1A",
                1,
                Turno.MATUTINO,
                Ensino.FUNDAMENTAL,
                30
        );

        mockMvc.perform(post("/api/v1/turmas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createTurmaAsProfessorShouldReturnCreatedAndAutoLink() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Criador",
                "criador@ilumina.com",
                "Matemática",
                "Masculino",
                true
        );

        CreateTurmaRequest request = new CreateTurmaRequest(
                "1A",
                1,
                Turno.MATUTINO,
                Ensino.FUNDAMENTAL,
                30
        );

        MvcResult result = mockMvc.perform(post("/api/v1/turmas")
                        .with(user("criador@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nome").value("1A"))
                .andExpect(jsonPath("$.data.active").value(true))
                .andExpect(jsonPath("$.data.professores.length()").value(1))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        UUID turmaId = UUID.fromString(root.path("data").path("id").asText());

        assertThat(profTurmaRepository.existsByProfessor_IdAndTurma_Id(professor.getId(), turmaId)).isTrue();
    }

    @Test
    void createTurmaAsAdminShouldReturnCreated() throws Exception {
        CreateTurmaRequest request = new CreateTurmaRequest(
                "2B",
                2,
                Turno.VESPERTINO,
                Ensino.FUNDAMENTAL,
                25
        );

        mockMvc.perform(post("/api/v1/turmas")
                        .with(user("admin@ilumina.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nome").value("2B"));
    }

    @Test
    void listTurmasShouldReturnOnlyActiveByDefaultForAdmin() throws Exception {
        createTurmaDirectly("Ativa", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        createTurmaDirectly("Inativa", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 18, false);

        mockMvc.perform(get("/api/v1/turmas")
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

        @Test
        void listTurmasShouldReturnOnlyActiveByDefaultForAluno() throws Exception {
                createTurmaDirectly("Ativa", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
                createTurmaDirectly("Inativa", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 18, false);

                mockMvc.perform(get("/api/v1/turmas")
                                                .with(user("aluno.lista@ilumina.com").roles("ALUNO")))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(1));
        }

        @Test
        void listTurmasIncludeInactiveShouldReturnAllForAluno() throws Exception {
                createTurmaDirectly("Ativa", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
                createTurmaDirectly("Inativa", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 18, false);

                mockMvc.perform(get("/api/v1/turmas")
                                                .with(user("aluno.lista@ilumina.com").roles("ALUNO"))
                                                .param("includeInactive", "true"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(2));
        }

    @Test
    void listTurmasIncludeInactiveShouldReturnAllForProfessor() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Lista",
                "lista@ilumina.com",
                "História",
                "Feminino",
                true
        );

        Turma ativa = createTurmaDirectly("Ativa", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        Turma inativa = createTurmaDirectly("Inativa", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 18, false);
        linkProfessorTurma(professor, ativa);
        linkProfessorTurma(professor, inativa);

        mockMvc.perform(get("/api/v1/turmas")
                        .with(user("lista@ilumina.com").roles("PROFESSOR"))
                        .param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void listTurmasAsProfessorShouldReturnOnlyLinkedTurmas() throws Exception {
        Professor linkedProfessor = createProfessorDirectly(
                "Professor Vinculado",
                "linked@ilumina.com",
                "Matemática",
                "Masculino",
                true
        );

        Turma turmaVinculada = createTurmaDirectly("Linked", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        Turma turmaNaoVinculada = createTurmaDirectly("Unlinked", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 20, true);

        linkProfessorTurma(linkedProfessor, turmaVinculada);
        createProfessorDirectly("Outro Professor", "outro.lista@ilumina.com", "Física", "Feminino", true);

        mockMvc.perform(get("/api/v1/turmas")
                        .with(user("linked@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(turmaVinculada.getId().toString()));

        assertThat(turmaNaoVinculada.getId()).isNotEqualTo(turmaVinculada.getId());
    }

    @Test
    void getTurmaByIdAsLinkedProfessorShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Dono",
                "dono.turma@ilumina.com",
                "Geografia",
                "Masculino",
                true
        );
        Turma turma = createTurmaDirectly("3C", 3, Turno.NOTURNO, Ensino.MEDIO, 22, true);
        linkProfessorTurma(professor, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}", turma.getId())
                        .with(user("dono.turma@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nome").value("3C"));
    }

    @Test
    void getTurmaByIdAsUnlinkedProfessorShouldReturnForbidden() throws Exception {
        Professor owner = createProfessorDirectly(
                "Professor Owner",
                "owner@ilumina.com",
                "Biologia",
                "Feminino",
                true
        );
        createProfessorDirectly("Professor Outro", "outro@ilumina.com", "Artes", "Masculino", true);

        Turma turma = createTurmaDirectly("4D", 4, Turno.MATUTINO, Ensino.FUNDAMENTAL, 28, true);
        linkProfessorTurma(owner, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}", turma.getId())
                        .with(user("outro@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateTurmaAsLinkedProfessorShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Update",
                "update@ilumina.com",
                "Física",
                "Masculino",
                true
        );
        Turma turma = createTurmaDirectly("5E", 5, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(professor, turma);

        UpdateTurmaRequest request = new UpdateTurmaRequest(
                "5E - Atualizada",
                6,
                Turno.VESPERTINO,
                Ensino.MEDIO,
                35
        );

        mockMvc.perform(put("/api/v1/turmas/{id}", turma.getId())
                        .with(user("update@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nome").value("5E - Atualizada"))
                .andExpect(jsonPath("$.data.ano").value(6))
                .andExpect(jsonPath("$.data.turno").value("VESPERTINO"))
                .andExpect(jsonPath("$.data.ensino").value("MEDIO"))
                .andExpect(jsonPath("$.data.qntAlunos").value(35));
    }

    @Test
    void updateInactiveTurmaShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Update Inativa",
                "update.inativa@ilumina.com",
                "Biologia",
                "Feminino",
                true
        );
        Turma turma = createTurmaDirectly("Inativa Update", 5, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, false);
        linkProfessorTurma(professor, turma);

        UpdateTurmaRequest request = new UpdateTurmaRequest(
                "Nome Novo",
                null,
                null,
                null,
                null
        );

        mockMvc.perform(put("/api/v1/turmas/{id}", turma.getId())
                        .with(user("update.inativa@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void updateTurmaWithEmptyBodyShouldKeepValues() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Empty",
                "empty@ilumina.com",
                "Química",
                "Feminino",
                true
        );
        Turma turma = createTurmaDirectly("6F", 6, Turno.MATUTINO, Ensino.FUNDAMENTAL, 21, true);
        linkProfessorTurma(professor, turma);

        mockMvc.perform(put("/api/v1/turmas/{id}", turma.getId())
                        .with(user("empty@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nome").value("6F"))
                .andExpect(jsonPath("$.data.ano").value(6));
    }

    @Test
    void deactivateTurmaAsLinkedProfessorShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Deactivate",
                "deactivate@ilumina.com",
                "Inglês",
                "Masculino",
                true
        );
        Turma turma = createTurmaDirectly("7G", 7, Turno.NOTURNO, Ensino.MEDIO, 19, true);
        linkProfessorTurma(professor, turma);

        mockMvc.perform(patch("/api/v1/turmas/{id}/deactivate", turma.getId())
                        .with(user("deactivate@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    void deactivateAlreadyInactiveTurmaShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Inativa",
                "inativa@ilumina.com",
                "Português",
                "Feminino",
                true
        );
        Turma turma = createTurmaDirectly("8H", 8, Turno.VESPERTINO, Ensino.MEDIO, 16, false);
        linkProfessorTurma(professor, turma);

        mockMvc.perform(patch("/api/v1/turmas/{id}/deactivate", turma.getId())
                        .with(user("inativa@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void joinTurmaShouldCreateLink() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Join",
                "join@ilumina.com",
                "Matemática",
                "Masculino",
                true
        );
        Turma turma = createTurmaDirectly("9I", 9, Turno.MATUTINO, Ensino.MEDIO, 15, true);

        mockMvc.perform(post("/api/v1/turmas/{id}/join", turma.getId())
                        .with(user("join@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"professorId\":\"" + professor.getId() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.professores.length()").value(1));

        assertThat(profTurmaRepository.existsByProfessor_IdAndTurma_Id(professor.getId(), turma.getId())).isTrue();
    }

    @Test
    void joinTurmaWithDifferentAuthenticatedProfessorShouldReturnForbidden() throws Exception {
        createProfessorDirectly("Professor A", "prof.a@ilumina.com", "Mat", "Masculino", true);
        Professor professorB = createProfessorDirectly("Professor B", "prof.b@ilumina.com", "Bio", "Feminino", true);
        Turma turma = createTurmaDirectly("1X", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);

        mockMvc.perform(post("/api/v1/turmas/{id}/join", turma.getId())
                        .with(user("prof.a@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"professorId\":\"" + professorB.getId() + "\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void joinTurmaAlreadyLinkedShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Repetido",
                "repetido@ilumina.com",
                "Matemática",
                "Masculino",
                true
        );
        Turma turma = createTurmaDirectly("2Y", 2, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(professor, turma);

        mockMvc.perform(post("/api/v1/turmas/{id}/join", turma.getId())
                        .with(user("repetido@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"professorId\":\"" + professor.getId() + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void joinInactiveTurmaShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Join Inativa",
                "join.inativa@ilumina.com",
                "História",
                "Masculino",
                true
        );
        Turma turma = createTurmaDirectly("Join Inativa", 2, Turno.NOTURNO, Ensino.MEDIO, 12, false);

        mockMvc.perform(post("/api/v1/turmas/{id}/join", turma.getId())
                        .with(user("join.inativa@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"professorId\":\"" + professor.getId() + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void leaveTurmaShouldRemoveLinkAndKeepTurma() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Leave",
                "leave@ilumina.com",
                "Matemática",
                "Masculino",
                true
        );
        Turma turma = createTurmaDirectly("3Z", 3, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(professor, turma);

        mockMvc.perform(delete("/api/v1/turmas/{id}/leave", turma.getId())
                        .with(user("leave@ilumina.com").roles("PROFESSOR"))
                        .param("professorId", professor.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.professores.length()").value(0));

        assertThat(profTurmaRepository.existsByProfessor_IdAndTurma_Id(professor.getId(), turma.getId())).isFalse();
        assertThat(turmaRepository.existsById(turma.getId())).isTrue();
    }

    @Test
    void leaveTurmaWithoutLinkShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Sem Vinculo",
                "sem.vinculo@ilumina.com",
                "Química",
                "Feminino",
                true
        );
        Turma turma = createTurmaDirectly("4W", 4, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 24, true);

        mockMvc.perform(delete("/api/v1/turmas/{id}/leave", turma.getId())
                        .with(user("sem.vinculo@ilumina.com").roles("PROFESSOR"))
                        .param("professorId", professor.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void createTurmaWithInvalidAnoShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Ano",
                "ano@ilumina.com",
                "História",
                "Masculino",
                true
        );

        CreateTurmaRequest request = new CreateTurmaRequest(
                "Ano Invalido",
                0,
                Turno.MATUTINO,
                Ensino.FUNDAMENTAL,
                10
        );

        mockMvc.perform(post("/api/v1/turmas")
                        .with(user("ano@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTurmaWithNegativeQntAlunosShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Qnt",
                "qnt@ilumina.com",
                "História",
                "Masculino",
                true
        );

        CreateTurmaRequest request = new CreateTurmaRequest(
                "Qnt Invalida",
                1,
                Turno.MATUTINO,
                Ensino.FUNDAMENTAL,
                -1
        );

        mockMvc.perform(post("/api/v1/turmas")
                        .with(user("qnt@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTurmaWithBlankNomeShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor Nome",
                "nome@ilumina.com",
                "História",
                "Masculino",
                true
        );

        CreateTurmaRequest request = new CreateTurmaRequest(
                "   ",
                1,
                Turno.MATUTINO,
                Ensino.FUNDAMENTAL,
                10
        );

        mockMvc.perform(post("/api/v1/turmas")
                        .with(user("nome@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTurmaWithInvalidTurnoShouldReturnBadRequest() throws Exception {
        createProfessorDirectly("Professor Enum", "enum@ilumina.com", "Geo", "Masculino", true);

        mockMvc.perform(post("/api/v1/turmas")
                        .with(user("enum@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Enum\",\"ano\":1,\"turno\":\"INTEGRAL\",\"ensino\":\"FUNDAMENTAL\",\"qntAlunos\":10}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getTurmaByInvalidIdShouldReturnNotFound() throws Exception {
        Professor professor = createProfessorDirectly(
                "Professor NotFound",
                "notfound@ilumina.com",
                "Física",
                "Masculino",
                true
        );

        mockMvc.perform(get("/api/v1/turmas/{id}", UUID.randomUUID())
                        .with(user("notfound@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isNotFound());
    }

    @Test
    void enrollStudentAsLinkedProfessorShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly("Professor Matricula", "matricula@ilumina.com", "Geo", "Masculino", true);
        Aluno aluno = createAlunoDirectly("Aluno Matricula", "aluno.matricula@ilumina.com", "MAT-100", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Matricula", 3, Turno.MATUTINO, Ensino.FUNDAMENTAL, 25, true);
        linkProfessorTurma(professor, turma);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("matricula@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + aluno.getId() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), turma.getId())).isTrue();
    }

    @Test
    void alunoCanSelfEnrollInActiveTurmaShouldReturnOk() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Self", "self@ilumina.com", "MAT-SELF", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Self", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("self@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + aluno.getId() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), turma.getId())).isTrue();
    }

    @Test
    void enrollStudentAsAdminShouldReturnOk() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Admin", "admin.enroll@ilumina.com", "MAT-ADMIN", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Admin", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 27, true);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("admin@ilumina.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + aluno.getId() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), turma.getId())).isTrue();
    }

    @Test
    void enrollStudentAlreadyEnrolledShouldReturnBadRequest() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Duplicado", "duplicado.matricula@ilumina.com", "MAT-DUP", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Duplicada", 3, Turno.MATUTINO, Ensino.MEDIO, 20, true);
        linkAlunoTurma(aluno, turma);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("admin@ilumina.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + aluno.getId() + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Aluno já está matriculado nesta turma."));
    }

    @Test
    void enrollStudentAsUnlinkedProfessorShouldReturnForbidden() throws Exception {
        createProfessorDirectly("Professor Dono", "dono.matricula@ilumina.com", "Geo", "Masculino", true);
        createProfessorDirectly("Professor Fora", "fora.matricula@ilumina.com", "Bio", "Feminino", true);
        Aluno aluno = createAlunoDirectly("Aluno Teste", "aluno.forbidden@ilumina.com", "MAT-101", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Restrita", 4, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 28, true);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("fora.matricula@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + aluno.getId() + "\"}"))
                .andExpect(status().isForbidden());

        assertThat(alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), turma.getId())).isFalse();
    }

    @Test
    void alunoCannotEnrollAnotherAlunoShouldReturnForbidden() throws Exception {
        Aluno autenticado = createAlunoDirectly("Aluno A", "aluno.a@ilumina.com", "MAT-201", "Feminino", true);
        Aluno alvo = createAlunoDirectly("Aluno B", "aluno.b@ilumina.com", "MAT-202", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Aluno", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("aluno.a@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + alvo.getId() + "\"}"))
                .andExpect(status().isForbidden());

        assertThat(alunoTurmaRepository.existsByAluno_IdAndTurma_Id(alvo.getId(), turma.getId())).isFalse();
        assertThat(autenticado.getId()).isNotEqualTo(alvo.getId());
    }

    @Test
    void enrollStudentInInactiveTurmaShouldReturnBadRequest() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Inativa", "aluno.inativa@ilumina.com", "MAT-301", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Inativa", 2, Turno.NOTURNO, Ensino.MEDIO, 22, false);

        mockMvc.perform(post("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("admin@ilumina.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"alunoId\":\"" + aluno.getId() + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void listStudentsAsLinkedProfessorShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly("Professor Lista Alunos", "lista.alunos@ilumina.com", "Geo", "Feminino", true);
        Aluno aluno1 = createAlunoDirectly("Aluno 1", "aluno1.lista@ilumina.com", "MAT-401", "Feminino", true);
        Aluno aluno2 = createAlunoDirectly("Aluno 2", "aluno2.lista@ilumina.com", "MAT-402", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Lista", 5, Turno.MATUTINO, Ensino.MEDIO, 35, true);
        linkProfessorTurma(professor, turma);
        linkAlunoTurma(aluno1, turma);
        linkAlunoTurma(aluno2, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("lista.alunos@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

        @Test
        void listStudentsPublicByTurmaIdShouldReturnOkWithoutAuthentication() throws Exception {
                Aluno aluno1 = createAlunoDirectly("Aluno Público 1", "aluno.publico1@ilumina.com", "MAT-PUBLIC-1", "Feminino", true);
                Aluno aluno2 = createAlunoDirectly("Aluno Público 2", "aluno.publico2@ilumina.com", "MAT-PUBLIC-2", "Masculino", true);
                Turma turma = createTurmaDirectly("Turma Pública", 5, Turno.MATUTINO, Ensino.MEDIO, 35, true);
                linkAlunoTurma(aluno1, turma);
                linkAlunoTurma(aluno2, turma);

                mockMvc.perform(get("/api/v1/turmas/{id}/matriculas/publico", turma.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.length()").value(2));
        }

    @Test
    void listStudentsAsUnlinkedProfessorShouldReturnForbidden() throws Exception {
        Professor owner = createProfessorDirectly("Professor Owner Lista", "owner.lista@ilumina.com", "Geo", "Feminino", true);
        createProfessorDirectly("Professor Fora Lista", "fora.lista@ilumina.com", "Mat", "Masculino", true);
        Aluno aluno = createAlunoDirectly("Aluno Lista", "aluno.lista@ilumina.com", "MAT-LISTA", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Lista Restrita", 6, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 29, true);
        linkProfessorTurma(owner, turma);
        linkAlunoTurma(aluno, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/matriculas", turma.getId())
                        .with(user("fora.lista@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void listAvailableStudentsShouldFilterByQueryAndExcludeEnrolledStudents() throws Exception {
        Professor professor = createProfessorDirectly("Professor Busca", "busca@ilumina.com", "Geo", "Feminino", true);
        Aluno alunoDisponivel = createAlunoDirectly("Ana Disponivel", "ana.disponivel@ilumina.com", "MAT-ANA", "Feminino", true);
        Aluno alunoMatriculado = createAlunoDirectly("Ana Matriculada", "ana.matriculada@ilumina.com", "MAT-MATRICULADA", "Feminino", true);
        createAlunoDirectly("Bruno Fora", "bruno.fora@ilumina.com", "MAT-BRUNO", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Busca", 6, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 26, true);
        linkProfessorTurma(professor, turma);
        linkAlunoTurma(alunoMatriculado, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/alunos-disponiveis", turma.getId())
                        .with(user("busca@ilumina.com").roles("PROFESSOR"))
                        .param("query", "ana"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(alunoDisponivel.getId().toString()));
    }

    @Test
    void listAvailableStudentsAsUnlinkedProfessorShouldReturnForbidden() throws Exception {
        Professor owner = createProfessorDirectly("Professor Owner Busca", "owner.busca@ilumina.com", "Geo", "Feminino", true);
        createProfessorDirectly("Professor Fora Busca", "fora.busca@ilumina.com", "Mat", "Masculino", true);
        createAlunoDirectly("Aluno Busca", "aluno.busca@ilumina.com", "MAT-BUSCA", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Busca Restrita", 6, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 29, true);
        linkProfessorTurma(owner, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/alunos-disponiveis", turma.getId())
                        .with(user("fora.busca@ilumina.com").roles("PROFESSOR"))
                        .param("query", "aluno"))
                .andExpect(status().isForbidden());
    }

    @Test
    void unenrollStudentAsLinkedProfessorShouldRemoveEnrollment() throws Exception {
        Professor professor = createProfessorDirectly("Professor Unenroll", "unenroll@ilumina.com", "Mat", "Masculino", true);
        Aluno aluno = createAlunoDirectly("Aluno Unenroll", "aluno.unenroll@ilumina.com", "MAT-501", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Unenroll", 6, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 26, true);
        linkProfessorTurma(professor, turma);
        linkAlunoTurma(aluno, turma);

        mockMvc.perform(delete("/api/v1/turmas/{id}/matriculas/{alunoId}", turma.getId(), aluno.getId())
                        .with(user("unenroll@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), turma.getId())).isFalse();
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

    private void linkProfessorTurma(Professor professor, Turma turma) {
        ProfTurma profTurma = new ProfTurma();
        profTurma.setProfessor(professor);
        profTurma.setTurma(turma);
        profTurmaRepository.save(profTurma);
    }

        private void linkAlunoTurma(Aluno aluno, Turma turma) {
                AlunoTurma alunoTurma = new AlunoTurma();
                alunoTurma.setAluno(aluno);
                alunoTurma.setTurma(turma);
                alunoTurmaRepository.save(alunoTurma);
        }
}
