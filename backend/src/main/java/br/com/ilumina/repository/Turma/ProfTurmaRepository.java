package br.com.ilumina.repository.Turma;

import br.com.ilumina.entity.Turma.ProfTurma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProfTurmaRepository extends JpaRepository<ProfTurma, UUID> {
    boolean existsByProfessor_IdAndTurma_Id(UUID professorId, UUID turmaId);
    List<ProfTurma> findByProfessor_Id(UUID professorId);
    List<ProfTurma> findByTurma_IdOrderByCreatedAtAsc(UUID turmaId);
    long deleteByProfessor_IdAndTurma_Id(UUID professorId, UUID turmaId);
}
