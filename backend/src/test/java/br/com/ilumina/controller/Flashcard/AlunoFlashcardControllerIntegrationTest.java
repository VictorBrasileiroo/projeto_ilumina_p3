package br.com.ilumina.controller.Flashcard;

import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Flashcard.ColecoesFlashcard;
import br.com.ilumina.entity.Flashcard.Flashcard;
import br.com.ilumina.entity.Flashcard.StatusColecao;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Turma.AlunoTurma;
import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.Turma.Turno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Flashcard.ColecoesFlashcardRepository;
import br.com.ilumina.repository.Flashcard.FlashcardRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
import br.com.ilumina.repository.User.RoleRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AlunoFlashcardControllerIntegrationTest {

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private ColecoesFlashcardRepository colecoesFlashcardRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private AlunoTurmaRepository alunoTurmaRepository;

    @Autowired
    private ProfessorRepository professorRepository;

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
        flashcardRepository.deleteAll();
        colecoesFlashcardRepository.deleteAll();
        alunoTurmaRepository.deleteAll();
        turmaRepository.deleteAll();
        alunoRepository.deleteAll();
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void listarColecoesAlunoShouldReturnOnlyPublishedFromOwnTurmas() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Lista", "aluno.lista.flash@ilumina.com", "MAT-FLASH-01", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Lista", "prof.lista.flash@ilumina.com", "Historia", "Masculino", true);

        Turma turmaDoAluno = createTurmaDirectly("Turma Flash Aluno", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 25, true);
        Turma outraTurma = createTurmaDirectly("Turma Flash Outra", 2, Turno.VESPERTINO, Ensino.MEDIO, 30, true);

        linkAlunoTurma(aluno, turmaDoAluno);

        ColecoesFlashcard colecaoVisivel = createColecaoDirectly(professor, turmaDoAluno, StatusColecao.PUBLICADA, "Colecao Visivel");
        createFlashcardDirectly(colecaoVisivel, "Frente A", "Verso A", 1);

        ColecoesFlashcard colecaoRascunho = createColecaoDirectly(professor, turmaDoAluno, StatusColecao.RASCUNHO, "Colecao Rascunho");
        createFlashcardDirectly(colecaoRascunho, "Frente B", "Verso B", 1);

        ColecoesFlashcard colecaoOutraTurma = createColecaoDirectly(professor, outraTurma, StatusColecao.PUBLICADA, "Colecao Outra Turma");
        createFlashcardDirectly(colecaoOutraTurma, "Frente C", "Verso C", 1);

        mockMvc.perform(get("/api/v1/aluno/colecoes")
                        .with(user("aluno.lista.flash@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(colecaoVisivel.getId().toString()))
                .andExpect(jsonPath("$.data[0].titulo").value("Colecao Visivel"))
                .andExpect(jsonPath("$.data[0].totalFlashcards").value(1));
    }

    @Test
    void listarColecoesAlunoSemTurmasShouldReturnEmpty() throws Exception {
        createAlunoDirectly("Aluno Sem Turma", "aluno.sem.turma.flash@ilumina.com", "MAT-FLASH-02", "Masculino", true);

        mockMvc.perform(get("/api/v1/aluno/colecoes")
                        .with(user("aluno.sem.turma.flash@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void detalharColecaoPublicadaDaTurmaShouldReturnOkAndOrdered() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Detalhe", "aluno.detalhe.flash@ilumina.com", "MAT-FLASH-03", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Detalhe", "prof.detalhe.flash@ilumina.com", "Geografia", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Detalhe Flash", 3, Turno.MATUTINO, Ensino.MEDIO, 32, true);
        linkAlunoTurma(aluno, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.PUBLICADA, "Colecao Detalhe");
        createFlashcardDirectly(colecao, "Frente 2", "Verso 2", 2);
        createFlashcardDirectly(colecao, "Frente 1", "Verso 1", 1);

        mockMvc.perform(get("/api/v1/aluno/colecoes/{id}", colecao.getId())
                        .with(user("aluno.detalhe.flash@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(colecao.getId().toString()))
                .andExpect(jsonPath("$.data.flashcards.length()").value(2))
                .andExpect(jsonPath("$.data.flashcards[0].ordem").value(1))
                .andExpect(jsonPath("$.data.flashcards[1].ordem").value(2));
    }

    @Test
    void detalharColecaoDeOutraTurmaShouldReturnForbidden() throws Exception {
        createAlunoDirectly("Aluno Fora", "aluno.fora.flash@ilumina.com", "MAT-FLASH-04", "Masculino", true);
        Professor professor = createProfessorDirectly("Professor Fora", "prof.fora.flash@ilumina.com", "Historia", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Restrita Flash", 2, Turno.VESPERTINO, Ensino.MEDIO, 28, true);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.PUBLICADA, "Colecao Restrita");
        createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(get("/api/v1/aluno/colecoes/{id}", colecao.getId())
                        .with(user("aluno.fora.flash@ilumina.com").roles("ALUNO")))
                .andExpect(status().isForbidden());
    }

    @Test
    void detalharColecaoRascunhoShouldReturnForbidden() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Rascunho", "aluno.rascunho.flash@ilumina.com", "MAT-FLASH-05", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Rascunho", "prof.rascunho.flash@ilumina.com", "Matematica", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Rascunho Flash", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 26, true);
        linkAlunoTurma(aluno, turma);

        ColecoesFlashcard colecao = createColecaoDirectly(professor, turma, StatusColecao.RASCUNHO, "Colecao Rascunho");
        createFlashcardDirectly(colecao, "Frente", "Verso", 1);

        mockMvc.perform(get("/api/v1/aluno/colecoes/{id}", colecao.getId())
                        .with(user("aluno.rascunho.flash@ilumina.com").roles("ALUNO")))
                .andExpect(status().isForbidden());
    }

    @Test
    void detalharColecaoInexistenteShouldReturnNotFound() throws Exception {
        createAlunoDirectly("Aluno Not Found", "aluno.notfound.flash@ilumina.com", "MAT-FLASH-06", "Feminino", true);

        mockMvc.perform(get("/api/v1/aluno/colecoes/{id}", UUID.randomUUID())
                        .with(user("aluno.notfound.flash@ilumina.com").roles("ALUNO")))
                .andExpect(status().isNotFound());
    }

    @Test
    void professorTryingAlunoFlashcardEndpointShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/aluno/colecoes")
                        .with(user("prof.sem.acesso.flash@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void alunoTryingProfessorFlashcardEndpointShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/colecoes")
                        .with(user("aluno.sem.acesso.prof.flash@ilumina.com").roles("ALUNO")))
                .andExpect(status().isForbidden());
    }

    private Aluno createAlunoDirectly(
            String name,
            String email,
            String matricula,
            String sexo,
            boolean active
    ) {
        UserRole roleAluno = roleRepository.findUserRoleByName("ROLE_ALUNO")
                .orElseThrow(() -> new IllegalStateException("ROLE_ALUNO nao encontrada para teste."));

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

    private Professor createProfessorDirectly(
            String name,
            String email,
            String disciplina,
            String sexo,
            boolean active
    ) {
        UserRole roleProfessor = roleRepository.findUserRoleByName("ROLE_PROFESSOR")
                .orElseThrow(() -> new IllegalStateException("ROLE_PROFESSOR nao encontrada para teste."));

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
