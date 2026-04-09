package br.com.ilumina.controller.Prova;

import br.com.ilumina.dto.prova.CreateAlternativaRequest;
import br.com.ilumina.dto.prova.CreateProvaRequest;
import br.com.ilumina.dto.prova.CreateQuestaoRequest;
import br.com.ilumina.dto.prova.UpdateAlternativaRequest;
import br.com.ilumina.dto.prova.UpdateProvaRequest;
import br.com.ilumina.dto.prova.UpdateQuestaoRequest;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Prova.Alternativa;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.Questao;
import br.com.ilumina.entity.Prova.StatusProva;
import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.ProfTurma;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.Turma.Turno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Prova.AlternativaRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Prova.QuestaoRepository;
import br.com.ilumina.repository.Turma.ProfTurmaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
import br.com.ilumina.repository.User.RoleRepository;
import br.com.ilumina.repository.User.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
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
class ProvaControllerIntegrationTest {

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProvaRepository provaRepository;

    @Autowired
    private QuestaoRepository questaoRepository;

    @Autowired
    private AlternativaRepository alternativaRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private TurmaRepository turmaRepository;

    @Autowired
    private ProfTurmaRepository profTurmaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void cleanup() {
        alternativaRepository.deleteAll();
        questaoRepository.deleteAll();
        provaRepository.deleteAll();
        profTurmaRepository.deleteAll();
        turmaRepository.deleteAll();
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createProvaAsLinkedProfessorShouldReturnCreated() throws Exception {
        Professor professor = createProfessorDirectly("Professor Prova", "prova.create@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("1A", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(professor, turma);

        CreateProvaRequest request = new CreateProvaRequest(
                "Prova Bimestral",
                "Conteúdo acumulado",
                "Matemática",
                10,
                turma.getId()
        );

        mockMvc.perform(post("/api/v1/provas")
                        .with(user("prova.create@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.titulo").value("Prova Bimestral"))
                .andExpect(jsonPath("$.data.status").value("RASCUNHO"))
                .andExpect(jsonPath("$.data.totalQuestoes").value(0));
    }

    @Test
    void createProvaWithTurmaInexistenteShouldReturnNotFound() throws Exception {
        createProfessorDirectly("Professor Prova", "prova.notfound@ilumina.com", "Matemática", "Masculino", true);

        CreateProvaRequest request = new CreateProvaRequest(
                "Prova Bimestral",
                "Conteúdo acumulado",
                "Matemática",
                10,
                UUID.randomUUID()
        );

        mockMvc.perform(post("/api/v1/provas")
                        .with(user("prova.notfound@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void createProvaWithTurmaInativaShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly("Professor Prova", "prova.inativa@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("1B", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 25, false);
        linkProfessorTurma(professor, turma);

        CreateProvaRequest request = new CreateProvaRequest(
                "Prova Unidade",
                "Descrição",
                "Matemática",
                8,
                turma.getId()
        );

        mockMvc.perform(post("/api/v1/provas")
                        .with(user("prova.inativa@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void createProvaWithoutTituloShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly("Professor Prova", "prova.sem.titulo@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("1C", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(professor, turma);

        CreateProvaRequest request = new CreateProvaRequest(
                " ",
                "Descrição",
                "Matemática",
                5,
                turma.getId()
        );

        mockMvc.perform(post("/api/v1/provas")
                        .with(user("prova.sem.titulo@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProvaSemVinculoProfessorTurmaShouldReturnBadRequest() throws Exception {
        createProfessorDirectly("Professor Prova", "prova.sem.vinculo@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("1D", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 28, true);

        CreateProvaRequest request = new CreateProvaRequest(
                "Prova Sem Vínculo",
                "Descrição",
                "Matemática",
                5,
                turma.getId()
        );

        mockMvc.perform(post("/api/v1/provas")
                        .with(user("prova.sem.vinculo@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProvaAdminWithoutProfessorProfileShouldReturnBadRequest() throws Exception {
        Turma turma = createTurmaDirectly("1E", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        createUserWithSingleRole("Admin Sem Professor", "admin.sem.prof@ilumina.com", "ROLE_ADMIN", true);

        CreateProvaRequest request = new CreateProvaRequest(
                "Prova Admin",
                "Descrição",
                "Matemática",
                5,
                turma.getId()
        );

        mockMvc.perform(post("/api/v1/provas")
                        .with(user("admin.sem.prof@ilumina.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("É necessário ter perfil de professor para criar provas."));
    }

    @Test
    void listProvasProfessorShouldReturnOnlyOwn() throws Exception {
        Professor p1 = createProfessorDirectly("Professor 1", "prova.list.1@ilumina.com", "História", "Masculino", true);
        Professor p2 = createProfessorDirectly("Professor 2", "prova.list.2@ilumina.com", "Biologia", "Feminino", true);

        Turma turma1 = createTurmaDirectly("2A", 2, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        Turma turma2 = createTurmaDirectly("2B", 2, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 22, true);

        linkProfessorTurma(p1, turma1);
        linkProfessorTurma(p2, turma2);

        createProvaDirectly(p1, turma1, StatusProva.RASCUNHO, "Prova do Professor 1");
        createProvaDirectly(p2, turma2, StatusProva.RASCUNHO, "Prova do Professor 2");

        mockMvc.perform(get("/api/v1/provas")
                        .with(user("prova.list.1@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].professorId").value(p1.getId().toString()));
    }

    @Test
    void listProvasAdminShouldReturnAll() throws Exception {
        Professor p1 = createProfessorDirectly("Professor 1", "prova.admin.1@ilumina.com", "História", "Masculino", true);
        Professor p2 = createProfessorDirectly("Professor 2", "prova.admin.2@ilumina.com", "Biologia", "Feminino", true);

        Turma turma1 = createTurmaDirectly("3A", 3, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        Turma turma2 = createTurmaDirectly("3B", 3, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 22, true);

        linkProfessorTurma(p1, turma1);
        linkProfessorTurma(p2, turma2);

        createProvaDirectly(p1, turma1, StatusProva.RASCUNHO, "Prova A");
        createProvaDirectly(p2, turma2, StatusProva.PUBLICADA, "Prova B");

        mockMvc.perform(get("/api/v1/provas")
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void detailProvaFromOtherProfessorShouldReturnForbidden() throws Exception {
        Professor owner = createProfessorDirectly("Professor Dono", "prova.owner@ilumina.com", "Física", "Masculino", true);
        createProfessorDirectly("Professor Outro", "prova.outro@ilumina.com", "Química", "Feminino", true);
        Turma turma = createTurmaDirectly("4A", 4, Turno.MATUTINO, Ensino.FUNDAMENTAL, 25, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Restrita");

        mockMvc.perform(get("/api/v1/provas/{id}", prova.getId())
                        .with(user("prova.outro@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void detailProvaWithQuestoesShouldReturnOk() throws Exception {
        Professor owner = createProfessorDirectly("Professor Detalhe", "prova.detalhe@ilumina.com", "Geografia", "Masculino", true);
        Turma turma = createTurmaDirectly("4B", 4, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 27, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Completa");
        Questao questao = createQuestaoDirectly(prova, "Capital do Brasil?", "B", 1);
        createAlternativaDirectly(questao, "A", "Rio de Janeiro");
        createAlternativaDirectly(questao, "B", "Brasília");
        createAlternativaDirectly(questao, "C", "São Paulo");
        createAlternativaDirectly(questao, "D", "Belo Horizonte");

        mockMvc.perform(get("/api/v1/provas/{id}", prova.getId())
                        .with(user("prova.detalhe@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.questoes.length()").value(1))
                .andExpect(jsonPath("$.data.questoes[0].alternativas.length()").value(4));
    }

    @Test
    void updateProvaRascunhoShouldReturnOk() throws Exception {
        Professor owner = createProfessorDirectly("Professor Update", "prova.update@ilumina.com", "História", "Masculino", true);
        Turma turma = createTurmaDirectly("5A", 5, Turno.MATUTINO, Ensino.MEDIO, 30, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Antiga");

        UpdateProvaRequest request = new UpdateProvaRequest(
                "Prova Atualizada",
                "Nova descrição",
                "História",
                12,
                turma.getId()
        );

        mockMvc.perform(put("/api/v1/provas/{id}", prova.getId())
                        .with(user("prova.update@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.titulo").value("Prova Atualizada"));
    }

    @Test
    void updateProvaPublicadaShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Update", "prova.update.pub@ilumina.com", "História", "Masculino", true);
        Turma turma = createTurmaDirectly("5B", 5, Turno.MATUTINO, Ensino.MEDIO, 30, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.PUBLICADA, "Prova Publicada");

        UpdateProvaRequest request = new UpdateProvaRequest("Novo título", null, null, null, null);

        mockMvc.perform(put("/api/v1/provas/{id}", prova.getId())
                        .with(user("prova.update.pub@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteProvaRascunhoShouldReturnNoContent() throws Exception {
        Professor owner = createProfessorDirectly("Professor Delete", "prova.delete@ilumina.com", "História", "Masculino", true);
        Turma turma = createTurmaDirectly("6A", 6, Turno.MATUTINO, Ensino.MEDIO, 28, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Delete");

        mockMvc.perform(delete("/api/v1/provas/{id}", prova.getId())
                        .with(user("prova.delete@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isNoContent());

        assertThat(provaRepository.existsById(prova.getId())).isFalse();
    }

    @Test
    void deleteProvaPublicadaShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Delete", "prova.delete.pub@ilumina.com", "História", "Masculino", true);
        Turma turma = createTurmaDirectly("6B", 6, Turno.MATUTINO, Ensino.MEDIO, 28, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.PUBLICADA, "Prova Publicada");

        mockMvc.perform(delete("/api/v1/provas/{id}", prova.getId())
                        .with(user("prova.delete.pub@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addQuestaoValidaShouldReturnCreated() throws Exception {
        Professor owner = createProfessorDirectly("Professor Questao", "prova.questao@ilumina.com", "Química", "Masculino", true);
        Turma turma = createTurmaDirectly("7A", 7, Turno.MATUTINO, Ensino.MEDIO, 26, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova com Questão");

        CreateQuestaoRequest request = new CreateQuestaoRequest(
                "Qual a fórmula da água?",
                "A",
                new BigDecimal("2.50"),
                1,
                List.of(
                        new CreateAlternativaRequest("H2O", "A"),
                        new CreateAlternativaRequest("CO2", "B"),
                        new CreateAlternativaRequest("O2", "C"),
                        new CreateAlternativaRequest("N2", "D")
                )
        );

        mockMvc.perform(post("/api/v1/provas/{provaId}/questoes", prova.getId())
                        .with(user("prova.questao@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.alternativas.length()").value(4));
    }

    @Test
    void addQuestaoComGabaritoNaoCorrespondenteShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Questao", "prova.questao.gabarito@ilumina.com", "Química", "Masculino", true);
        Turma turma = createTurmaDirectly("7B", 7, Turno.MATUTINO, Ensino.MEDIO, 26, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Gabarito");

        CreateQuestaoRequest request = new CreateQuestaoRequest(
                "Questão inválida",
                "C",
                new BigDecimal("2.00"),
                1,
                List.of(
                        new CreateAlternativaRequest("Alt A", "A"),
                        new CreateAlternativaRequest("Alt B", "B")
                )
        );

        mockMvc.perform(post("/api/v1/provas/{provaId}/questoes", prova.getId())
                        .with(user("prova.questao.gabarito@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addQuestaoComUmaAlternativaShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Questao", "prova.questao.min@ilumina.com", "Química", "Masculino", true);
        Turma turma = createTurmaDirectly("7C", 7, Turno.MATUTINO, Ensino.MEDIO, 26, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Min" );

        CreateQuestaoRequest request = new CreateQuestaoRequest(
                "Questão com 1 alternativa",
                "A",
                new BigDecimal("1.00"),
                1,
                List.of(
                        new CreateAlternativaRequest("Alt A", "A")
                )
        );

        mockMvc.perform(post("/api/v1/provas/{provaId}/questoes", prova.getId())
                        .with(user("prova.questao.min@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addQuestaoComOrdemDuplicadaShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Questao", "prova.questao.ordem@ilumina.com", "Química", "Masculino", true);
        Turma turma = createTurmaDirectly("7D", 7, Turno.MATUTINO, Ensino.MEDIO, 26, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Ordem Duplicada");
        createQuestaoDirectly(prova, "Questão existente", "A", 1);

        CreateQuestaoRequest request = new CreateQuestaoRequest(
                "Nova questão",
                "A",
                new BigDecimal("1.50"),
                1,
                List.of(
                        new CreateAlternativaRequest("Alt A", "A"),
                        new CreateAlternativaRequest("Alt B", "B")
                )
        );

        mockMvc.perform(post("/api/v1/provas/{provaId}/questoes", prova.getId())
                        .with(user("prova.questao.ordem@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Já existe outra questão da mesma prova com aquela ordem."));
    }

    @Test
    void updateQuestaoShouldReturnOk() throws Exception {
        Professor owner = createProfessorDirectly("Professor Questao", "prova.questao.update@ilumina.com", "Física", "Masculino", true);
        Turma turma = createTurmaDirectly("8A", 8, Turno.MATUTINO, Ensino.MEDIO, 24, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Update Questao");
        Questao questao = createQuestaoDirectly(prova, "Pergunta antiga", "A", 1);
        createAlternativaDirectly(questao, "A", "Alternativa A");
        createAlternativaDirectly(questao, "B", "Alternativa B");

        UpdateQuestaoRequest request = new UpdateQuestaoRequest(
                "Pergunta nova",
                "B",
                new BigDecimal("3.00"),
                1
        );

        mockMvc.perform(put("/api/v1/provas/{provaId}/questoes/{questaoId}", prova.getId(), questao.getId())
                        .with(user("prova.questao.update@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enunciado").value("Pergunta nova"))
                .andExpect(jsonPath("$.data.gabarito").value("B"));
    }

    @Test
    void updateQuestaoComOrdemDuplicadaShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Questao", "prova.questao.update.ordem@ilumina.com", "Física", "Masculino", true);
        Turma turma = createTurmaDirectly("8D", 8, Turno.MATUTINO, Ensino.MEDIO, 24, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Update Ordem");
        Questao q1 = createQuestaoDirectly(prova, "Q1", "A", 1);
        Questao q2 = createQuestaoDirectly(prova, "Q2", "A", 2);

        UpdateQuestaoRequest request = new UpdateQuestaoRequest(
                null,
                null,
                null,
                q1.getOrdem()
        );

        mockMvc.perform(put("/api/v1/provas/{provaId}/questoes/{questaoId}", prova.getId(), q2.getId())
                        .with(user("prova.questao.update.ordem@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Já existe outra questão da mesma prova com aquela ordem."));
    }

    @Test
    void removeQuestaoShouldReturnNoContent() throws Exception {
        Professor owner = createProfessorDirectly("Professor Questao", "prova.questao.remove@ilumina.com", "Física", "Masculino", true);
        Turma turma = createTurmaDirectly("8B", 8, Turno.MATUTINO, Ensino.MEDIO, 24, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Remove Questao");
        Questao questao = createQuestaoDirectly(prova, "Pergunta", "A", 1);
        createAlternativaDirectly(questao, "A", "Alternativa A");
        createAlternativaDirectly(questao, "B", "Alternativa B");

        mockMvc.perform(delete("/api/v1/provas/{provaId}/questoes/{questaoId}", prova.getId(), questao.getId())
                        .with(user("prova.questao.remove@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isNoContent());

        assertThat(questaoRepository.existsById(questao.getId())).isFalse();
    }

    @Test
    void removeQuestaoShouldReorderRemainingSemGaps() throws Exception {
        Professor owner = createProfessorDirectly("Professor Reorder", "prova.reorder@ilumina.com", "Física", "Masculino", true);
        Turma turma = createTurmaDirectly("8C", 8, Turno.MATUTINO, Ensino.MEDIO, 24, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Reorder");
        Questao q1 = createQuestaoDirectly(prova, "Q1", "A", 1);
        Questao q2 = createQuestaoDirectly(prova, "Q2", "A", 2);
        Questao q3 = createQuestaoDirectly(prova, "Q3", "A", 3);

        createAlternativaDirectly(q1, "A", "A1");
        createAlternativaDirectly(q1, "B", "B1");
        createAlternativaDirectly(q2, "A", "A2");
        createAlternativaDirectly(q2, "B", "B2");
        createAlternativaDirectly(q3, "A", "A3");
        createAlternativaDirectly(q3, "B", "B3");

        mockMvc.perform(delete("/api/v1/provas/{provaId}/questoes/{questaoId}", prova.getId(), q2.getId())
                        .with(user("prova.reorder@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isNoContent());

        List<Questao> restantes = questaoRepository.findByProvaIdOrderByOrdem(prova.getId());
        assertThat(restantes).hasSize(2);
        assertThat(restantes.get(0).getOrdem()).isEqualTo(1);
        assertThat(restantes.get(1).getOrdem()).isEqualTo(2);
    }

    @Test
    void updateAlternativaShouldReturnOk() throws Exception {
        Professor owner = createProfessorDirectly("Professor Alt", "prova.alt.update@ilumina.com", "Biologia", "Feminino", true);
        Turma turma = createTurmaDirectly("9A", 9, Turno.MATUTINO, Ensino.MEDIO, 23, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Alternativa");
        Questao questao = createQuestaoDirectly(prova, "Questão", "A", 1);
        Alternativa alternativa = createAlternativaDirectly(questao, "A", "Texto antigo");
        createAlternativaDirectly(questao, "B", "Texto B");

        UpdateAlternativaRequest request = new UpdateAlternativaRequest("Texto novo");

        mockMvc.perform(put("/api/v1/provas/{provaId}/questoes/{questaoId}/alternativas/{altId}", prova.getId(), questao.getId(), alternativa.getId())
                        .with(user("prova.alt.update@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.texto").value("Texto novo"));
    }

    @Test
    void publishProvaWithQuestoesShouldReturnOk() throws Exception {
        Professor owner = createProfessorDirectly("Professor Publish", "prova.publish@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("10A", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Publicar");
        Questao questao = createQuestaoDirectly(prova, "2 + 2 = ?", "B", 1);
        createAlternativaDirectly(questao, "A", "3");
        createAlternativaDirectly(questao, "B", "4");

        mockMvc.perform(patch("/api/v1/provas/{id}/publicar", prova.getId())
                        .with(user("prova.publish@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLICADA"));
    }

    @Test
    void publishProvaSemQuestoesShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Publish", "prova.publish.sem@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("10B", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Vazia");

        mockMvc.perform(patch("/api/v1/provas/{id}/publicar", prova.getId())
                        .with(user("prova.publish.sem@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void publishProvaQuestaoInvalidaShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Publish", "prova.publish.invalid@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("10C", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Inválida");
        Questao questao = createQuestaoDirectly(prova, "Questão inválida", "D", 1);
        createAlternativaDirectly(questao, "A", "Alt A");
        createAlternativaDirectly(questao, "B", "Alt B");

        mockMvc.perform(patch("/api/v1/provas/{id}/publicar", prova.getId())
                        .with(user("prova.publish.invalid@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tryEditQuestaoAfterPublishShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Publish", "prova.publish.edit@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("10D", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.PUBLICADA, "Prova Publicada");
        Questao questao = createQuestaoDirectly(prova, "Questão", "A", 1);
        createAlternativaDirectly(questao, "A", "Alt A");
        createAlternativaDirectly(questao, "B", "Alt B");

        UpdateQuestaoRequest request = new UpdateQuestaoRequest("Novo enunciado", null, null, null);

        mockMvc.perform(put("/api/v1/provas/{provaId}/questoes/{questaoId}", prova.getId(), questao.getId())
                        .with(user("prova.publish.edit@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void despublicarEditarRepublicarFlowShouldReturnOk() throws Exception {
        Professor owner = createProfessorDirectly("Professor Fluxo", "prova.fluxo@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("11A", 2, Turno.MATUTINO, Ensino.FUNDAMENTAL, 32, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.PUBLICADA, "Prova Fluxo");
        Questao questao = createQuestaoDirectly(prova, "Pergunta inicial", "A", 1);
        createAlternativaDirectly(questao, "A", "Alt A");
        createAlternativaDirectly(questao, "B", "Alt B");

        mockMvc.perform(patch("/api/v1/provas/{id}/despublicar", prova.getId())
                        .with(user("prova.fluxo@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RASCUNHO"));

        UpdateQuestaoRequest update = new UpdateQuestaoRequest("Pergunta editada", null, null, null);
        mockMvc.perform(put("/api/v1/provas/{provaId}/questoes/{questaoId}", prova.getId(), questao.getId())
                        .with(user("prova.fluxo@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enunciado").value("Pergunta editada"));

        mockMvc.perform(patch("/api/v1/provas/{id}/publicar", prova.getId())
                        .with(user("prova.fluxo@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLICADA"));
    }

    @Test
    void publishProvaFromOtherProfessorShouldReturnForbidden() throws Exception {
        Professor owner = createProfessorDirectly("Professor Dono", "prova.pub.owner@ilumina.com", "Matemática", "Masculino", true);
        createProfessorDirectly("Professor Outro", "prova.pub.outro@ilumina.com", "Física", "Feminino", true);
        Turma turma = createTurmaDirectly("11B", 2, Turno.MATUTINO, Ensino.FUNDAMENTAL, 32, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.RASCUNHO, "Prova Restrita Publicação");
        Questao questao = createQuestaoDirectly(prova, "Questão", "A", 1);
        createAlternativaDirectly(questao, "A", "Alt A");
        createAlternativaDirectly(questao, "B", "Alt B");

        mockMvc.perform(patch("/api/v1/provas/{id}/publicar", prova.getId())
                        .with(user("prova.pub.outro@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void accessWithoutAuthenticationShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/provas"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void addQuestaoInPublishedProvaShouldReturnBadRequest() throws Exception {
        Professor owner = createProfessorDirectly("Professor Publish", "prova.add.pub@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("11C", 2, Turno.MATUTINO, Ensino.FUNDAMENTAL, 32, true);
        linkProfessorTurma(owner, turma);

        Prova prova = createProvaDirectly(owner, turma, StatusProva.PUBLICADA, "Prova Publicada");

        CreateQuestaoRequest request = new CreateQuestaoRequest(
                "Questão bloqueada",
                "A",
                new BigDecimal("1.0"),
                1,
                List.of(
                        new CreateAlternativaRequest("A", "A"),
                        new CreateAlternativaRequest("B", "B")
                )
        );

        mockMvc.perform(post("/api/v1/provas/{provaId}/questoes", prova.getId())
                        .with(user("prova.add.pub@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
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

        private User createUserWithSingleRole(
                        String name,
                        String email,
                        String roleName,
                        boolean active
        ) {
                UserRole role = roleRepository.findUserRoleByName(roleName)
                                .orElseThrow(() -> new IllegalStateException(roleName + " não encontrada para teste."));

                User user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("123456"));
                user.setActive(active);
                user.setRoles(Set.of(role));

                return userRepository.save(user);
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

    private Prova createProvaDirectly(Professor professor, Turma turma, StatusProva status, String titulo) {
        Prova prova = new Prova();
        prova.setTitulo(titulo);
        prova.setDescricao("Descrição");
        prova.setDisciplina("Disciplina");
        prova.setQntQuestoes(10);
        prova.setStatus(status);
        prova.setProfessor(professor);
        prova.setTurma(turma);

        return provaRepository.save(prova);
    }

    private Questao createQuestaoDirectly(Prova prova, String enunciado, String gabarito, int ordem) {
        Questao questao = new Questao();
        questao.setProva(prova);
        questao.setEnunciado(enunciado);
        questao.setGabarito(gabarito);
        questao.setPontuacao(new BigDecimal("1.00"));
        questao.setOrdem(ordem);

        return questaoRepository.save(questao);
    }

    private Alternativa createAlternativaDirectly(Questao questao, String letra, String texto) {
        Alternativa alternativa = new Alternativa();
        alternativa.setQuestao(questao);
        alternativa.setLetra(letra);
        alternativa.setTexto(texto);

        return alternativaRepository.save(alternativa);
    }
}
