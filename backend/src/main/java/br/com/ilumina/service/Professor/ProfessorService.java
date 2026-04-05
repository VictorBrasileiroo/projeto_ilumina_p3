package br.com.ilumina.service.Professor;

import br.com.ilumina.dto.professor.CreateProfessorRequest;
import br.com.ilumina.dto.professor.ProfessorResponse;
import br.com.ilumina.dto.professor.UpdateProfessorRequest;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.exception.BusinessException;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.User.RoleRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfessorService {

    private static final String ROLE_PROFESSOR = "ROLE_PROFESSOR";

    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfessorService(
            ProfessorRepository professorRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.professorRepository = professorRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ProfessorResponse create(CreateProfessorRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DataIntegrityViolationException("Email já cadastrado.");
        }

        UserRole professorRole = roleRepository.findUserRoleByName(ROLE_PROFESSOR)
                .orElseThrow(() -> new IllegalStateException("Perfil ROLE_PROFESSOR não encontrado."));

        User user = new User();
        user.setName(normalizeRequired(request.name(), "O nome é obrigatório."));
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setRoles(Set.of(professorRole));

        User savedUser = userRepository.save(user);

        Professor professor = new Professor();
        professor.setUser(savedUser);
        professor.setDisciplina(normalizeRequired(request.disciplina(), "A disciplina é obrigatória."));
        professor.setSexo(normalizeRequired(request.sexo(), "O sexo/gênero é obrigatório."));

        Professor savedProfessor = professorRepository.save(professor);
        return toResponse(savedProfessor);
    }

    @Transactional(readOnly = true)
    public List<ProfessorResponse> findAll(boolean includeInactive) {
        List<Professor> professores = includeInactive
                ? professorRepository.findAllByOrderByCreatedAtDesc()
                : professorRepository.findByUserActiveTrueOrderByCreatedAtDesc();

        return professores.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfessorResponse findById(UUID professorId, String currentUserEmail, boolean isAdmin) {
        Professor professor = findProfessorById(professorId);
        validateProfessorAccess(professor, currentUserEmail, isAdmin);
        return toResponse(professor);
    }

    @Transactional
    public ProfessorResponse update(
            UUID professorId,
            UpdateProfessorRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Professor professor = findProfessorById(professorId);
        validateProfessorAccess(professor, currentUserEmail, isAdmin);

        User user = professor.getUser();

        if (request.name() != null) {
            user.setName(normalizeRequired(request.name(), "O nome não pode ser vazio."));
        }

        if (request.email() != null) {
            String normalizedEmail = normalizeEmail(request.email());
            if (!normalizedEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(normalizedEmail)) {
                throw new DataIntegrityViolationException("Email já cadastrado.");
            }
            user.setEmail(normalizedEmail);
        }

        if (request.disciplina() != null) {
            professor.setDisciplina(normalizeRequired(request.disciplina(), "A disciplina não pode ser vazia."));
        }

        if (request.sexo() != null) {
            professor.setSexo(normalizeRequired(request.sexo(), "O sexo/gênero não pode ser vazio."));
        }

        userRepository.save(user);
        Professor updatedProfessor = professorRepository.save(professor);
        return toResponse(updatedProfessor);
    }

    @Transactional
    public ProfessorResponse deactivate(UUID professorId) {
        Professor professor = findProfessorById(professorId);
        User user = professor.getUser();

        if (!user.isActive()) {
            throw new BusinessException("Professor já está desativado.");
        }

        user.setActive(false);
        userRepository.save(user);

        return toResponse(professor);
    }

    private Professor findProfessorById(UUID professorId) {
        return professorRepository.findById(professorId)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado."));
    }

    private void validateProfessorAccess(Professor professor, String currentUserEmail, boolean isAdmin) {
        if (isAdmin) {
            return;
        }

        if (currentUserEmail == null || !professor.getUser().getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new AccessDeniedException("Acesso negado.");
        }
    }

    private String normalizeEmail(String email) {
        return normalizeRequired(email, "O email é obrigatório.").toLowerCase();
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private ProfessorResponse toResponse(Professor professor) {
        User user = professor.getUser();
        return new ProfessorResponse(
                professor.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                professor.getDisciplina(),
                professor.getSexo(),
                user.isActive(),
                professor.getCreatedAt()
        );
    }
}
