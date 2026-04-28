package br.com.ilumina.service.Busca;

import br.com.ilumina.dto.busca.BuscaGlobalResponse;
import br.com.ilumina.dto.busca.BuscaItemResponse;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Flashcard.ColecoesFlashcard;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Flashcard.ColecoesFlashcardRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class BuscaService {

    private static final int LIMITE_POR_CATEGORIA = 8;

    private final UserRepository userRepository;
    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;
    private final ProvaRepository provaRepository;
    private final ColecoesFlashcardRepository colecoesFlashcardRepository;

    public BuscaService(
            UserRepository userRepository,
            ProfessorRepository professorRepository,
            AlunoRepository alunoRepository,
            TurmaRepository turmaRepository,
            ProvaRepository provaRepository,
            ColecoesFlashcardRepository colecoesFlashcardRepository
    ) {
        this.userRepository = userRepository;
        this.professorRepository = professorRepository;
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.provaRepository = provaRepository;
        this.colecoesFlashcardRepository = colecoesFlashcardRepository;
    }

    @Transactional(readOnly = true)
    public BuscaGlobalResponse buscar(String q, Authentication authentication) {
        String termo = q == null ? "" : q.trim();
        if (termo.isEmpty()) {
            return new BuscaGlobalResponse(
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList()
            );
        }

        Pageable limite = PageRequest.of(0, LIMITE_POR_CATEGORIA);

        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isProfessor = hasRole(authentication, "ROLE_PROFESSOR");
        boolean isAluno = hasRole(authentication, "ROLE_ALUNO");

        if (isAdmin) {
            return buscarAdmin(termo, limite);
        }

        if (isProfessor) {
            return buscarProfessor(termo, authentication.getName(), limite);
        }

        if (isAluno) {
            return buscarAluno(termo, authentication.getName(), limite);
        }

        return new BuscaGlobalResponse(
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList()
        );
    }

    private BuscaGlobalResponse buscarAdmin(String q, Pageable limite) {
        List<BuscaItemResponse> turmas = turmaRepository.searchAtivasByNome(q, limite)
                .stream().map(this::toTurmaItem).toList();
        List<BuscaItemResponse> provas = provaRepository.searchByTituloOuDisciplina(q, limite)
                .stream().map(this::toProvaItem).toList();
        List<BuscaItemResponse> colecoes = colecoesFlashcardRepository.searchByTituloOuTema(q, limite)
                .stream().map(this::toColecaoItem).toList();
        List<BuscaItemResponse> alunos = alunoRepository.searchAtivosByNomeOuMatricula(q, limite)
                .stream().map(this::toAlunoItem).toList();

        return new BuscaGlobalResponse(turmas, provas, colecoes, alunos);
    }

    private BuscaGlobalResponse buscarProfessor(String q, String email, Pageable limite) {
        Professor professor = resolverProfessor(email);
        if (professor == null) {
            return new BuscaGlobalResponse(
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList()
            );
        }

        List<BuscaItemResponse> turmas = turmaRepository
                .searchAtivasByNomeAndProfessor(q, professor.getId(), limite)
                .stream().map(this::toTurmaItem).toList();
        List<BuscaItemResponse> provas = provaRepository
                .searchByTituloOuDisciplinaAndProfessor(q, professor.getId(), limite)
                .stream().map(this::toProvaItem).toList();
        List<BuscaItemResponse> colecoes = colecoesFlashcardRepository
                .searchByTituloOuTemaAndProfessor(q, professor.getId(), limite)
                .stream().map(this::toColecaoItem).toList();
        List<BuscaItemResponse> alunos = alunoRepository
                .searchAtivosByNomeOuMatriculaAndProfessor(q, professor.getId(), limite)
                .stream().map(this::toAlunoItem).toList();

        return new BuscaGlobalResponse(turmas, provas, colecoes, alunos);
    }

    private BuscaGlobalResponse buscarAluno(String q, String email, Pageable limite) {
        Aluno aluno = resolverAluno(email);
        if (aluno == null) {
            return new BuscaGlobalResponse(
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList()
            );
        }

        List<BuscaItemResponse> turmas = turmaRepository
                .searchAtivasByNomeAndAluno(q, aluno.getId(), limite)
                .stream().map(this::toTurmaItem).toList();
        List<BuscaItemResponse> provas = provaRepository
                .searchPublicadasParaAluno(q, aluno.getId(), limite)
                .stream().map(this::toProvaItem).toList();
        List<BuscaItemResponse> colecoes = colecoesFlashcardRepository
                .searchPublicadasParaAluno(q, aluno.getId(), limite)
                .stream().map(this::toColecaoItem).toList();

        return new BuscaGlobalResponse(turmas, provas, colecoes, Collections.emptyList());
    }

    private Professor resolverProfessor(String email) {
        return userRepository.findByEmail(email)
                .flatMap(user -> professorRepository.findByUserId(user.getId()))
                .orElse(null);
    }

    private Aluno resolverAluno(String email) {
        return userRepository.findByEmail(email)
                .flatMap(user -> alunoRepository.findByUserId(user.getId()))
                .orElse(null);
    }

    private boolean hasRole(Authentication authentication, String role) {
        if (authentication == null) {
            return false;
        }
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private BuscaItemResponse toTurmaItem(Turma turma) {
        String subtitulo = String.format("Turma %s", turma.getEnsino() != null ? turma.getEnsino().name().toLowerCase() : "");
        return new BuscaItemResponse(turma.getId(), "TURMA", turma.getNome(), subtitulo.trim());
    }

    private BuscaItemResponse toProvaItem(Prova prova) {
        String subtitulo = prova.getDisciplina() != null && !prova.getDisciplina().isBlank()
                ? prova.getDisciplina()
                : "Sem disciplina";
        return new BuscaItemResponse(prova.getId(), "PROVA", prova.getTitulo(), subtitulo);
    }

    private BuscaItemResponse toColecaoItem(ColecoesFlashcard colecao) {
        String subtitulo = colecao.getTema() != null && !colecao.getTema().isBlank()
                ? colecao.getTema()
                : "Sem tema";
        return new BuscaItemResponse(colecao.getId(), "COLECAO", colecao.getTitulo(), subtitulo);
    }

    private BuscaItemResponse toAlunoItem(Aluno aluno) {
        User user = aluno.getUser();
        String nome = user != null ? user.getName() : "(sem nome)";
        String matricula = aluno.getMatricula() != null ? aluno.getMatricula() : "";
        return new BuscaItemResponse(aluno.getId(), "ALUNO", nome, matricula);
    }
}
