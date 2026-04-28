package br.com.ilumina.controller.Prova;

import br.com.ilumina.dto.prova.AlunoProvaResumoResponse;
import br.com.ilumina.dto.prova.ProvaAlunoResponse;
import br.com.ilumina.dto.prova.ProvaDetalheAlunoResponse;
import br.com.ilumina.dto.prova.ResultadoProvaResponse;
import br.com.ilumina.dto.prova.SubmissaoRespostasRequest;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.service.Prova.AlunoProvaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/aluno/provas")
@SecurityRequirement(name = "bearerAuth")
public class AlunoProvaController {

    private final AlunoProvaService alunoProvaService;

    public AlunoProvaController(AlunoProvaService alunoProvaService) {
        this.alunoProvaService = alunoProvaService;
    }

    @GetMapping("/resumo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    public ResponseEntity<ApiResponse<AlunoProvaResumoResponse>> getResumoAluno(
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        AlunoProvaResumoResponse response = alunoProvaService.getResumoAluno(authentication.getName());

        ApiResponse<AlunoProvaResumoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Resumo do aluno obtido com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    public ResponseEntity<ApiResponse<List<ProvaAlunoResponse>>> listarProvas(
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        List<ProvaAlunoResponse> response = alunoProvaService.listarProvasParaAluno(authentication.getName());

        ApiResponse<List<ProvaAlunoResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Provas do aluno listadas com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    public ResponseEntity<ApiResponse<ProvaDetalheAlunoResponse>> detalharProva(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProvaDetalheAlunoResponse response = alunoProvaService.detalharProvaParaAluno(id, authentication.getName());

        ApiResponse<ProvaDetalheAlunoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Prova detalhada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PostMapping("/{id}/respostas")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    public ResponseEntity<ApiResponse<ResultadoProvaResponse>> submeterRespostas(
            @PathVariable UUID id,
            @Valid @RequestBody SubmissaoRespostasRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ResultadoProvaResponse response = alunoProvaService.submeterRespostas(id, authentication.getName(), request);

        ApiResponse<ResultadoProvaResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Respostas submetidas com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}/resultado")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    public ResponseEntity<ApiResponse<ResultadoProvaResponse>> consultarResultado(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ResultadoProvaResponse response = alunoProvaService.consultarResultado(id, authentication.getName());

        ApiResponse<ResultadoProvaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Resultado consultado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }
}
