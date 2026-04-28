package br.com.ilumina.service.Auth;

import br.com.ilumina.dto.auth.AuthResponse;
import br.com.ilumina.dto.auth.LoginRequest;
import br.com.ilumina.dto.auth.RegisterRequest;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.entity.User.UserRole;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.User.RoleRepository;
import br.com.ilumina.repository.User.UserRepository;
import br.com.ilumina.security.JwtTokenService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthSeervice {

    private final UserRepository userRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;

    public AuthSeervice(
            UserRepository userRepository,
            AlunoRepository alunoRepository,
            ProfessorRepository professorRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenService jwtTokenService
    ) {
        this.userRepository = userRepository;
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
    }

    public AuthResponse register(RegisterRequest request){
        String normalizedEmail = normalizeEmail(request.email());

        if(userRepository.existsByEmail(normalizedEmail)){
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        String normalizeRole = normalizeRole(request.role());

        UserRole role = roleRepository.findUserRoleByName(normalizeRole)
                .orElseThrow(() -> new IllegalArgumentException("Perfil inválido: " + normalizeRole));

        User user = new User();
        user.setName(request.name());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setRoles(Set.of(role));

        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request){
        String normalizedEmail = normalizeEmail(request.email());

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        try {
            String rawUserId = jwtTokenService.extractUserId(refreshToken);

            if (rawUserId == null) {
                throw new BadCredentialsException("Refresh token inválido.");
            }

            UUID userId = UUID.fromString(rawUserId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BadCredentialsException("Refresh token inválido."));

            if (!user.isActive()) {
                throw new BadCredentialsException("Usuário inativo.");
            }

            if (!jwtTokenService.isRefreshTokenValid(refreshToken, user.getEmail(), user.getId())) {
                throw new BadCredentialsException("Refresh token inválido.");
            }

            return buildAuthResponse(user);
        } catch (RuntimeException ex) {
            throw new BadCredentialsException("Refresh token inválido.", ex);
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(UserRole::getName)
                .collect(java.util.stream.Collectors.toSet());

        UUID professorId = resolveProfessorId(user.getId());
        UUID alunoId = resolveAlunoId(user.getId());

        String accessToken = jwtTokenService.generateAccessToken(
                user.getEmail(),
                user.getId(),
                List.copyOf(roles),
                professorId,
                alunoId
        );

        String refreshToken = jwtTokenService.generateRefreshToken(user.getEmail(), user.getId());

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                user.getId(),
                professorId,
                alunoId,
                user.getName(),
                user.getEmail(),
                roles
        );
    }

    private UUID resolveProfessorId(UUID userId) {
        return professorRepository.findByUserId(userId)
                .map(Professor::getId)
                .orElse(null);
    }

    private UUID resolveAlunoId(UUID userId) {
        return alunoRepository.findByUserId(userId)
                .map(Aluno::getId)
                .orElse(null);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeRole(String role) {
        String value = role.trim().toUpperCase();
        if (!value.startsWith("ROLE_")) {
            value = "ROLE_" + value;
        }
        return value;
    }
}
