package br.com.ilumina.controller.Turma;

import br.com.ilumina.dto.aluno.AlunoResponse;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.dto.turma.CreateTurmaRequest;
import br.com.ilumina.dto.turma.TurmaAlunoVinculoRequest;
import br.com.ilumina.dto.turma.TurmaResponse;
import br.com.ilumina.dto.turma.TurmaVinculoRequest;
import br.com.ilumina.dto.turma.UpdateTurmaRequest;
import br.com.ilumina.service.Turma.TurmaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/turmas")
@SecurityRequirement(name = "bearerAuth")
public class TurmaController {

    private final TurmaService turmaService;

    public TurmaController(TurmaService turmaService) {
        this.turmaService = turmaService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<TurmaResponse>> create(
            @Valid @RequestBody CreateTurmaRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.create(request, authentication.getName(), isAdmin(authentication));

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Turma criada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
        @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'ALUNO')")
    public ResponseEntity<ApiResponse<List<TurmaResponse>>> findAll(
            @RequestParam(defaultValue = "false") boolean includeInactive,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
                List<TurmaResponse> response = turmaService.findAll(
                                includeInactive,
                                authentication.getName(),
                                isAdmin(authentication),
                                hasRole(authentication, "ROLE_PROFESSOR"),
                                hasRole(authentication, "ROLE_ALUNO")
                );

        ApiResponse<List<TurmaResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Turmas listadas com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<TurmaResponse>> findById(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.findById(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Turma encontrada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<TurmaResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTurmaRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.update(id, request, authentication.getName(), isAdmin(authentication));

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Turma atualizada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<TurmaResponse>> deactivate(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.deactivate(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Turma desativada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<TurmaResponse>> join(
            @PathVariable UUID id,
            @Valid @RequestBody TurmaVinculoRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.join(id, request.professorId(), authentication.getName());

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Professor vinculado à turma com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/{id}/leave")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<TurmaResponse>> leave(
            @PathVariable UUID id,
            @RequestParam UUID professorId,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.leave(id, professorId, authentication.getName());

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Professor desvinculado da turma com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PostMapping("/{id}/matriculas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'ALUNO')")
    public ResponseEntity<ApiResponse<TurmaResponse>> enrollStudent(
            @PathVariable UUID id,
            @Valid @RequestBody TurmaAlunoVinculoRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.enrollStudent(
                id,
                request.alunoId(),
                authentication.getName(),
                isAdmin(authentication),
                hasRole(authentication, "ROLE_PROFESSOR"),
                hasRole(authentication, "ROLE_ALUNO")
        );

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Aluno matriculado na turma com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

        @DeleteMapping("/{id}/matriculas/{alunoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<TurmaResponse>> unenrollStudent(
            @PathVariable UUID id,
            @PathVariable UUID alunoId,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        TurmaResponse response = turmaService.unenrollStudent(
                id,
                alunoId,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<TurmaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Aluno desmatriculado da turma com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

        @GetMapping("/{id}/matriculas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<List<AlunoResponse>>> findStudents(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        List<AlunoResponse> response = turmaService.findStudents(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<List<AlunoResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Alunos da turma listados com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

        @GetMapping("/{id}/matriculas/publico")
        public ResponseEntity<ApiResponse<List<AlunoResponse>>> findStudentsPublic(
                        @PathVariable UUID id,
                        HttpServletRequest servletRequest
        ) {
                List<AlunoResponse> response = turmaService.findStudentsPublic(id);

                ApiResponse<List<AlunoResponse>> body = ApiResponse.sucess(
                                HttpStatus.OK.value(),
                                "Alunos da turma listados com sucesso.",
                                response,
                                servletRequest.getRequestURI()
                );

                return ResponseEntity.ok(body);
        }

    private boolean isAdmin(Authentication authentication) {
        return hasRole(authentication, "ROLE_ADMIN");
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals(role));
    }
}
