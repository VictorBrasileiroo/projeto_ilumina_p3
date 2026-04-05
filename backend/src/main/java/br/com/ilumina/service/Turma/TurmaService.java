package br.com.ilumina.service.Turma;

import br.com.ilumina.dto.turma.CreateTurmaRequest;
import br.com.ilumina.dto.turma.TurmaProfessorResponse;
import br.com.ilumina.dto.turma.TurmaResponse;
import br.com.ilumina.dto.turma.UpdateTurmaRequest;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Turma.ProfTurma;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.exception.BusinessException;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Turma.ProfTurmaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final ProfTurmaRepository profTurmaRepository;
    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;

    public TurmaService(
            TurmaRepository turmaRepository,
            ProfTurmaRepository profTurmaRepository,
            ProfessorRepository professorRepository,
            UserRepository userRepository
    ) {
        this.turmaRepository = turmaRepository;
        this.profTurmaRepository = profTurmaRepository;
        this.professorRepository = professorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TurmaResponse create(CreateTurmaRequest request, String currentUserEmail, boolean isAdmin) {
        Turma turma = new Turma();
        turma.setNome(normalizeRequired(request.nome(), "O nome da turma é obrigatório."));
        turma.setAno(request.ano());
        turma.setTurno(request.turno());
        turma.setEnsino(request.ensino());
        turma.setQntAlunos(request.qntAlunos());
        turma.setActive(true);

        Turma savedTurma = turmaRepository.save(turma);

        Optional<Professor> currentProfessor = resolveCurrentProfessorByEmail(currentUserEmail);
        if (currentProfessor.isPresent()) {
            addProfessorToTurma(currentProfessor.get(), savedTurma);
        } else if (!isAdmin) {
            throw new BusinessException("Usuário autenticado não possui perfil de professor.");
        }

        return toResponse(savedTurma);
    }

    @Transactional(readOnly = true)
    public List<TurmaResponse> findAll(boolean includeInactive, String currentUserEmail, boolean isAdmin) {
        List<Turma> turmas;

        if (isAdmin) {
            turmas = includeInactive
                    ? turmaRepository.findAllByOrderByCreatedAtDesc()
                    : turmaRepository.findByActiveTrueOrderByCreatedAtDesc();
        } else {
            Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);

            turmas = profTurmaRepository.findByProfessor_Id(currentProfessor.getId())
                    .stream()
                    .map(ProfTurma::getTurma)
                    .distinct()
                    .filter(turma -> includeInactive || turma.isActive())
                    .sorted(Comparator.comparing(Turma::getCreatedAt).reversed())
                    .toList();
        }

        return turmas.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TurmaResponse findById(UUID turmaId, String currentUserEmail, boolean isAdmin) {
        Turma turma = findTurmaById(turmaId);
        validateTurmaAccess(turmaId, currentUserEmail, isAdmin);
        return toResponse(turma);
    }

    @Transactional
    public TurmaResponse update(
            UUID turmaId,
            UpdateTurmaRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Turma turma = findTurmaById(turmaId);
        validateTurmaAccess(turmaId, currentUserEmail, isAdmin);
        validateTurmaIsActive(turma, "Turma desativada não pode ser atualizada.");

        if (request.nome() != null) {
            turma.setNome(normalizeRequired(request.nome(), "O nome da turma não pode ser vazio."));
        }

        if (request.ano() != null) {
            turma.setAno(request.ano());
        }

        if (request.turno() != null) {
            turma.setTurno(request.turno());
        }

        if (request.ensino() != null) {
            turma.setEnsino(request.ensino());
        }

        if (request.qntAlunos() != null) {
            turma.setQntAlunos(request.qntAlunos());
        }

        Turma savedTurma = turmaRepository.save(turma);
        return toResponse(savedTurma);
    }

    @Transactional
    public TurmaResponse deactivate(UUID turmaId, String currentUserEmail, boolean isAdmin) {
        Turma turma = findTurmaById(turmaId);
        validateTurmaAccess(turmaId, currentUserEmail, isAdmin);

        if (!turma.isActive()) {
            throw new BusinessException("Turma já está desativada.");
        }

        turma.setActive(false);
        Turma savedTurma = turmaRepository.save(turma);
        return toResponse(savedTurma);
    }

    @Transactional
    public TurmaResponse join(UUID turmaId, UUID professorId, String currentUserEmail) {
        Turma turma = findTurmaById(turmaId);
        validateTurmaIsActive(turma, "Turma desativada não aceita novos vínculos.");
        Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);

        if (!currentProfessor.getId().equals(professorId)) {
            throw new AccessDeniedException("Acesso negado.");
        }

        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado."));

        if (profTurmaRepository.existsByProfessor_IdAndTurma_Id(professorId, turmaId)) {
            throw new BusinessException("Professor já está vinculado a esta turma.");
        }

        addProfessorToTurma(professor, turma);
        return toResponse(turma);
    }

    @Transactional
    public TurmaResponse leave(UUID turmaId, UUID professorId, String currentUserEmail) {
        Turma turma = findTurmaById(turmaId);
        Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);

        if (!currentProfessor.getId().equals(professorId)) {
            throw new AccessDeniedException("Acesso negado.");
        }

        if (!professorRepository.existsById(professorId)) {
            throw new ResourceNotFoundException("Professor não encontrado.");
        }

        if (!profTurmaRepository.existsByProfessor_IdAndTurma_Id(professorId, turmaId)) {
            throw new BusinessException("Professor não está vinculado a esta turma.");
        }

        profTurmaRepository.deleteByProfessor_IdAndTurma_Id(professorId, turmaId);
        return toResponse(turma);
    }

    private Turma findTurmaById(UUID turmaId) {
        return turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada."));
    }

    private void validateTurmaAccess(UUID turmaId, String currentUserEmail, boolean isAdmin) {
        if (isAdmin) {
            return;
        }

        Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);
        if (!profTurmaRepository.existsByProfessor_IdAndTurma_Id(currentProfessor.getId(), turmaId)) {
            throw new AccessDeniedException("Acesso negado.");
        }
    }

    private void validateTurmaIsActive(Turma turma, String message) {
        if (!turma.isActive()) {
            throw new BusinessException(message);
        }
    }

    private Optional<Professor> resolveCurrentProfessorByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .map(User::getId)
                .flatMap(professorRepository::findByUserId);
    }

    private Professor resolveCurrentProfessorRequiredByEmail(String email) {
        return resolveCurrentProfessorByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Acesso negado."));
    }

    private void addProfessorToTurma(Professor professor, Turma turma) {
        ProfTurma profTurma = new ProfTurma();
        profTurma.setProfessor(professor);
        profTurma.setTurma(turma);
        profTurmaRepository.save(profTurma);
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private TurmaResponse toResponse(Turma turma) {
        List<TurmaProfessorResponse> professores = profTurmaRepository.findByTurma_IdOrderByCreatedAtAsc(turma.getId())
                .stream()
                .map(ProfTurma::getProfessor)
                .map(professor -> new TurmaProfessorResponse(
                        professor.getId(),
                        professor.getUser().getName(),
                        professor.getUser().getEmail(),
                        professor.getUser().isActive()
                ))
                .toList();

        return new TurmaResponse(
                turma.getId(),
                turma.getNome(),
                turma.getAno(),
                turma.getTurno(),
                turma.getEnsino(),
                turma.getQntAlunos(),
                turma.isActive(),
                turma.getCreatedAt(),
                professores
        );
    }
}
