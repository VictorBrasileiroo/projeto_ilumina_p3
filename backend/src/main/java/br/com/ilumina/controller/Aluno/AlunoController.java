package br.com.ilumina.controller.Aluno;

import br.com.ilumina.dto.aluno.AlunoResponse;
import br.com.ilumina.dto.aluno.CreateAlunoRequest;
import br.com.ilumina.dto.aluno.CreateAlunoResponse;
import br.com.ilumina.dto.aluno.UpdateAlunoRequest;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.dto.turma.TurmaResponse;
import br.com.ilumina.service.Aluno.AlunoService;
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
@RequestMapping("/api/v1/aluno")
public class AlunoController {

    private final AlunoService alunoService;
        private final TurmaService turmaService;

        public AlunoController(AlunoService alunoService, TurmaService turmaService) {
        this.alunoService = alunoService;
                this.turmaService = turmaService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateAlunoResponse>> create(
            @Valid @RequestBody CreateAlunoRequest request,
            HttpServletRequest servletRequest
    ) {
        CreateAlunoResponse response = alunoService.create(request);

        ApiResponse<CreateAlunoResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Aluno criado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<AlunoResponse>>> findAll(
            @RequestParam(defaultValue = "false") boolean includeInactive,
            HttpServletRequest servletRequest
    ) {
        List<AlunoResponse> response = alunoService.findAll(includeInactive);

        ApiResponse<List<AlunoResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Alunos listados com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<AlunoResponse>> findById(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        AlunoResponse response = alunoService.findById(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<AlunoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Aluno encontrado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<AlunoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAlunoRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        AlunoResponse response = alunoService.update(id, request, authentication.getName(), isAdmin(authentication));

        ApiResponse<AlunoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Aluno atualizado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<AlunoResponse>> deactivate(
            @PathVariable UUID id,
            HttpServletRequest servletRequest
    ) {
        AlunoResponse response = alunoService.deactivate(id);

        ApiResponse<AlunoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Aluno desativado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}/turmas")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<TurmaResponse>>> findTurmasByAluno(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean includeInactive,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        List<TurmaResponse> response = turmaService.findTurmasByAluno(
                id,
                includeInactive,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<List<TurmaResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Turmas do aluno listadas com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
