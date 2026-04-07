package br.com.ilumina.repository.Turma;

import br.com.ilumina.entity.Turma.AlunoTurma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlunoTurmaRepository extends JpaRepository<AlunoTurma, UUID> {
    boolean existsByAluno_IdAndTurma_Id(UUID alunoId, UUID turmaId);
    List<AlunoTurma> findByAluno_Id(UUID alunoId);
    List<AlunoTurma> findByTurma_IdOrderByCreatedAtAsc(UUID turmaId);
    long deleteByAluno_IdAndTurma_Id(UUID alunoId, UUID turmaId);
}
