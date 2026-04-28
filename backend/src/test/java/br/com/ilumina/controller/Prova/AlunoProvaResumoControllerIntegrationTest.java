package br.com.ilumina.controller.Prova;

import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.RespostaAluno;
import br.com.ilumina.entity.Prova.StatusProva;
import br.com.ilumina.entity.Turma.AlunoTurma;
import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.Turma.Turno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Prova.RespostaAlunoRepository;
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

import java.math.BigDecimal;
import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AlunoProvaResumoControllerIntegrationTest {

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
        turmaRepository.deleteAll();
        alunoRepository.deleteAll();
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void resumoSemTurmasShouldReturnZeroTotals() throws Exception {
        createAlunoDirectly("Aluno Vazio", "aluno.vazio@ilumina.com");

        mockMvc.perform(get("/api/v1/aluno/provas/resumo")
                        .with(user("aluno.vazio@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalProvas").value(0))
                .andExpect(jsonPath("$.data.totalRespondidas").value(0))
                .andExpect(jsonPath("$.data.totalPendentes").value(0))
                .andExpect(jsonPath("$.data.mediaNota").isEmpty())
                .andExpect(jsonPath("$.data.porDisciplina").isEmpty());
    }

    @Test
    void resumoComProvasPendentesShouldReturnCorrectCounts() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Pendente", "aluno.pendente@ilumina.com");
        Professor professor = createProfessorDirectly("Prof Pendente", "prof.pendente@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Pendente");
        linkAlunoTurma(aluno, turma);

        createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova 1", "Matemática");
        createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova 2", "Matemática");
        createProvaDirectly(professor, turma, StatusProva.RASCUNHO, "Rascunho", "Matemática");

        mockMvc.perform(get("/api/v1/aluno/provas/resumo")
                        .with(user("aluno.pendente@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalProvas").value(2))
                .andExpect(jsonPath("$.data.totalRespondidas").value(0))
                .andExpect(jsonPath("$.data.totalPendentes").value(2))
                .andExpect(jsonPath("$.data.mediaNota").isEmpty());
    }

    @Test
    void resumoComRespostasShouldReturnMediaAndCounts() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Respondeu", "aluno.respondeu@ilumina.com");
        Professor professor = createProfessorDirectly("Prof Respondeu", "prof.respondeu@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Respondeu");
        linkAlunoTurma(aluno, turma);

        Prova prova1 = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova 1", "Matemática");
        Prova prova2 = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova 2", "Matemática");

        createRespostaDirectly(aluno, prova1, 1, 1, new BigDecimal("8.00"));
        createRespostaDirectly(aluno, prova2, 1, 0, new BigDecimal("0.00"));

        mockMvc.perform(get("/api/v1/aluno/provas/resumo")
                        .with(user("aluno.respondeu@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalProvas").value(2))
                .andExpect(jsonPath("$.data.totalRespondidas").value(2))
                .andExpect(jsonPath("$.data.totalPendentes").value(0))
                .andExpect(jsonPath("$.data.mediaNota").value(4.00))
                .andExpect(jsonPath("$.data.porDisciplina.length()").value(1))
                .andExpect(jsonPath("$.data.porDisciplina[0].disciplina").value("Matemática"))
                .andExpect(jsonPath("$.data.porDisciplina[0].totalProvas").value(2))
                .andExpect(jsonPath("$.data.porDisciplina[0].totalRespondidas").value(2));
    }

    @Test
    void resumoAgrupaProvasPorDisciplina() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Disc", "aluno.disc@ilumina.com");
        Professor professor = createProfessorDirectly("Prof Disc", "prof.disc@ilumina.com");
        Turma turma = createTurmaDirectly("Turma Disc");
        linkAlunoTurma(aluno, turma);

        Prova p1 = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Mat 1", "Matemática");
        createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Hist 1", "História");

        createRespostaDirectly(aluno, p1, 1, 1, new BigDecimal("10.00"));

        mockMvc.perform(get("/api/v1/aluno/provas/resumo")
                        .with(user("aluno.disc@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalProvas").value(2))
                .andExpect(jsonPath("$.data.totalRespondidas").value(1))
                .andExpect(jsonPath("$.data.totalPendentes").value(1))
                .andExpect(jsonPath("$.data.porDisciplina.length()").value(2));
    }

    @Test
    void resumoNaoVeProvasDeOutraTurma() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Isolado", "aluno.isolado@ilumina.com");
        Professor professor = createProfessorDirectly("Prof Isolado", "prof.isolado@ilumina.com");
        Turma turmaSua = createTurmaDirectly("Turma Sua");
        Turma turmaOutra = createTurmaDirectly("Turma Outra");
        linkAlunoTurma(aluno, turmaSua);

        createProvaDirectly(professor, turmaSua, StatusProva.PUBLICADA, "Prova Visível", "Matemática");
        createProvaDirectly(professor, turmaOutra, StatusProva.PUBLICADA, "Prova Invisível", "Matemática");

        mockMvc.perform(get("/api/v1/aluno/provas/resumo")
                        .with(user("aluno.isolado@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalProvas").value(1));
    }

    @Test
    void professorNaoAcessaResumoAluno() throws Exception {
        mockMvc.perform(get("/api/v1/aluno/provas/resumo")
                        .with(user("prof@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
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
        aluno.setSexo("Masculino");
        return alunoRepository.save(aluno);
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
