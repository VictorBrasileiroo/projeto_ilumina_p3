package br.com.ilumina.controller.Prova;

import br.com.ilumina.dto.prova.RespostaItemRequest;
import br.com.ilumina.dto.prova.SubmissaoRespostasRequest;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Prova.Alternativa;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.Questao;
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
import br.com.ilumina.repository.Prova.AlternativaRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Prova.QuestaoRepository;
import br.com.ilumina.repository.Prova.RespostaAlunoRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AlunoProvaControllerIntegrationTest {

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
        alternativaRepository.deleteAll();
        questaoRepository.deleteAll();
        provaRepository.deleteAll();
        alunoTurmaRepository.deleteAll();
        turmaRepository.deleteAll();
        alunoRepository.deleteAll();
        professorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void listarProvasAlunoShouldReturnOnlyPublishedFromOwnTurmas() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Lista", "aluno.lista@ilumina.com", "MAT-LISTA", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Lista", "prof.lista@ilumina.com", "História", "Masculino", true);

        Turma turmaDoAluno = createTurmaDirectly("Turma Aluno", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 25, true);
        Turma outraTurma = createTurmaDirectly("Turma Outra", 1, Turno.VESPERTINO, Ensino.FUNDAMENTAL, 25, true);

        linkAlunoTurma(aluno, turmaDoAluno);

        Prova provaPublicadaDaTurma = createProvaDirectly(professor, turmaDoAluno, StatusProva.PUBLICADA, "Prova Visível");
        createProvaDirectly(professor, turmaDoAluno, StatusProva.RASCUNHO, "Prova Rascunho");
        createProvaDirectly(professor, outraTurma, StatusProva.PUBLICADA, "Prova Outra Turma");

        mockMvc.perform(get("/api/v1/aluno/provas")
                        .with(user("aluno.lista@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(provaPublicadaDaTurma.getId().toString()))
                .andExpect(jsonPath("$.data[0].jaRespondeu").value(false));
    }

    @Test
    void listarProvasAlunoSemTurmasShouldReturnEmpty() throws Exception {
        createAlunoDirectly("Aluno Sem Turma", "aluno.sem.turma@ilumina.com", "MAT-SEM", "Masculino", true);

        mockMvc.perform(get("/api/v1/aluno/provas")
                        .with(user("aluno.sem.turma@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void detalharProvaAlunoShouldReturnOkWithoutGabarito() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Detalhe", "aluno.detalhe@ilumina.com", "MAT-DET", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Detalhe", "prof.detalhe@ilumina.com", "Geografia", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Detalhe", 2, Turno.MATUTINO, Ensino.FUNDAMENTAL, 30, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Detalhe");
        Questao questao = createQuestaoDirectly(prova, "Capital do Brasil?", "B", 1, new BigDecimal("2.00"));
        createAlternativaDirectly(questao, "A", "Rio de Janeiro");
        createAlternativaDirectly(questao, "B", "Brasília");
        createAlternativaDirectly(questao, "C", "São Paulo");
        createAlternativaDirectly(questao, "D", "Belo Horizonte");

        mockMvc.perform(get("/api/v1/aluno/provas/{id}", prova.getId())
                        .with(user("aluno.detalhe@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.questoes.length()").value(1))
                .andExpect(jsonPath("$.data.questoes[0].alternativas.length()").value(4))
                .andExpect(jsonPath("$.data.questoes[0].gabarito").doesNotExist());
    }

    @Test
    void detalharProvaDeOutraTurmaShouldReturnForbidden() throws Exception {
        createAlunoDirectly("Aluno Fora", "aluno.fora@ilumina.com", "MAT-FORA", "Masculino", true);
        Professor professor = createProfessorDirectly("Professor Fora", "prof.fora@ilumina.com", "História", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Restrita", 2, Turno.VESPERTINO, Ensino.MEDIO, 30, true);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Restrita");

        mockMvc.perform(get("/api/v1/aluno/provas/{id}", prova.getId())
                        .with(user("aluno.fora@ilumina.com").roles("ALUNO")))
                .andExpect(status().isForbidden());
    }

    @Test
    void professorTryingAlunoEndpointShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/aluno/provas")
                        .with(user("prof@ilumina.com").roles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void alunoTryingProfessorEndpointShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/provas")
                        .with(user("aluno@ilumina.com").roles("ALUNO")))
                .andExpect(status().isForbidden());
    }

    @Test
    void submeterRespostasValidasShouldReturnCreated() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Submeter", "aluno.submeter@ilumina.com", "MAT-SUB", "Masculino", true);
        Professor professor = createProfessorDirectly("Professor Submeter", "prof.submeter@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Submeter", 3, Turno.MATUTINO, Ensino.MEDIO, 32, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Submissão");

        Questao q1 = createQuestaoDirectly(prova, "2 + 2 = ?", "B", 1, new BigDecimal("2.00"));
        createAlternativaDirectly(q1, "A", "3");
        createAlternativaDirectly(q1, "B", "4");
        createAlternativaDirectly(q1, "C", "5");
        createAlternativaDirectly(q1, "D", "6");

        Questao q2 = createQuestaoDirectly(prova, "3 + 3 = ?", "C", 2, new BigDecimal("3.00"));
        createAlternativaDirectly(q2, "A", "4");
        createAlternativaDirectly(q2, "B", "5");
        createAlternativaDirectly(q2, "C", "6");
        createAlternativaDirectly(q2, "D", "7");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "B"),
                new RespostaItemRequest(q2.getId(), "A")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.submeter@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalQuestoes").value(2))
                .andExpect(jsonPath("$.data.totalAcertos").value(1))
                .andExpect(jsonPath("$.data.notaFinal").value(2.0))
                .andExpect(jsonPath("$.data.questoes[0].gabarito").exists());
    }

    @Test
    void submeterRespostaComLetraInvalidaShouldReturnBadRequest() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Letra", "aluno.letra@ilumina.com", "MAT-LET", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Letra", "prof.letra@ilumina.com", "Matemática", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Letra", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 28, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Letra");
        Questao q1 = createQuestaoDirectly(prova, "Pergunta", "A", 1, new BigDecimal("1.00"));
        createAlternativaDirectly(q1, "A", "Alt A");
        createAlternativaDirectly(q1, "B", "Alt B");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "Z")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.letra@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submeterSemResponderTodasQuestoesShouldReturnBadRequest() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Incompleto", "aluno.incompleto@ilumina.com", "MAT-INC", "Masculino", true);
        Professor professor = createProfessorDirectly("Professor Incompleto", "prof.incompleto@ilumina.com", "História", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Incompleto", 2, Turno.MATUTINO, Ensino.MEDIO, 31, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Incompleta");
        Questao q1 = createQuestaoDirectly(prova, "Q1", "A", 1, new BigDecimal("1.00"));
        Questao q2 = createQuestaoDirectly(prova, "Q2", "B", 2, new BigDecimal("1.00"));
        createAlternativaDirectly(q1, "A", "Alt A");
        createAlternativaDirectly(q1, "B", "Alt B");
        createAlternativaDirectly(q2, "A", "Alt A");
        createAlternativaDirectly(q2, "B", "Alt B");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "A")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.incompleto@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submeterComQuestaoDeOutraProvaShouldReturnBadRequest() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Outra Questão", "aluno.questao.outra@ilumina.com", "MAT-QO", "Masculino", true);
        Professor professor = createProfessorDirectly("Professor Outra Questão", "prof.questao.outra@ilumina.com", "Biologia", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma QO", 2, Turno.VESPERTINO, Ensino.MEDIO, 29, true);
        linkAlunoTurma(aluno, turma);

        Prova prova1 = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova 1");
        Questao q1 = createQuestaoDirectly(prova1, "Q1", "A", 1, new BigDecimal("1.00"));
        createAlternativaDirectly(q1, "A", "Alt A");
        createAlternativaDirectly(q1, "B", "Alt B");

        Questao q2 = createQuestaoDirectly(prova1, "Q2", "B", 2, new BigDecimal("1.00"));
        createAlternativaDirectly(q2, "A", "Alt A");
        createAlternativaDirectly(q2, "B", "Alt B");

        Prova prova2 = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova 2");
        Questao qOutraProva = createQuestaoDirectly(prova2, "QX", "A", 1, new BigDecimal("1.00"));
        createAlternativaDirectly(qOutraProva, "A", "Alt A");
        createAlternativaDirectly(qOutraProva, "B", "Alt B");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "A"),
                new RespostaItemRequest(qOutraProva.getId(), "A")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova1.getId())
                        .with(user("aluno.questao.outra@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submeterPelaSegundaVezShouldReturnConflict() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Duplicado", "aluno.duplicado@ilumina.com", "MAT-DUP", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Duplicado", "prof.duplicado@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Duplicado", 3, Turno.MATUTINO, Ensino.MEDIO, 30, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Duplicada");
        Questao q1 = createQuestaoDirectly(prova, "Q1", "A", 1, new BigDecimal("1.00"));
        createAlternativaDirectly(q1, "A", "Alt A");
        createAlternativaDirectly(q1, "B", "Alt B");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "A")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.duplicado@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.duplicado@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void consultarResultadoAposSubmissaoShouldReturnOk() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Resultado", "aluno.resultado@ilumina.com", "MAT-RES", "Masculino", true);
        Professor professor = createProfessorDirectly("Professor Resultado", "prof.resultado@ilumina.com", "Matemática", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Resultado", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 27, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Resultado");
        Questao q1 = createQuestaoDirectly(prova, "Q1", "B", 1, new BigDecimal("2.00"));
        createAlternativaDirectly(q1, "A", "Alt A");
        createAlternativaDirectly(q1, "B", "Alt B");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "B")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.resultado@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/aluno/provas/{id}/resultado", prova.getId())
                        .with(user("aluno.resultado@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAcertos").value(1))
                .andExpect(jsonPath("$.data.questoes[0].gabarito").value("B"));
    }

    @Test
    void consultarResultadoSemSubmissaoShouldReturnNotFound() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Sem Resultado", "aluno.sem.resultado@ilumina.com", "MAT-SR", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Sem Resultado", "prof.sem.resultado@ilumina.com", "Geografia", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Sem Resultado", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 20, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Sem Resultado");

        mockMvc.perform(get("/api/v1/aluno/provas/{id}/resultado", prova.getId())
                        .with(user("aluno.sem.resultado@ilumina.com").roles("ALUNO")))
                .andExpect(status().isNotFound());
    }

    @Test
    void consultarResultadoMesmoAposDespublicarShouldReturnOk() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Despublicado", "aluno.despublicado@ilumina.com", "MAT-DESP", "Masculino", true);
        Professor professor = createProfessorDirectly("Professor Despublicado", "prof.despublicado@ilumina.com", "História", "Feminino", true);
        Turma turma = createTurmaDirectly("Turma Despublicado", 2, Turno.VESPERTINO, Ensino.MEDIO, 30, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.PUBLICADA, "Prova Despublicável");
        Questao q1 = createQuestaoDirectly(prova, "Q1", "A", 1, new BigDecimal("1.00"));
        createAlternativaDirectly(q1, "A", "Alt A");
        createAlternativaDirectly(q1, "B", "Alt B");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "A")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.despublicado@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        prova.setStatus(StatusProva.RASCUNHO);
        provaRepository.save(prova);

        mockMvc.perform(get("/api/v1/aluno/provas/{id}/resultado", prova.getId())
                        .with(user("aluno.despublicado@ilumina.com").roles("ALUNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAcertos").value(1));
    }

    @Test
    void submeterProvaNaoPublicadaShouldReturnForbidden() throws Exception {
        Aluno aluno = createAlunoDirectly("Aluno Rascunho", "aluno.rascunho@ilumina.com", "MAT-RAS", "Feminino", true);
        Professor professor = createProfessorDirectly("Professor Rascunho", "prof.rascunho@ilumina.com", "Matemática", "Masculino", true);
        Turma turma = createTurmaDirectly("Turma Rascunho", 1, Turno.MATUTINO, Ensino.FUNDAMENTAL, 22, true);
        linkAlunoTurma(aluno, turma);

        Prova prova = createProvaDirectly(professor, turma, StatusProva.RASCUNHO, "Prova Rascunho");
        Questao q1 = createQuestaoDirectly(prova, "Q1", "A", 1, new BigDecimal("1.00"));
        createAlternativaDirectly(q1, "A", "Alt A");
        createAlternativaDirectly(q1, "B", "Alt B");

        SubmissaoRespostasRequest request = new SubmissaoRespostasRequest(List.of(
                new RespostaItemRequest(q1.getId(), "A")
        ));

        mockMvc.perform(post("/api/v1/aluno/provas/{id}/respostas", prova.getId())
                        .with(user("aluno.rascunho@ilumina.com").roles("ALUNO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
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

    private Prova createProvaDirectly(
            Professor professor,
            Turma turma,
            StatusProva status,
            String titulo
    ) {
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

    private Questao createQuestaoDirectly(
            Prova prova,
            String enunciado,
            String gabarito,
            int ordem,
            BigDecimal pontuacao
    ) {
        Questao questao = new Questao();
        questao.setProva(prova);
        questao.setEnunciado(enunciado);
        questao.setGabarito(gabarito);
        questao.setPontuacao(pontuacao);
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
