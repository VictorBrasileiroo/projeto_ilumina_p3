package br.com.ilumina.service.Flashcard;

import br.com.ilumina.dto.flashcard.ColecaoDetalheResponse;
import br.com.ilumina.dto.flashcard.ColecaoResponse;
import br.com.ilumina.dto.flashcard.CreateColecaoRequest;
import br.com.ilumina.dto.flashcard.CreateFlashcardRequest;
import br.com.ilumina.dto.flashcard.FlashcardResponse;
import br.com.ilumina.dto.flashcard.UpdateColecaoRequest;
import br.com.ilumina.dto.flashcard.UpdateFlashcardRequest;
import br.com.ilumina.entity.Flashcard.ColecoesFlashcard;
import br.com.ilumina.entity.Flashcard.Flashcard;
import br.com.ilumina.entity.Flashcard.StatusColecao;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.exception.BusinessException;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Flashcard.ColecoesFlashcardRepository;
import br.com.ilumina.repository.Flashcard.FlashcardRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Turma.ProfTurmaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class FlashcardService {

    private final ColecoesFlashcardRepository colecoesFlashcardRepository;
    private final FlashcardRepository flashcardRepository;
    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;
    private final ProfTurmaRepository profTurmaRepository;
    private final UserRepository userRepository;

    public FlashcardService(
            ColecoesFlashcardRepository colecoesFlashcardRepository,
            FlashcardRepository flashcardRepository,
            ProfessorRepository professorRepository,
            TurmaRepository turmaRepository,
            ProfTurmaRepository profTurmaRepository,
            UserRepository userRepository
    ) {
        this.colecoesFlashcardRepository = colecoesFlashcardRepository;
        this.flashcardRepository = flashcardRepository;
        this.professorRepository = professorRepository;
        this.turmaRepository = turmaRepository;
        this.profTurmaRepository = profTurmaRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ColecaoResponse criar(
            CreateColecaoRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Optional<Professor> currentProfessor = resolverProfessorPorEmail(currentUserEmail);
        if (currentProfessor.isEmpty()) {
            if (isAdmin) {
                throw new BusinessException("E necessario ter perfil de professor para criar colecoes.");
            }
            throw new AccessDeniedException("Acesso negado.");
        }

        Professor professor = currentProfessor.get();

        Turma turma = turmaRepository.findById(request.turmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma nao encontrada."));

        validarTurmaAtiva(turma);

        if (!profTurmaRepository.existsByProfessor_IdAndTurma_Id(professor.getId(), turma.getId())) {
            throw new BusinessException("Professor nao esta vinculado a turma informada.");
        }

        ColecoesFlashcard colecao = new ColecoesFlashcard();
        colecao.setTitulo(normalizeRequired(request.titulo(), "O titulo e obrigatorio."));
        colecao.setTema(normalizeOptional(request.tema()));
        colecao.setQntCards(request.qntCards());
        colecao.setStatus(StatusColecao.RASCUNHO);
        colecao.setProfessor(professor);
        colecao.setTurma(turma);

        ColecoesFlashcard saved = colecoesFlashcardRepository.save(colecao);
        return toColecaoResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ColecaoResponse> listarPorProfessor(String currentUserEmail, boolean isAdmin) {
        List<ColecoesFlashcard> colecoes;

        if (isAdmin) {
            colecoes = colecoesFlashcardRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            Professor professor = resolverProfessorObrigatorioPorEmail(currentUserEmail);
            colecoes = colecoesFlashcardRepository.findByProfessor_Id(professor.getId())
                    .stream()
                    .sorted(Comparator.comparing(ColecoesFlashcard::getCreatedAt).reversed())
                    .toList();
        }

        return colecoes.stream()
                .map(this::toColecaoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ColecaoDetalheResponse buscarDetalhePorId(UUID colecaoId, String currentUserEmail, boolean isAdmin) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);

        List<FlashcardResponse> flashcards = flashcardRepository.findByColecao_IdOrderByOrdemAsc(colecaoId)
                .stream()
                .map(this::toFlashcardResponse)
                .toList();

        return new ColecaoDetalheResponse(
                colecao.getId(),
                colecao.getTitulo(),
                colecao.getTema(),
                colecao.getQntCards(),
                colecao.getStatus(),
                colecao.getTurma().getNome(),
                flashcards.size(),
                colecao.getCreatedAt(),
                flashcards
        );
    }

    @Transactional
    public ColecaoResponse atualizar(
            UUID colecaoId,
            UpdateColecaoRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);
        verificarEditavel(colecao);

        if (request.titulo() != null) {
            colecao.setTitulo(normalizeRequired(request.titulo(), "O titulo nao pode ser vazio."));
        }

        if (request.tema() != null) {
            colecao.setTema(normalizeOptional(request.tema()));
        }

        if (request.qntCards() != null) {
            colecao.setQntCards(request.qntCards());
        }

        ColecoesFlashcard saved = colecoesFlashcardRepository.save(colecao);
        return toColecaoResponse(saved);
    }

    @Transactional
    public ColecaoResponse publicar(UUID colecaoId, String currentUserEmail, boolean isAdmin) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);

        if (colecao.getStatus() != StatusColecao.RASCUNHO) {
            throw new BusinessException("Colecao ja esta publicada.");
        }

        validarColecaoParaPublicacao(colecao.getId());

        colecao.setStatus(StatusColecao.PUBLICADA);
        ColecoesFlashcard saved = colecoesFlashcardRepository.save(colecao);

        return toColecaoResponse(saved);
    }

    @Transactional
    public ColecaoResponse despublicar(UUID colecaoId, String currentUserEmail, boolean isAdmin) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);

        if (colecao.getStatus() != StatusColecao.PUBLICADA) {
            throw new BusinessException("Colecao ja esta em rascunho.");
        }

        colecao.setStatus(StatusColecao.RASCUNHO);
        ColecoesFlashcard saved = colecoesFlashcardRepository.save(colecao);

        return toColecaoResponse(saved);
    }

    @Transactional
    public void excluirColecao(UUID colecaoId, String currentUserEmail, boolean isAdmin) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);
        colecoesFlashcardRepository.delete(colecao);
    }

    @Transactional
    public FlashcardResponse adicionarFlashcard(
            UUID colecaoId,
            CreateFlashcardRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);
        verificarEditavel(colecao);

        Flashcard flashcard = new Flashcard();
        flashcard.setTextoFrente(normalizeRequired(request.textoFrente(), "O texto da frente e obrigatorio."));
        flashcard.setTextoVerso(normalizeRequired(request.textoVerso(), "O texto do verso e obrigatorio."));
        flashcard.setOrdem(resolverProximaOrdem(colecaoId));
        flashcard.setColecao(colecao);

        Flashcard saved = flashcardRepository.save(flashcard);
        return toFlashcardResponse(saved);
    }

    @Transactional
    public FlashcardResponse editarFlashcard(
            UUID colecaoId,
            UUID flashcardId,
            UpdateFlashcardRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);
        verificarEditavel(colecao);

        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard nao encontrado."));

        validarFlashcardPertenceAColecao(flashcard, colecaoId);

        flashcard.setTextoFrente(normalizeRequired(request.textoFrente(), "O texto da frente e obrigatorio."));
        flashcard.setTextoVerso(normalizeRequired(request.textoVerso(), "O texto do verso e obrigatorio."));

        Flashcard saved = flashcardRepository.save(flashcard);
        return toFlashcardResponse(saved);
    }

    @Transactional
    public void removerFlashcard(
            UUID colecaoId,
            UUID flashcardId,
            String currentUserEmail,
            boolean isAdmin
    ) {
        ColecoesFlashcard colecao = buscarColecaoPorId(colecaoId);
        validarOwnership(colecao, currentUserEmail, isAdmin);
        verificarEditavel(colecao);

        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard nao encontrado."));

        validarFlashcardPertenceAColecao(flashcard, colecaoId);
        flashcardRepository.delete(flashcard);
    }

    private void validarColecaoParaPublicacao(UUID colecaoId) {
        List<Flashcard> flashcards = flashcardRepository.findByColecao_IdOrderByOrdemAsc(colecaoId);
        if (flashcards.isEmpty()) {
            throw new BusinessException("Colecao sem flashcards nao pode ser publicada.");
        }

        for (Flashcard flashcard : flashcards) {
            if (flashcard.getTextoFrente() == null || flashcard.getTextoFrente().isBlank()) {
                throw new BusinessException("Todos os flashcards devem ter frente e verso preenchidos para publicar.");
            }
            if (flashcard.getTextoVerso() == null || flashcard.getTextoVerso().isBlank()) {
                throw new BusinessException("Todos os flashcards devem ter frente e verso preenchidos para publicar.");
            }
        }
    }

    private int resolverProximaOrdem(UUID colecaoId) {
        return flashcardRepository.findByColecao_IdOrderByOrdemAsc(colecaoId)
                .stream()
                .map(Flashcard::getOrdem)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }

    private void validarFlashcardPertenceAColecao(Flashcard flashcard, UUID colecaoId) {
        if (!flashcard.getColecao().getId().equals(colecaoId)) {
            throw new ResourceNotFoundException("Flashcard nao pertence a colecao informada.");
        }
    }

    private void verificarEditavel(ColecoesFlashcard colecao) {
        if (colecao.getStatus() != StatusColecao.RASCUNHO) {
            throw new BusinessException("Colecao publicada nao pode ser editada. Despublique-a primeiro.");
        }
    }

    private void validarOwnership(ColecoesFlashcard colecao, String currentUserEmail, boolean isAdmin) {
        if (isAdmin) {
            return;
        }

        Professor professor = resolverProfessorObrigatorioPorEmail(currentUserEmail);
        if (!colecao.getProfessor().getId().equals(professor.getId())) {
            throw new AccessDeniedException("Acesso negado.");
        }
    }

    private void validarTurmaAtiva(Turma turma) {
        if (!turma.isActive()) {
            throw new BusinessException("Turma inativa nao pode receber colecoes.");
        }
    }

    private ColecoesFlashcard buscarColecaoPorId(UUID colecaoId) {
        return colecoesFlashcardRepository.findById(colecaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Colecao nao encontrada."));
    }

    private Optional<Professor> resolverProfessorPorEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .map(User::getId)
                .flatMap(professorRepository::findByUserId);
    }

    private Professor resolverProfessorObrigatorioPorEmail(String email) {
        return resolverProfessorPorEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Acesso negado."));
    }

    private ColecaoResponse toColecaoResponse(ColecoesFlashcard colecao) {
        long totalFlashcards = flashcardRepository.countByColecaoId(colecao.getId());

        return new ColecaoResponse(
                colecao.getId(),
                colecao.getTitulo(),
                colecao.getTema(),
                colecao.getQntCards(),
                colecao.getStatus(),
                colecao.getTurma().getNome(),
                totalFlashcards,
                colecao.getCreatedAt()
        );
    }

    private FlashcardResponse toFlashcardResponse(Flashcard flashcard) {
        return new FlashcardResponse(
                flashcard.getId(),
                flashcard.getTextoFrente(),
                flashcard.getTextoVerso(),
                flashcard.getOrdem()
        );
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
