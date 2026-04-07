package br.com.ilumina.service.Aluno;

import br.com.ilumina.dto.aluno.AlunoResponse;
import br.com.ilumina.dto.aluno.CreateAlunoRequest;
import br.com.ilumina.dto.aluno.CreateAlunoResponse;
import br.com.ilumina.dto.aluno.UpdateAlunoRequest;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.exception.BusinessException;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.User.RoleRepository;
import br.com.ilumina.repository.User.UserRepository;
import br.com.ilumina.security.JwtTokenService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlunoService {

    private static final String ROLE_ALUNO = "ROLE_ALUNO";

    private final AlunoRepository alunoRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AlunoService(
            AlunoRepository alunoRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService
    ) {
        this.alunoRepository = alunoRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public CreateAlunoResponse create(CreateAlunoRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DataIntegrityViolationException("Email já cadastrado.");
        }

        UserRole alunoRole = roleRepository.findUserRoleByName(ROLE_ALUNO)
                .orElseThrow(() -> new IllegalStateException("Perfil ROLE_ALUNO não encontrado."));

        User user = new User();
        user.setName(normalizeRequired(request.name(), "O nome é obrigatório."));
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setRoles(Set.of(alunoRole));

        User savedUser = userRepository.save(user);

        Aluno aluno = new Aluno();
        aluno.setUser(savedUser);
        aluno.setMatricula(normalizeRequired(request.matricula(), "A matrícula é obrigatória."));
        aluno.setSexo(normalizeRequired(request.sexo(), "O sexo/gênero é obrigatório."));

        Aluno savedAluno = alunoRepository.save(aluno);

        Set<String> roles = savedUser.getRoles().stream()
                .map(UserRole::getName)
                .collect(Collectors.toSet());

        String accessToken = jwtTokenService.generateAccessToken(
                savedUser.getEmail(),
                savedUser.getId(),
                roles.stream().toList(),
                null,
                savedAluno.getId()
        );

        String refreshToken = jwtTokenService.generateRefreshToken(savedUser.getEmail(), savedUser.getId());

        return toCreateResponse(savedAluno, accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public List<AlunoResponse> findAll(boolean includeInactive) {
        List<Aluno> alunos = includeInactive
                ? alunoRepository.findAllByOrderByCreatedAtDesc()
                : alunoRepository.findByUserActiveTrueOrderByCreatedAtDesc();

        return alunos.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlunoResponse findById(UUID alunoId, String currentUserEmail, boolean isAdmin) {
        Aluno aluno = findAlunoById(alunoId);
        validateAlunoAccess(aluno, currentUserEmail, isAdmin);
        return toResponse(aluno);
    }

    @Transactional
    public AlunoResponse update(
            UUID alunoId,
            UpdateAlunoRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Aluno aluno = findAlunoById(alunoId);
        validateAlunoAccess(aluno, currentUserEmail, isAdmin);

        User user = aluno.getUser();

        if (request.name() != null) {
            user.setName(normalizeRequired(request.name(), "O nome não pode ser vazio."));
        }

        if (request.matricula() != null) {
            String normalizedMatricula = normalizeRequired(request.matricula(), "A matrícula não pode ser vazia.");
            if (!normalizedMatricula.equalsIgnoreCase(aluno.getMatricula())
                    && alunoRepository.existsByMatricula(normalizedMatricula)) {
                throw new DataIntegrityViolationException("Matrícula já cadastrada.");
            }
            aluno.setMatricula(normalizedMatricula);
        }

        if (request.sexo() != null) {
            aluno.setSexo(normalizeRequired(request.sexo(), "O sexo/gênero não pode ser vazio."));
        }

        userRepository.save(user);
        Aluno updatedAluno = alunoRepository.save(aluno);
        return toResponse(updatedAluno);
    }

    @Transactional
    public AlunoResponse deactivate(UUID alunoId) {
        Aluno aluno = findAlunoById(alunoId);
        User user = aluno.getUser();

        if (!user.isActive()) {
            throw new BusinessException("Aluno já está desativado.");
        }

        user.setActive(false);
        userRepository.save(user);

        return toResponse(aluno);
    }

    private Aluno findAlunoById(UUID alunoId) {
        return alunoRepository.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado."));
    }

    private void validateAlunoAccess(Aluno aluno, String currentUserEmail, boolean isAdmin) {
        if (isAdmin) {
            return;
        }

        if (currentUserEmail == null || !aluno.getUser().getEmail().equalsIgnoreCase(currentUserEmail)) {
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

    private AlunoResponse toResponse(Aluno aluno) {
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

    private CreateAlunoResponse toCreateResponse(
            Aluno aluno,
            String accessToken,
            String refreshToken
    ) {
        User user = aluno.getUser();
        return new CreateAlunoResponse(
                aluno.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                aluno.getMatricula(),
                aluno.getSexo(),
                user.isActive(),
                aluno.getCreatedAt(),
                accessToken,
                refreshToken,
                "Bearer",
                user.getRoles().stream().map(UserRole::getName).collect(Collectors.toSet())
        );
    }
}
