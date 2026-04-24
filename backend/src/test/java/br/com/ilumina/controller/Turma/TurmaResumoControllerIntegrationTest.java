package br.com.ilumina.controller.Turma;

import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.RespostaAluno;
import br.com.ilumina.entity.Prova.StatusProva;
import br.com.ilumina.entity.Turma.AlunoTurma;
import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.ProfTurma;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.Turma.Turno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Prova.RespostaAlunoRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
import br.com.ilumina.repository.Turma.ProfTurmaRepository;
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

import java.math.BigDecimal;
import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TurmaResumoControllerIntegrationTest {

    @Autowired
    private org.springframework.test.web.servlet.MockMvc mockMvc;

    @Autowired
    private ProvaRepository provaRepository;

    @Autowired
    private RespostaAlunoRepository respostaAlunoRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private AlunoTurmaRepository alunoTurmaRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private ProfTurmaRepository profTurmaRepository;

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
        respostaAlunoRepository.deleteAll();
        provaRepository.deleteAll();
        alunoTurmaRepository.deleteAll();
        profTurmaRepository.deleteAll();
        turmaRepository.deleteAll();
        alunoRepository.deleteAll();
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void resumoTurmaSemProvasShouldReturnZeros() throws Exception {
        Professor professor = createProfessorDirectly("Prof Zero", "prof.zero@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Zero");
        linkProfTurma(professor, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/resumo", turma.getId())
                        .with(user("prof.zero@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.turmaId").value(turma.getId().toString()))
                .andExpect(jsonPath("$.data.turmaNome").value("Turma Zero"))
                .andExpect(jsonPath("$.data.totalAlunos").value(0))
                .andExpect(jsonPath("$.data.totalProvasPublicadas").value(0))
                .andExpect(jsonPath("$.data.totalRespostas").value(0))
                .andExpect(jsonPath("$.data.mediaNota").isEmpty())
                .andExpect(jsonPath("$.data.mediasPorProva").isEmpty());
    }

    @Test
    void resumoTurmaComRespostasShouldReturnCorrectMedia() throws Exception {
        Professor professor = createProfessorDirectly("Prof Media", "prof.media@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Media");
        linkProfTurma(professor, turma);

        Aluno aluno1 = createAlunoDirectly("Aluno 1", "aluno1.media@ilumina.com");
        Aluno aluno2 = createAlunoDirectly("Aluno 2", "aluno2.media@ilumina.com");
        linkAlunoTurma(aluno1, turma);
        linkAlunoTurma(aluno2, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Media", "Matemática");
        createRespostaDirectly(aluno1, prova, 1, 1, new BigDecimal("10.00"));
        createRespostaDirectly(aluno2, prova, 1, 0, new BigDecimal("0.00"));

        mockMvc.perform(get("/api/v1/turmas/{id}/resumo", turma.getId())
                        .with(user("prof.media@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAlunos").value(2))
                .andExpect(jsonPath("$.data.totalProvasPublicadas").value(1))
                .andExpect(jsonPath("$.data.totalRespostas").value(2))
                .andExpect(jsonPath("$.data.mediaNota").value(5.00))
                .andExpect(jsonPath("$.data.mediasPorProva.length()").value(1))
                .andExpect(jsonPath("$.data.mediasPorProva[0].titulo").value("Prova Media"))
                .andExpect(jsonPath("$.data.mediasPorProva[0].totalRespostas").value(2))
                .andExpect(jsonPath("$.data.mediasPorProva[0].mediaNota").value(5.00));
    }

    @Test
    void resumoTurmaNaoIncluiRascunhos() throws Exception {
        Professor professor = createProfessorDirectly("Prof Rascunho", "prof.rascunho@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Rascunho");
        linkProfTurma(professor, turma);

        createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Publicada", "Física");
        createProvaDirectly(professor, turma, StatusProva.RASCUNHO, "Rascunho", "Física");

        mockMvc.perform(get("/api/v1/turmas/{id}/resumo", turma.getId())
                        .with(user("prof.rascunho@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalProvasPublicadas").value(1))
                .andExpect(jsonPath("$.data.mediasPorProva.length()").value(1));
    }

    @Test
    void professorNaoAcessaResumoDeTurmaAlheia() throws Exception {
        Professor prof1 = createProfessorDirectly("Prof Dono", "prof.dono@ilumina.com");
        createProfessorDirectly("Prof Outro", "prof.outro@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Do Prof1");
        linkProfTurma(prof1, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/resumo", turma.getId())
                        .with(user("prof.outro@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminAcessaResumoDeTurmaQualquer() throws Exception {
        Professor professor = createProfessorDirectly("Prof Admin Test", "prof.admintest@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Admin");
        linkProfTurma(professor, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/resumo", turma.getId())
                        .with(user("admin@ilumina.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.turmaId").value(turma.getId().toString()));
    }

    @Test
    void alunoNaoAcessaResumoTurma() throws Exception {
        Professor professor = createProfessorDirectly("Prof Aluno Block", "prof.alunoblock@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Aluno Block");
        linkProfTurma(professor, turma);

        mockMvc.perform(get("/api/v1/turmas/{id}/resumo", turma.getId())
                        .with(user("aluno@ilumina.com").roles("ALUNO")))
                .andExpect(status().isForbidden());
    }

    private Professor createProfessorDirectly(String name, String email) {
        UserRole role = roleRepository.findUserRoleByName("ROLE_PROFESSOR")
                .orElseThrow(() -> new IllegalStateException("ROLE_PROFESSOR não encontrada."));
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setActive(true);
        user.setRoles(Set.of(role));
        Professor professor = new Professor();
        professor.setUser(userRepository.save(user));
        professor.setDisciplina("Geral");
        professor.setSexo("Masculino");
        return professorRepository.save(professor);
    }

    private Aluno createAlunoDirectly(String name, String email) {
        UserRole role = roleRepository.findUserRoleByName("ROLE_ALUNO")
                .orElseThrow(() -> new IllegalStateException("ROLE_ALUNO não encontrada."));
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setActive(true);
        user.setRoles(Set.of(role));
        Aluno aluno = new Aluno();
        aluno.setUser(userRepository.save(user));
        aluno.setMatricula("MAT-" + email.hashCode());
        aluno.setSexo("Feminino");
        return alunoRepository.save(aluno);
    }

    private Turma createTurmaDirectly(String nome) {
        Turma turma = new Turma();
        turma.setNome(nome);
        turma.setAno(1);
        turma.setTurno(Turno.MATUTINO);
        turma.setEnsino(Ensino.FUNDAMENTAL);
        turma.setQntAlunos(30);
        turma.setActive(true);
        return turmaRepository.save(turma);
    }

    private void linkProfTurma(Professor professor, Turma turma) {
        ProfTurma pt = new ProfTurma();
        pt.setProfessor(professor);
        pt.setTurma(turma);
        profTurmaRepository.save(pt);
    }

    private void linkAlunoTurma(Aluno aluno, Turma turma) {
        AlunoTurma at = new AlunoTurma();
        at.setAluno(aluno);
        at.setTurma(turma);
        alunoTurmaRepository.save(at);
    }

    private Prova createProvaDirectly(Professor professor, Turma turma, StatusProva status, String titulo, String disciplina) {
        Prova prova = new Prova();
        prova.setTitulo(titulo);
        prova.setDisciplina(disciplina);
        prova.setDescricao("Desc");
        prova.setQntQuestoes(1);
        prova.setStatus(status);
        prova.setProfessor(professor);
        prova.setTurma(turma);
        return provaRepository.save(prova);
    }

    private void createRespostaDirectly(Aluno aluno, Prova prova, int totalQuestoes, int totalAcertos, BigDecimal nota) {
        RespostaAluno r = new RespostaAluno();
        r.setAluno(aluno);
        r.setProva(prova);
        r.setTotalQuestoes(totalQuestoes);
        r.setTotalAcertos(totalAcertos);
        r.setNotaFinal(nota);
        respostaAlunoRepository.save(r);
    }
}
