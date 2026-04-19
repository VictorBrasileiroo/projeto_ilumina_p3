package br.com.ilumina.controller.Flashcard;

import br.com.ilumina.dto.flashcard.CreateColecaoRequest;
import br.com.ilumina.dto.flashcard.CreateFlashcardRequest;
import br.com.ilumina.dto.flashcard.UpdateColecaoRequest;
import br.com.ilumina.dto.flashcard.UpdateFlashcardRequest;
import br.com.ilumina.entity.Flashcard.ColecoesFlashcard;
import br.com.ilumina.entity.Flashcard.Flashcard;
import br.com.ilumina.entity.Flashcard.StatusColecao;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.ProfTurma;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.Turma.Turno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Flashcard.ColecoesFlashcardRepository;
import br.com.ilumina.repository.Flashcard.FlashcardRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
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
class FlashcardControllerIntegrationTest {

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ColecoesFlashcardRepository colecoesFlashcardRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

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
        flashcardRepository.deleteAll();
        colecoesFlashcardRepository.deleteAll();
        profTurmaRepository.deleteAll();
        turmaRepository.deleteAll();
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createColecaoSuccessShouldReturnCreated() throws Exception {
        Professor professor = createProfessorDirectly("Professor Flash", "flash.create@ilumina.com");
        Turma turma = createTurmaDirectly("1A", true);
        linkProfessorTurma(professor, turma);

        CreateColecaoRequest request = new CreateColecaoRequest(
                "Colecao Revolucao",
                "Revolucao Industrial",
                10,
                turma.getId()
        );

        mockMvc.perform(post("/api/v1/colecoes")
                        .with(user("flash.create@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.titulo").value("Colecao Revolucao"))
                .andExpect(jsonPath("$.data.status").value("RASCUNHO"))
                .andExpect(jsonPath("$.data.totalFlashcards").value(0));
    }

    @Test
    void createColecaoTurmaInexistenteShouldReturnNotFound() throws Exception {
        createProfessorDirectly("Professor Flash", "flash.notfound@ilumina.com");

        CreateColecaoRequest request = new CreateColecaoRequest(
                "Colecao",
                "Tema",
                5,
                UUID.randomUUID()
        );

        mockMvc.perform(post("/api/v1/colecoes")
                        .with(user("flash.notfound@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void createColecaoProfessorNaoVinculadoTurmaShouldReturnBadRequest() throws Exception {
        createProfessorDirectly("Professor Flash", "flash.sem.vinculo@ilumina.com");
        Turma turma = createTurmaDirectly("1B", true);

        CreateColecaoRequest request = new CreateColecaoRequest(
                "Colecao Sem Vinculo",
                "Tema",
                5,
                turma.getId()
        );

        mockMvc.perform(post("/api/v1/colecoes")
                        .with(user("flash.sem.vinculo@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
        }

        @Test
        void createColecaoTurmaInativaShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly("Professor Flash", "flash.turma.inativa@ilumina.com");
        Turma turma = createTurmaDirectly("1C", false);
        linkProfessorTurma(professor, turma);

        CreateColecaoRequest request = new CreateColecaoRequest(
            "Colecao Turma Inativa",
            "Tema",
            5,
            turma.getId()
        );

        mockMvc.perform(post("/api/v1/colecoes")
                .with(user("flash.turma.inativa@ilumina.com").roles("PROFESSOR"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void listarColecoesDoProfessorShouldReturnOnlyOwnCollections() throws Exception {
        Professor professor1 = createProfessorDirectly("Professor 1", "flash.list.1@ilumina.com");
        Professor professor2 = createProfessorDirectly("Professor 2", "flash.list.2@ilumina.com");

        Turma turma1 = createTurmaDirectly("2A", true);
        Turma turma2 = createTurmaDirectly("2B", true);

        createColecaoDirectly(professor1, turma1, StatusColecao.RASCUNHO, "Colecao Professor 1");
        createColecaoDirectly(professor2, turma2, StatusColecao.RASCUNHO, "Colecao Professor 2");

        mockMvc.perform(get("/api/v1/colecoes")
                        .with(user("flash.list.1@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].titulo").value("Colecao Professor 1"));
    }

            @Test
            void listarColecoesComoAdminShouldReturnAllCollections() throws Exception {
            Professor professor1 = createProfessorDirectly("Professor Admin 1", "flash.admin.list.1@ilumina.com");
            Professor professor2 = createProfessorDirectly("Professor Admin 2", "flash.admin.list.2@ilumina.com");

            Turma turma1 = createTurmaDirectly("2C", true);
            Turma turma2 = createTurmaDirectly("2D", true);

            createColecaoDirectly(professor1, turma1, StatusColecao.RASCUNHO, "Colecao A");
            createColecaoDirectly(professor2, turma2, StatusColecao.RASCUNHO, "Colecao B");

            mockMvc.perform(get("/api/v1/colecoes")
                    .with(user("admin.list@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
            }

            @Test
            void listarColecoesSemAutenticacaoShouldReturnUnauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/colecoes"))
                .andExpect(status().isUnauthorized());
            }

            @Test
            void createColecaoComoAdminSemPerfilProfessorShouldReturnBadRequest() throws Exception {
            Professor professor = createProfessorDirectly("Professor Dono", "flash.admin.owner@ilumina.com");
            Turma turma = createTurmaDirectly("2E", true);
            linkProfessorTurma(professor, turma);

            CreateColecaoRequest request = new CreateColecaoRequest(
                "Colecao Admin Sem Perfil",
                "Tema",
                10,
                turma.getId()
            );

            mockMvc.perform(post("/api/v1/colecoes")
                    .with(user("admin.sem.perfil@ilumina.com").roles("ADMIN"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
            }

    @Test
    void detalharColecaoComCardsShouldReturnOkAndOrder() throws Exception {
        Professor professor = createProfessorDirectly("Professor Detail", "flash.detail@ilumina.com");
        Turma turma = createTurmaDirectly("3A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Detalhe");
        createFlashcardDirectly(colecao, "Frente 2", "Verso 2", 2);
        createFlashcardDirectly(colecao, "Frente 1", "Verso 1", 1);

        mockMvc.perform(get("/api/v1/colecoes/{id}", colecao.getId())
                        .with(user("flash.detail@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.flashcards.length()").value(2))
                .andExpect(jsonPath("$.data.flashcards[0].ordem").value(1))
                .andExpect(jsonPath("$.data.flashcards[1].ordem").value(2));
    }

    @Test
    void adicionarFlashcardSuccessShouldReturnCreatedWithSequentialOrder() throws Exception {
        Professor professor = createProfessorDirectly("Professor Add", "flash.add@ilumina.com");
        Turma turma = createTurmaDirectly("4A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Add");
        createFlashcardDirectly(colecao, "Frente 1", "Verso 1", 1);

        CreateFlashcardRequest request = new CreateFlashcardRequest("Frente 2", "Verso 2");

        mockMvc.perform(post("/api/v1/colecoes/{colecaoId}/flashcards", colecao.getId())
                        .with(user("flash.add@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.ordem").value(2));
    }

    @Test
    void atualizarColecaoRascunhoShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly("Professor Update", "flash.update@ilumina.com");
        Turma turma = createTurmaDirectly("4C", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Antiga");
        UpdateColecaoRequest request = new UpdateColecaoRequest("Colecao Nova", "Tema Novo", 15);

        mockMvc.perform(put("/api/v1/colecoes/{id}", colecao.getId())
                        .with(user("flash.update@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.titulo").value("Colecao Nova"))
                .andExpect(jsonPath("$.data.tema").value("Tema Novo"));
    }

    @Test
    void atualizarColecaoPublicadaShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly("Professor Update", "flash.update.pub@ilumina.com");
        Turma turma = createTurmaDirectly("4D", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.PUBLICADA, "Colecao Publicada");
        UpdateColecaoRequest request = new UpdateColecaoRequest("Titulo Bloqueado", "Tema", 20);

        mockMvc.perform(put("/api/v1/colecoes/{id}", colecao.getId())
                        .with(user("flash.update.pub@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adicionarFlashcardEmColecaoPublicadaShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly("Professor Add", "flash.add.pub@ilumina.com");
        Turma turma = createTurmaDirectly("4B", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.PUBLICADA, "Colecao Publicada");

        CreateFlashcardRequest request = new CreateFlashcardRequest("Frente", "Verso");

        mockMvc.perform(post("/api/v1/colecoes/{colecaoId}/flashcards", colecao.getId())
                        .with(user("flash.add.pub@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void editarFlashcardSuccessShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly("Professor Edit", "flash.edit@ilumina.com");
        Turma turma = createTurmaDirectly("5A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Edit");
        Flashcard flashcard = createFlashcardDirectly(colecao, "Frente antiga", "Verso antigo", 1);

        UpdateFlashcardRequest request = new UpdateFlashcardRequest("Frente nova", "Verso novo");

        mockMvc.perform(put("/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}", colecao.getId(), flashcard.getId())
                        .with(user("flash.edit@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.textoFrente").value("Frente nova"))
                .andExpect(jsonPath("$.data.textoVerso").value("Verso novo"));
    }

    @Test
    void removerFlashcardSuccessShouldReturnNoContent() throws Exception {
        Professor professor = createProfessorDirectly("Professor Remove", "flash.remove@ilumina.com");
        Turma turma = createTurmaDirectly("6A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Remove");
        Flashcard flashcard = createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(delete("/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}", colecao.getId(), flashcard.getId())
                        .with(user("flash.remove@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isNoContent());

        assertThat(flashcardRepository.existsById(flashcard.getId())).isFalse();
    }

    @Test
    void editarFlashcardNaoPertenceColecaoShouldReturnNotFound() throws Exception {
        Professor professor = createProfessorDirectly("Professor Ownership", "flash.card.ownership@ilumina.com");
        Turma turma = createTurmaDirectly("7A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao1 = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao 1");
        ColecoesFlashcard colecao2 = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao 2");
        Flashcard flashcardColecao2 = createFlashcardDirectly(colecao2, "Frente", "Verso", 1);

        UpdateFlashcardRequest request = new UpdateFlashcardRequest("Nova frente", "Novo verso");

        mockMvc.perform(put("/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}", colecao1.getId(), flashcardColecao2.getId())
                        .with(user("flash.card.ownership@ilumina.com").roles("PROFESSOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void publicarColecaoComSucessoShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly("Professor Publish", "flash.publish@ilumina.com");
        Turma turma = createTurmaDirectly("8A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Publish");
        createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(patch("/api/v1/colecoes/{id}/publicar", colecao.getId())
                        .with(user("flash.publish@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLICADA"));
    }

    @Test
    void publicarColecaoSemCardsShouldReturnBadRequest() throws Exception {
        Professor professor = createProfessorDirectly("Professor Publish", "flash.publish.empty@ilumina.com");
        Turma turma = createTurmaDirectly("8B", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Vazia");

        mockMvc.perform(patch("/api/v1/colecoes/{id}/publicar", colecao.getId())
                        .with(user("flash.publish.empty@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void despublicarColecaoComSucessoShouldReturnOk() throws Exception {
        Professor professor = createProfessorDirectly("Professor Unpublish", "flash.unpublish@ilumina.com");
        Turma turma = createTurmaDirectly("9A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.PUBLICADA, "Colecao Publicada");
        createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(patch("/api/v1/colecoes/{id}/despublicar", colecao.getId())
                        .with(user("flash.unpublish@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RASCUNHO"));
    }

    @Test
    void publicarColecaoDeOutroProfessorShouldReturnForbidden() throws Exception {
        Professor owner = createProfessorDirectly("Professor Dono", "flash.owner@ilumina.com");
        Professor outro = createProfessorDirectly("Professor Outro", "flash.other@ilumina.com");
        Turma turma = createTurmaDirectly("10A", true);
        linkProfessorTurma(owner, turma);
        linkProfessorTurma(outro, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(owner, turma, StatusColecao.RASCUNHO, "Colecao Restrita");
        createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(patch("/api/v1/colecoes/{id}/publicar", colecao.getId())
                        .with(user("flash.other@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void publicarColecaoComoAdminShouldReturnOk() throws Exception {
        Professor owner = createProfessorDirectly("Professor Dono", "flash.admin.publish.owner@ilumina.com");
        Turma turma = createTurmaDirectly("10B", true);
        linkProfessorTurma(owner, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(owner, turma, StatusColecao.RASCUNHO, "Colecao Admin Publish");
        createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(patch("/api/v1/colecoes/{id}/publicar", colecao.getId())
                        .with(user("admin.publish@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLICADA"));
    }

    @Test
    void excluirColecaoRascunhoComCardsShouldReturnNoContentAndCascade() throws Exception {
        Professor professor = createProfessorDirectly("Professor Delete", "flash.delete@ilumina.com");
        Turma turma = createTurmaDirectly("11A", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Delete");
        createFlashcardDirectly(colecao, "Frente 1", "Verso 1", 1);
        createFlashcardDirectly(colecao, "Frente 2", "Verso 2", 2);

        mockMvc.perform(delete("/api/v1/colecoes/{id}", colecao.getId())
                        .with(user("flash.delete@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isNoContent());

        assertThat(colecoesFlashcardRepository.existsById(colecao.getId())).isFalse();
        assertThat(flashcardRepository.findByColecao_IdOrderByOrdemAsc(colecao.getId())).isEmpty();
    }

    @Test
    void excluirColecaoPublicadaShouldReturnNoContent() throws Exception {
        Professor professor = createProfessorDirectly("Professor Delete", "flash.delete.pub@ilumina.com");
        Turma turma = createTurmaDirectly("11B", true);
        linkProfessorTurma(professor, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.PUBLICADA, "Colecao Publicada");
        createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(delete("/api/v1/colecoes/{id}", colecao.getId())
                        .with(user("flash.delete.pub@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isNoContent());

        assertThat(colecoesFlashcardRepository.existsById(colecao.getId())).isFalse();
    }

    private Professor createProfessorDirectly(String name, String email) {
        UserRole roleProfessor = roleRepository.findUserRoleByName("ROLE_PROFESSOR")
                .orElseThrow(() -> new IllegalStateException("ROLE_PROFESSOR nao encontrada para teste."));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setActive(true);
        user.setRoles(Set.of(roleProfessor));

        User savedUser = userRepository.save(user);

        Professor professor = new Professor();
        professor.setUser(savedUser);
        professor.setDisciplina("Historia");
        professor.setSexo("Masculino");

        return professorRepository.save(professor);
    }

    private Turma createTurmaDirectly(String nome, boolean active) {
        Turma turma = new Turma();
        turma.setNome(nome);
        turma.setAno(1);
        turma.setTurno(Turno.MATUTINO);
        turma.setEnsino(Ensino.FUNDAMENTAL);
        turma.setQntAlunos(30);
        turma.setActive(active);

        return turmaRepository.save(turma);
    }

    private void linkProfessorTurma(Professor professor, Turma turma) {
        ProfTurma profTurma = new ProfTurma();
        profTurma.setProfessor(professor);
        profTurma.setTurma(turma);
        profTurmaRepository.save(profTurma);
    }

    private ColecoesFlashcard createColecaoDirectly(
            Professor professor,
            Turma turma,
            StatusColecao status,
            String titulo
    ) {
        ColecoesFlashcard colecao = new ColecoesFlashcard();
        colecao.setTitulo(titulo);
        colecao.setTema("Tema");
        colecao.setQntCards(10);
        colecao.setStatus(status);
        colecao.setProfessor(professor);
        colecao.setTurma(turma);

        return colecoesFlashcardRepository.save(colecao);
    }

    private Flashcard createFlashcardDirectly(
            ColecoesFlashcard colecao,
            String frente,
            String verso,
            int ordem
    ) {
        Flashcard flashcard = new Flashcard();
        flashcard.setColecao(colecao);
        flashcard.setTextoFrente(frente);
        flashcard.setTextoVerso(verso);
        flashcard.setOrdem(ordem);

        return flashcardRepository.save(flashcard);
    }
}
