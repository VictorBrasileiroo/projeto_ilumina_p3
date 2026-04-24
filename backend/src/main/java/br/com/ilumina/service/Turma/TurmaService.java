package br.com.ilumina.service.Turma;

import br.com.ilumina.dto.aluno.AlunoResponse;
import br.com.ilumina.dto.turma.CreateTurmaRequest;
import br.com.ilumina.dto.turma.TurmaProfessorResponse;
import br.com.ilumina.dto.turma.TurmaResponse;
import br.com.ilumina.dto.turma.TurmaResumoResponse;
import br.com.ilumina.dto.turma.TurmaResumoResponse.MediaPorProvaItem;
import br.com.ilumina.dto.turma.UpdateTurmaRequest;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.RespostaAluno;
import br.com.ilumina.entity.Prova.StatusProva;
import br.com.ilumina.entity.Turma.AlunoTurma;
import br.com.ilumina.entity.Turma.ProfTurma;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.exception.BusinessException;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Prova.RespostaAlunoRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
import br.com.ilumina.repository.Turma.ProfTurmaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final AlunoTurmaRepository alunoTurmaRepository;
    private final ProfTurmaRepository profTurmaRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;
    private final ProvaRepository provaRepository;
    private final RespostaAlunoRepository respostaAlunoRepository;

    public TurmaService(
            TurmaRepository turmaRepository,
            AlunoTurmaRepository alunoTurmaRepository,
            ProfTurmaRepository profTurmaRepository,
            AlunoRepository alunoRepository,
            ProfessorRepository professorRepository,
            UserRepository userRepository,
            ProvaRepository provaRepository,
            RespostaAlunoRepository respostaAlunoRepository
    ) {
        this.turmaRepository = turmaRepository;
        this.alunoTurmaRepository = alunoTurmaRepository;
        this.profTurmaRepository = profTurmaRepository;
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
        this.userRepository = userRepository;
        this.provaRepository = provaRepository;
        this.respostaAlunoRepository = respostaAlunoRepository;
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
    public List<TurmaResponse> findAll(
            boolean includeInactive,
            String currentUserEmail,
            boolean isAdmin,
            boolean isProfessor,
            boolean isAluno
    ) {
        List<Turma> turmas;

        if (isAdmin) {
            turmas = includeInactive
                    ? turmaRepository.findAllByOrderByCreatedAtDesc()
                    : turmaRepository.findByActiveTrueOrderByCreatedAtDesc();
        } else if (isProfessor) {
            Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);

            turmas = profTurmaRepository.findByProfessor_Id(currentProfessor.getId())
                    .stream()
                    .map(ProfTurma::getTurma)
                    .distinct()
                    .filter(turma -> includeInactive || turma.isActive())
                    .sorted(Comparator.comparing(Turma::getCreatedAt).reversed())
                    .toList();
        } else if (isAluno) {
            turmas = includeInactive
                    ? turmaRepository.findAllByOrderByCreatedAtDesc()
                    : turmaRepository.findByActiveTrueOrderByCreatedAtDesc();
        } else {
            throw new AccessDeniedException("Acesso negado.");
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

        if (isProfessorLinkedToTurma(professorId, turmaId)) {
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

        if (!isProfessorLinkedToTurma(professorId, turmaId)) {
            throw new BusinessException("Professor não está vinculado a esta turma.");
        }

        profTurmaRepository.deleteByProfessor_IdAndTurma_Id(professorId, turmaId);
        return toResponse(turma);
    }

    @Transactional
    public TurmaResponse enrollStudent(
            UUID turmaId,
            UUID alunoId,
            String currentUserEmail,
            boolean isAdmin,
            boolean isProfessor,
            boolean isAluno
    ) {
        Turma turma = findTurmaById(turmaId);
        validateTurmaIsActive(turma, "Turma desativada não aceita novas matrículas.");
        Aluno authorizedAluno = validateStudentEnrollmentAuthorization(
            turmaId,
            alunoId,
            currentUserEmail,
            isAdmin,
            isProfessor,
            isAluno
        );

        Aluno aluno = authorizedAluno != null
            ? authorizedAluno
            : alunoRepository.findById(alunoId)
            .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado."));

        if (alunoTurmaRepository.existsByAluno_IdAndTurma_Id(alunoId, turmaId)) {
            throw new BusinessException("Aluno já está matriculado nesta turma.");
        }

        addAlunoToTurma(aluno, turma);
        return toResponse(turma);
    }

    @Transactional
    public TurmaResponse unenrollStudent(
            UUID turmaId,
            UUID alunoId,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Turma turma = findTurmaById(turmaId);

        if (!isAdmin) {
            Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);
            if (!isProfessorLinkedToTurma(currentProfessor.getId(), turmaId)) {
                throw new AccessDeniedException("Acesso negado.");
            }
        }

        if (!alunoRepository.existsById(alunoId)) {
            throw new ResourceNotFoundException("Aluno não encontrado.");
        }

        if (!alunoTurmaRepository.existsByAluno_IdAndTurma_Id(alunoId, turmaId)) {
            throw new BusinessException("Aluno não está matriculado nesta turma.");
        }

        alunoTurmaRepository.deleteByAluno_IdAndTurma_Id(alunoId, turmaId);
        return toResponse(turma);
    }

    @Transactional(readOnly = true)
    public List<AlunoResponse> findStudents(UUID turmaId, String currentUserEmail, boolean isAdmin) {
        findTurmaById(turmaId);

        if (!isAdmin) {
            Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);
            if (!isProfessorLinkedToTurma(currentProfessor.getId(), turmaId)) {
                throw new AccessDeniedException("Acesso negado.");
            }
        }

        return listStudentsByTurmaId(turmaId);
    }

    @Transactional(readOnly = true)
    public List<AlunoResponse> findAvailableStudentsForEnrollment(
            UUID turmaId,
            String query,
            String currentUserEmail,
            boolean isAdmin
    ) {
        findTurmaById(turmaId);

        if (!isAdmin) {
            Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);
            if (!isProfessorLinkedToTurma(currentProfessor.getId(), turmaId)) {
                throw new AccessDeniedException("Acesso negado.");
            }
        }

        String normalizedQuery = query == null ? "" : query.trim().toLowerCase();

        return alunoRepository.findByUserActiveTrueOrderByCreatedAtDesc()
                .stream()
                .filter(aluno -> !alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), turmaId))
                .filter(aluno -> normalizedQuery.isBlank() || matchesAlunoSearch(aluno, normalizedQuery))
                .limit(20)
                .map(this::toAlunoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlunoResponse> findStudentsPublic(UUID turmaId) {
        findTurmaById(turmaId);
        return listStudentsByTurmaId(turmaId);
    }

    private List<AlunoResponse> listStudentsByTurmaId(UUID turmaId) {
        return alunoTurmaRepository.findByTurma_IdOrderByCreatedAtAsc(turmaId)
                .stream()
                .map(AlunoTurma::getAluno)
                .map(this::toAlunoResponse)
                .toList();
    }

    private boolean matchesAlunoSearch(Aluno aluno, String normalizedQuery) {
        User user = aluno.getUser();
        return containsIgnoreCase(user.getName(), normalizedQuery)
                || containsIgnoreCase(user.getEmail(), normalizedQuery)
                || containsIgnoreCase(aluno.getMatricula(), normalizedQuery);
    }

    private boolean containsIgnoreCase(String value, String normalizedQuery) {
        return value != null && value.toLowerCase().contains(normalizedQuery);
    }

    @Transactional(readOnly = true)
    public List<TurmaResponse> findTurmasByAluno(
            UUID alunoId,
            boolean includeInactive,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado."));

        if (!isAdmin) {
            Aluno currentAluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);
            if (!currentAluno.getId().equals(aluno.getId())) {
                throw new AccessDeniedException("Acesso negado.");
            }
        }

        return alunoTurmaRepository.findByAluno_Id(alunoId)
                .stream()
                .map(AlunoTurma::getTurma)
                .distinct()
                .filter(turma -> includeInactive || turma.isActive())
                .sorted(Comparator.comparing(Turma::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TurmaResumoResponse getResumoTurma(UUID turmaId, String currentUserEmail, boolean isAdmin) {
        Turma turma = findTurmaById(turmaId);
        validateTurmaAccess(turmaId, currentUserEmail, isAdmin);

        List<Prova> provas = provaRepository.findByTurmaIdAndStatus(turmaId, StatusProva.PUBLICADA);
        int totalAlunos = (int) alunoTurmaRepository.findByTurma_IdOrderByCreatedAtAsc(turmaId).stream().count();

        List<UUID> provaIds = provas.stream().map(Prova::getId).toList();
        List<RespostaAluno> todasRespostas = provaIds.isEmpty()
                ? List.of()
                : respostaAlunoRepository.findByProva_IdIn(provaIds);

        int totalRespostas = todasRespostas.size();

        BigDecimal mediaNota = todasRespostas.isEmpty() ? null
                : todasRespostas.stream()
                        .map(RespostaAluno::getNotaFinal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(totalRespostas), 2, RoundingMode.HALF_UP);

        Map<UUID, List<RespostaAluno>> respostasPorProva = todasRespostas.stream()
                .collect(Collectors.groupingBy(r -> r.getProva().getId()));

        List<MediaPorProvaItem> mediasPorProva = provas.stream()
                .map(prova -> {
                    List<RespostaAluno> provaRespostas = respostasPorProva.getOrDefault(prova.getId(), List.of());
                    int provaTotal = provaRespostas.size();
                    BigDecimal provaMedia = provaRespostas.isEmpty() ? null
                            : provaRespostas.stream()
                                    .map(RespostaAluno::getNotaFinal)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                                    .divide(BigDecimal.valueOf(provaTotal), 2, RoundingMode.HALF_UP);
                    return new MediaPorProvaItem(prova.getId(), prova.getTitulo(), prova.getDisciplina(), provaTotal, provaMedia);
                })
                .sorted(Comparator.comparing(MediaPorProvaItem::titulo))
                .toList();

        return new TurmaResumoResponse(
                turma.getId(),
                turma.getNome(),
                totalAlunos,
                provas.size(),
                totalRespostas,
                mediaNota,
                mediasPorProva
        );
    }

    @Transactional(readOnly = true)
    public boolean isProfessorLinkedToTurma(UUID professorId, UUID turmaId) {
        return profTurmaRepository.existsByProfessor_IdAndTurma_Id(professorId, turmaId);
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
        if (!isProfessorLinkedToTurma(currentProfessor.getId(), turmaId)) {
            throw new AccessDeniedException("Acesso negado.");
        }
    }

    private Aluno validateStudentEnrollmentAuthorization(
            UUID turmaId,
            UUID alunoId,
            String currentUserEmail,
            boolean isAdmin,
            boolean isProfessor,
            boolean isAluno
    ) {
        if (isAdmin) {
            return null;
        }

        if (isProfessor) {
            Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);
            if (!isProfessorLinkedToTurma(currentProfessor.getId(), turmaId)) {
                throw new AccessDeniedException("Acesso negado.");
            }
            return null;
        }

        if (isAluno) {
            Aluno currentAluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);
            if (!currentAluno.getId().equals(alunoId)) {
                throw new AccessDeniedException("Acesso negado.");
            }
            return currentAluno;
        }

        throw new AccessDeniedException("Acesso negado.");
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

    private Optional<Aluno> resolveCurrentAlunoByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .map(User::getId)
                .flatMap(alunoRepository::findByUserId);
    }

    private Aluno resolveCurrentAlunoRequiredByEmail(String email) {
        return resolveCurrentAlunoByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Acesso negado."));
    }

    private void addProfessorToTurma(Professor professor, Turma turma) {
        ProfTurma profTurma = new ProfTurma();
        profTurma.setProfessor(professor);
        profTurma.setTurma(turma);
        profTurmaRepository.save(profTurma);
    }

    private void addAlunoToTurma(Aluno aluno, Turma turma) {
        AlunoTurma alunoTurma = new AlunoTurma();
        alunoTurma.setAluno(aluno);
        alunoTurma.setTurma(turma);
        alunoTurmaRepository.save(alunoTurma);
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

    private AlunoResponse toAlunoResponse(Aluno aluno) {
        User user = aluno.getUser();
        return new AlunoResponse(
                aluno.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                aluno.getMatricula(),
                aluno.getSexo(),
                user.isActive(),
                aluno.getCreatedAt()
        );
    }
}
