package br.com.ilumina.service.Flashcard;

import br.com.ilumina.dto.flashcard.ColecaoAlunoResponse;
import br.com.ilumina.dto.flashcard.ColecaoDetalheAlunoResponse;
import br.com.ilumina.dto.flashcard.FlashcardAlunoResponse;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Flashcard.ColecoesFlashcard;
import br.com.ilumina.entity.Flashcard.Flashcard;
import br.com.ilumina.entity.Flashcard.StatusColecao;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Flashcard.ColecoesFlashcardRepository;
import br.com.ilumina.repository.Flashcard.FlashcardRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class AlunoFlashcardService {

    private final ColecoesFlashcardRepository colecoesFlashcardRepository;
    private final FlashcardRepository flashcardRepository;
    private final AlunoTurmaRepository alunoTurmaRepository;
    private final AlunoRepository alunoRepository;
    private final UserRepository userRepository;

    public AlunoFlashcardService(
            ColecoesFlashcardRepository colecoesFlashcardRepository,
            FlashcardRepository flashcardRepository,
            AlunoTurmaRepository alunoTurmaRepository,
            AlunoRepository alunoRepository,
            UserRepository userRepository
    ) {
        this.colecoesFlashcardRepository = colecoesFlashcardRepository;
        this.flashcardRepository = flashcardRepository;
        this.alunoTurmaRepository = alunoTurmaRepository;
        this.alunoRepository = alunoRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ColecaoAlunoResponse> listarColecoesParaAluno(String currentUserEmail) {
        Aluno aluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);

        List<UUID> turmaIds = alunoTurmaRepository.findByAluno_Id(aluno.getId())
                .stream()
                .map(vinculo -> vinculo.getTurma().getId())
                .distinct()
                .toList();

        if (turmaIds.isEmpty()) {
            return List.of();
        }

        return colecoesFlashcardRepository.findByTurmaIdInAndStatus(turmaIds, StatusColecao.PUBLICADA)
                .stream()
                .sorted(Comparator.comparing(ColecoesFlashcard::getCreatedAt).reversed())
                .map(this::toColecaoAlunoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ColecaoDetalheAlunoResponse detalharColecaoParaAluno(UUID colecaoId, String currentUserEmail) {
        Aluno aluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);

        ColecoesFlashcard colecao = colecoesFlashcardRepository.findById(colecaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Colecao nao encontrada."));

        validarAcessoColecaoParaAluno(colecao, aluno);

        List<FlashcardAlunoResponse> flashcards = flashcardRepository.findByColecao_IdOrderByOrdemAsc(colecaoId)
                .stream()
                .map(this::toFlashcardAlunoResponse)
                .toList();

        return new ColecaoDetalheAlunoResponse(
                colecao.getId(),
                colecao.getTitulo(),
                colecao.getTema(),
                flashcards.size(),
                colecao.getTurma().getNome(),
                flashcards
        );
    }

    private void validarAcessoColecaoParaAluno(ColecoesFlashcard colecao, Aluno aluno) {
        if (colecao.getStatus() != StatusColecao.PUBLICADA) {
            throw new AccessDeniedException("Acesso negado.");
        }

        if (!alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), colecao.getTurma().getId())) {
            throw new AccessDeniedException("Acesso negado.");
        }
    }

    private Aluno resolveCurrentAlunoRequiredByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Acesso negado.");
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .map(User::getId)
                .flatMap(alunoRepository::findByUserId)
                .orElseThrow(() -> new AccessDeniedException("Acesso negado."));
    }

    private ColecaoAlunoResponse toColecaoAlunoResponse(ColecoesFlashcard colecao) {
        long totalFlashcards = flashcardRepository.countByColecaoId(colecao.getId());

        return new ColecaoAlunoResponse(
                colecao.getId(),
                colecao.getTitulo(),
                colecao.getTema(),
                totalFlashcards,
                colecao.getTurma().getNome()
        );
    }

    private FlashcardAlunoResponse toFlashcardAlunoResponse(Flashcard flashcard) {
        return new FlashcardAlunoResponse(
                flashcard.getId(),
                flashcard.getTextoFrente(),
                flashcard.getTextoVerso(),
                flashcard.getOrdem()
        );
    }
}
