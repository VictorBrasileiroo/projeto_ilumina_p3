package br.com.ilumina.controller.Professor;

import br.com.ilumina.dto.professor.CreateProfessorRequest;
import br.com.ilumina.dto.professor.CreateProfessorResponse;
import br.com.ilumina.dto.professor.ProfessorResponse;
import br.com.ilumina.dto.professor.UpdateProfessorRequest;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.service.Professor.ProfessorService;
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
@RequestMapping("/api/v1/professor")
public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateProfessorResponse>> create(
            @Valid @RequestBody CreateProfessorRequest request,
            HttpServletRequest servletRequest
    ) {
        CreateProfessorResponse response = professorService.create(request);

        ApiResponse<CreateProfessorResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Professor criado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
        @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<ProfessorResponse>>> findAll(
            @RequestParam(defaultValue = "false") boolean includeInactive,
            HttpServletRequest servletRequest
    ) {
        List<ProfessorResponse> response = professorService.findAll(includeInactive);

        ApiResponse<List<ProfessorResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Professores listados com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
        @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ProfessorResponse>> findById(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProfessorResponse response = professorService.findById(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<ProfessorResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Professor encontrado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
        @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ProfessorResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProfessorRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProfessorResponse response = professorService.update(id, request, authentication.getName(), isAdmin(authentication));

        ApiResponse<ProfessorResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Professor atualizado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
        @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ProfessorResponse>> deactivate(
            @PathVariable UUID id,
            HttpServletRequest servletRequest
    ) {
        ProfessorResponse response = professorService.deactivate(id);

        ApiResponse<ProfessorResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Professor desativado com sucesso.",
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
